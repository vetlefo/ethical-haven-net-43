import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.20.0"; // Use appropriate version

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Restrict in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- Environment Variables ---
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY"); // Use Anon key for user-context client

// --- Helper Function: Generate Embedding ---
// Assumes the same embedding model as used for chunking
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  if (!apiKey) throw new Error("Server configuration error: Missing Gemini API Key for embedding generation.");
  
  try {
    // Truncate long text if necessary (adjust limit as needed)
    if (text.length > 20000) {
      console.warn(`Query/Text is long (${text.length} chars), truncating.`);
      text = text.substring(0, 20000);
    }
    
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { parts: [{ text }] } }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Embedding API error: ${response.status} ${errorText}`);
      throw new Error(`Embedding API error: ${response.status}`); // Avoid leaking detailed error text
    }

    const data = await response.json();
    if (!data.embedding?.values) {
        console.error("Invalid embedding response structure:", data);
        throw new Error("Invalid response structure from embedding API");
    }
    return data.embedding.values;

  } catch (error) {
    console.error("Error in generateEmbedding:", error);
    // Re-throw a generic error or the specific error if needed downstream
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// --- Main Function Handler ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client scoped to the request
  const supabaseClient: SupabaseClient = createClient(
    supabaseUrl ?? '',
    supabaseAnonKey ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  try {
    // --- Basic Validation & Setup ---
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!geminiApiKey) {
      console.error("Missing Gemini API key configuration on server.");
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Missing Supabase URL or Anon Key configuration on server.");
        return new Response(JSON.stringify({ success: false, error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Parse request body for query and optional filters
    const {
      query,
      category: filter_category, // Rename for clarity matching SQL function param
      regulation: filter_regulation,
      country: filter_country
    } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Missing or invalid query parameter' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log("Received RAG search query:", query);

    // --- Step 1: Generate Query Embedding ---
    console.log("Generating query embedding...");
    const queryEmbedding = await generateEmbedding(query, geminiApiKey);
    console.log("Query embedding generated.");

    // --- Step 2: Perform Vector Search via RPC ---
    // Assumes you have created the 'match_rag_chunks' function in SQL
    console.log("Performing vector search...");
    const matchThreshold = 0.75; // Adjust as needed
    const matchCount = 5;       // Adjust as needed

    const { data: chunks, error: rpcError } = await supabaseClient.rpc('match_rag_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      // Pass filter parameters (will be null if not provided in request body)
      filter_category: filter_category || null,
      filter_regulation: filter_regulation || null,
      filter_country: filter_country || null,
    });

    if (rpcError) {
      console.error("Database RPC error:", rpcError);
      throw new Error(`Database search error: ${rpcError.message}`);
    }

    if (!chunks || chunks.length === 0) {
      console.log("No relevant chunks found.");
      return new Response(JSON.stringify({ success: true, answer: "Sorry, I couldn't find any relevant information for your query.", sources: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`Found ${chunks.length} relevant chunks.`);

    // --- Step 3: Construct Context and Prompt for Synthesis ---
    const contextText = chunks.map((chunk: any) => `- ${chunk.text}`).join("\n"); // Basic context formatting

    const synthesisPrompt = `
      User Query: "${query}"

      Context from relevant documents:
      ${contextText}

      Based *only* on the provided context, answer the user query concisely. Do not use any prior knowledge. If the context does not contain the answer, state that clearly.
    `;

    // --- Step 4: Call Gemini Pro for Synthesis ---
    console.log("Synthesizing answer with Gemini Pro...");
    const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"; // Use appropriate model
    
    const geminiRequest = {
      contents: [{ role: "user", parts: [{ text: synthesisPrompt }] }],
      generation_config: {
        temperature: 0.1, // Low temperature for factual synthesis
        max_output_tokens: 1024 // Adjust as needed
      }
    };

    const geminiResponse = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequest)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini synthesis API error:", errorText);
      throw new Error(`Gemini synthesis API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    let synthesizedAnswer = "Sorry, I could not generate an answer based on the available information."; // Default fallback
    if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
      synthesizedAnswer = geminiData.candidates[0].content.parts[0].text;
    } else {
       console.warn("Could not extract synthesized answer from Gemini response:", geminiData);
    }
    console.log("Answer synthesized.");

    // --- Step 5: Format and Return Response ---
    const sources = chunks.map((chunk: any) => ({
        document_id: chunk.document_id,
        chunk_id: chunk.chunk_id,
        similarity: chunk.similarity // Include similarity score
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        answer: synthesizedAnswer,
        sources: sources 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in RAG search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});