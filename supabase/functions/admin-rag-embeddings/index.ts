
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
      throw new Error('Method not allowed. Only POST requests are supported.');
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
      throw new Error('Invalid RAG document structure');
    }

    console.log(`Processing RAG document ID ${ragData.documentId} with ${ragData.chunks.length} chunks`);
    
    // Verify that the chunks have embeddings
    for (const chunk of ragData.chunks) {
      if (!chunk.embedding || !Array.isArray(chunk.embedding)) {
        console.warn(`Chunk ${chunk.id} is missing embeddings or embeddings is not an array`);
      }
    }
    
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
      throw new Error(`Failed to store document metadata: ${docError.message}`);
    }
    
    // Then store each chunk
    const chunkInsertPromises = ragData.chunks.map(chunk => {
      return supabase
        .from('rag_chunks')
        .upsert({
          document_id: ragData.documentId,
          chunk_id: chunk.id,
          text: chunk.text,
          section: chunk.metadata?.section,
          position: chunk.metadata?.position,
          source: chunk.metadata?.source,
          embedding: chunk.embedding
        });
    });
    
    // Wait for all chunk inserts to complete
    const chunkResults = await Promise.all(chunkInsertPromises);
    
    // Check for any errors
    const chunkErrors = chunkResults.filter(result => result.error);
    if (chunkErrors.length > 0) {
      console.error('Errors storing chunks:', chunkErrors);
      throw new Error(`Failed to store some chunks: ${chunkErrors[0].error.message}`);
    }
    
    // Return success
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully stored document ${ragData.documentId} with ${ragData.chunks.length} chunks in the vector database`,
        documentId: ragData.documentId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing RAG embeddings:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
