import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0"; // Use appropriate version

// CORS headers (might not be strictly necessary if only called internally by pg_net, but good practice)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Adjust if needed for security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- Environment Variables ---
// Service Role Key for database updates
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
// Gemini API Key for embedding generation
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
// Optional internal API key for securing this endpoint
const internalApiKey = Deno.env.get("INTERNAL_API_KEY"); // Make sure to set this in Supabase secrets

// --- Supabase Client (Service Role) ---
// Use service role key to bypass RLS for updates
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper Function: Generate Embedding ---
// Copied from original process-for-rag, could be moved to a shared module later
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    // Check if the text is too long for the embedding API
    if (text.length > 20000) {
      console.log(`Text is too long (${text.length} chars), truncating to 20000 chars`);
      text = text.substring(0, 20000);
    }
    
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [
              {
                text: text,
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Embedding API error: ${response.status} ${errorText}`);
      throw new Error(`Embedding API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    if (!data.embedding || !data.embedding.values) {
        console.error("Invalid embedding response structure:", data);
        throw new Error("Invalid response structure from embedding API");
    }
    return data.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Re-throw the original error or a new one with context
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// --- Main Function Handler ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Security Check (Optional but Recommended) ---
    if (internalApiKey) {
      const providedInternalKey = req.headers.get('X-Internal-Api-Key');
      if (!providedInternalKey || providedInternalKey !== internalApiKey) {
        console.error("Forbidden: Invalid internal API key.");
        return new Response(JSON.stringify({ success: false, error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // --- Input Validation ---
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!geminiApiKey) {
      console.error("Missing Gemini API key configuration on server.");
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error: Missing embedding API key.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = await req.json();
    const { chunk_id, document_id, text } = payload;

    if (!chunk_id || !document_id || !text) {
      console.error("Invalid payload received:", payload);
      return new Response(JSON.stringify({ success: false, error: 'Invalid payload: Missing chunk_id, document_id, or text.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Received request to generate embedding for chunk ${chunk_id} (Doc: ${document_id})`);

    // --- Embedding Generation ---
    let embeddingVector: number[] | null = null;
    let embeddingError: string | null = null;

    try {
      embeddingVector = await generateEmbedding(text, geminiApiKey);
      console.log(`Successfully generated embedding for chunk ${chunk_id}`);
    } catch (genError) {
      embeddingError = genError instanceof Error ? genError.message : String(genError);
      console.error(`Failed to generate embedding for chunk ${chunk_id}: ${embeddingError}`);
      // Don't throw here, we want to update the DB status to 'failed'
    }

    // --- Database Update ---
    let dbError: any = null; // Explicitly type as any to handle Supabase error type
    if (embeddingVector) {
      // Update with embedding and set status to 'completed'
      const { error } = await supabaseAdmin
        .from('rag_chunks')
        .update({ 
            embedding: embeddingVector, 
            embedding_status: 'completed',
            embedding_error: null // Clear any previous error
        })
        .match({ chunk_id: chunk_id, document_id: document_id });
      dbError = error;
    } else {
      // Update status to 'failed' and store the error message
      const { error } = await supabaseAdmin
        .from('rag_chunks')
        .update({ 
            embedding_status: 'failed',
            embedding_error: embeddingError 
        })
        .match({ chunk_id: chunk_id, document_id: document_id });
      dbError = error;
    }

    if (dbError) {
      console.error(`Failed to update chunk ${chunk_id} status in DB:`, dbError);
      const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      // Even if DB update fails, the trigger won't retry automatically.
      // Consider logging this prominently or implementing a retry mechanism if critical.
      return new Response(JSON.stringify({ success: false, error: `Database update failed: ${dbErrorMessage}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Successfully updated DB status for chunk ${chunk_id} to '${embeddingVector ? 'completed' : 'failed'}'`);

    // --- Return Success ---
    // pg_net doesn't typically use the response, but returning success is good practice.
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    // General catch block for unexpected errors (e.g., JSON parsing)
    console.error('Unexpected error in generate-single-embedding:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: `Unexpected error: ${errorMessage}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});