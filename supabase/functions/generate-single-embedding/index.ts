
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0"; // Use appropriate version

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Environment Variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const internalApiKey = Deno.env.get("INTERNAL_API_KEY"); // Optional internal API key

// Supabase Client (Service Role)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper Function: Generate Embedding
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  try {
    // Check if the text is too long for the embedding API
    if (text.length > 25000) {
      console.log(`Text is too long (${text.length} chars), truncating to 25000 chars`);
      text = text.substring(0, 25000);
    }
    
    // Ensure text is not empty
    if (!text.trim()) {
      throw new Error("Cannot generate embedding for empty text");
    }
    
    console.log(`Generating embedding for text (length: ${text.length} chars)`);
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
    
    console.log(`Successfully generated embedding with ${data.embedding.values.length} dimensions`);
    return data.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Main Function Handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input Validation
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (!geminiApiKey) {
      console.error("Missing Gemini API key configuration on server.");
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Server configuration error: Missing embedding API key.' 
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Parse the request payload
    const payload = await req.json();
    
    // Check if this is a direct chunk_id request or a document processing request
    if (payload.chunk_id && payload.document_id) {
      // Direct single chunk processing
      const { chunk_id, document_id, text } = payload;

      if (!chunk_id || !document_id || !text) {
        console.error("Invalid payload received:", payload);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid payload: Missing chunk_id, document_id, or text.' 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      console.log(`Processing embedding for chunk ${chunk_id} (Doc: ${document_id})`);

      // Embedding Generation
      let embeddingVector: number[] | null = null;
      let embeddingError: string | null = null;

      try {
        embeddingVector = await generateEmbedding(text, geminiApiKey);
      } catch (genError) {
        embeddingError = genError instanceof Error ? genError.message : String(genError);
        console.error(`Failed to generate embedding for chunk ${chunk_id}: ${embeddingError}`);
      }

      // Database Update
      let dbError: any = null;
      if (embeddingVector) {
        // Update with embedding and set status to 'completed'
        const { error } = await supabaseAdmin
          .from('rag_chunks')
          .update({ 
              embedding: embeddingVector, 
              embedding_status: 'completed',
              embedding_error: null,
              updated_at: new Date().toISOString()
          })
          .eq('chunk_id', chunk_id)
          .eq('document_id', document_id);
        
        dbError = error;
      } else {
        // Update status to 'failed' and store the error message
        const { error } = await supabaseAdmin
          .from('rag_chunks')
          .update({ 
              embedding_status: 'failed',
              embedding_error: embeddingError,
              updated_at: new Date().toISOString()
          })
          .eq('chunk_id', chunk_id)
          .eq('document_id', document_id);
        
        dbError = error;
      }

      if (dbError) {
        console.error(`Failed to update chunk ${chunk_id} status in DB:`, dbError);
        const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Database update failed: ${dbErrorMessage}` 
        }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      console.log(`Updated DB status for chunk ${chunk_id} to '${embeddingVector ? 'completed' : 'failed'}'`);

      // Return Success
      return new Response(JSON.stringify({ 
        success: true,
        chunk_id,
        status: embeddingVector ? 'completed' : 'failed'
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    } else {
      // This endpoint only handles direct chunk processing
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid request format. This endpoint requires chunk_id, document_id, and text parameters.' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  } catch (error) {
    // General catch block for unexpected errors
    console.error('Unexpected error in generate-single-embedding:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unexpected error: ${errorMessage}` 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
