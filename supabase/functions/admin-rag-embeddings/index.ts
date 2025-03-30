
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

// Get admin key from environment variables
const ADMIN_KEY = Deno.env.get("ADMIN_API_KEY") || "compliance-admin-key-2023";
// Get Gemini API key from environment variables
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Create a Supabase client with the service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      console.error("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed. Only POST requests are supported.'
        }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify admin key
    const adminKey = req.headers.get('Admin-Key');
    if (!adminKey || adminKey !== ADMIN_KEY) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Unauthorized. Invalid admin key." 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const ragData = await req.json();
    
    // Validate the document structure
    if (!ragData.documentId || !ragData.chunks || !Array.isArray(ragData.chunks)) {
      console.error("Invalid RAG document structure received:", ragData);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid RAG document structure. Required fields: documentId, chunks (array).'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Storing RAG document ID ${ragData.documentId} with ${ragData.chunks.length} chunks (embeddings will be generated async)...`);
    
    // First, store the document metadata
    const { error: docError } = await supabase
      .from('rag_documents')
      .upsert({
        document_id: ragData.documentId,
        title: ragData.metadata?.title || 'Untitled Document',
        summary: ragData.metadata?.summary,
        author: ragData.metadata?.author,
        date: ragData.metadata?.date,
        categories: ragData.metadata?.categories,
        regulations: ragData.metadata?.regulations,
        country: ragData.metadata?.country,
        region: ragData.metadata?.region,
        updated_at: new Date().toISOString()
      });
    
    if (docError) {
      console.error('Error storing document metadata:', docError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to store document metadata: ${docError.message}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Then store each chunk, setting embedding to NULL.
    // The DB trigger will handle calling the embedding function asynchronously.
    const chunkInsertPromises = ragData.chunks.map(chunk => {
      // Ensure chunk.id exists, generate if needed (though frontend should ideally provide)
      const chunk_id = chunk.id || `chunk-${ragData.documentId}-${chunk.metadata?.position || Math.random().toString(36).substring(2)}`;
      return supabase
        .from('rag_chunks')
        .upsert({
          document_id: ragData.documentId,
          chunk_id: chunk_id,
          text: chunk.text,
          section: chunk.metadata?.section,
          position: chunk.metadata?.position,
          source: chunk.metadata?.source,
          embedding: null, // Set embedding to null initially
          embedding_status: 'pending' // Explicitly set status (or rely on DB default)
        }, { onConflict: 'document_id, chunk_id' }); // Specify conflict target
    });
    
    // Wait for all chunk inserts to complete
    const chunkResults = await Promise.all(chunkInsertPromises);
    
    // Check for any errors during insert
    const chunkErrors = chunkResults.filter(result => result.error);
    if (chunkErrors.length > 0) {
      console.error('Errors storing chunks:', chunkErrors.map(e => e.error));
      // Return error for the first chunk failure encountered
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to store some chunks: ${chunkErrors[0].error.message}`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return success - indicating chunks are queued for embedding
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully queued ${ragData.chunks.length} chunks from document ${ragData.documentId} for embedding generation.`,
        documentId: ragData.documentId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error processing RAG embeddings:', error);
    // Type assertion for error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500, // Use 500 for unexpected server errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
