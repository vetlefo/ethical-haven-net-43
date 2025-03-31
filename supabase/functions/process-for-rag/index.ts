
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Function to split text into chunks with overlap
function splitIntoChunks(
  text: string,
  chunkSize = 2000, // Target size in characters
  overlapSize = 200 // Overlap size in characters
): {text: string, position: number, chunkId: string}[] {
  
  if (overlapSize >= chunkSize) {
    console.warn("Overlap size is greater than or equal to chunk size. Setting overlap to chunkSize / 10.");
    overlapSize = Math.floor(chunkSize / 10);
  }
  if (overlapSize < 0) {
     overlapSize = 0; // Ensure overlap is not negative
  }

  const chunks: {text: string, position: number, chunkId: string}[] = [];
  let startIndex = 0;
  let position = 0;

  // Iterate through the text, creating overlapping chunks
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex);
    
    if (chunk.trim().length === 0) {
      // Skip empty chunks
      startIndex = endIndex;
      continue;
    }
    
    chunks.push({
      text: chunk,
      position: position,
      chunkId: `chunk-${Date.now()}-${position + 1}`
    });

    position++;

    // Calculate the starting point for the next chunk
    const nextStartIndex = startIndex + chunkSize - overlapSize;

    // If the next starting point is the same or before the current one,
    // or if we've reached the end, break the loop.
    if (nextStartIndex <= startIndex || endIndex === text.length) {
      break;
    }

    startIndex = nextStartIndex;
  }

  return chunks;
}

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

    // Get API key from environment 
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const requestData = await req.json();

    // Check for content
    if (!requestData.content) {
      throw new Error('Missing content for processing');
    }

    try {
      console.log("Request content type:", typeof requestData.content);
      console.log("Content length:", typeof requestData.content === 'string' ? requestData.content.length : 'not a string');
      
      // Generate a unique document ID if not provided
      const documentId = requestData.documentId || `doc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      let chunks = [];
      let documentTitle = "Untitled Document";
      let documentSummary = null;
      let metadata = {};
      
      const contentType = requestData.contentType || "general";
      
      // First, try to parse the content as JSON (for structured report content)
      try {
        // Check if content is already an object
        const contentObj = typeof requestData.content === 'object' 
          ? requestData.content 
          : JSON.parse(requestData.content);
        
        console.log("Successfully parsed content as JSON");
        
        // Extract metadata from the report structure
        if (contentObj.title) {
          documentTitle = contentObj.title;
          documentSummary = contentObj.summary || null;
          metadata = {
            title: contentObj.title,
            summary: contentObj.summary,
            country: contentObj.country,
            region: contentObj.region,
            categories: contentObj.tags || [],
            regulations: contentObj.tags?.filter(tag => 
              ['GDPR', 'HIPAA', 'LkSG', 'NIS2', 'IT Security Act'].some(reg => 
                tag.includes(reg)
              )
            ) || []
          };
        }
        
        // Handle different possible content structures
        if (contentObj.content?.sections) {
          // Handle report content with sections
          console.log("Processing report with sections");
          let fullText = '';
          contentObj.content.sections.forEach((section) => {
            fullText += section.title + '\n\n' + section.content + '\n\n';
          });
          chunks = splitIntoChunks(fullText);
        } else if (Array.isArray(contentObj)) {
          // Handle array of chunks directly
          console.log("Processing array of chunks");
          chunks = contentObj;
        } else if (typeof contentObj === 'string') {
          // Handle string content
          console.log("Processing string content from JSON");
          chunks = splitIntoChunks(contentObj);
        } else if (contentObj.content && typeof contentObj.content === 'string') {
          // Handle content field that's a string
          console.log("Processing content field from JSON");
          chunks = splitIntoChunks(contentObj.content);
        } else {
          // Fall back to stringifying the object
          console.log("Stringifying complex object for chunking");
          const jsonText = JSON.stringify(contentObj, null, 2);
          chunks = splitIntoChunks(jsonText);
        }
      } catch (parseError) {
        // If parsing as JSON fails, treat as plain text
        console.log("Parsing as JSON failed, treating as plain text:", parseError.message);
        chunks = splitIntoChunks(requestData.content);
      }
      
      console.log(`Processing ${chunks.length} chunks for document ID: ${documentId}`);

      // Store document metadata
      const { error: docError } = await supabase
        .from("rag_documents")
        .insert({
          document_id: documentId,
          title: documentTitle,
          summary: documentSummary,
          content_type: contentType,
          ...metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (docError) {
        console.error("Error storing document metadata:", docError);
        throw new Error(`Failed to store document metadata: ${docError.message}`);
      }
      
      // Store each chunk with embedding_status = "pending"
      let successCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        if (!chunk.text || chunk.text.trim().length === 0) {
          console.log(`Skipping empty chunk at position ${i}`);
          continue;
        }
        
        const { error: chunkError } = await supabase
          .from("rag_chunks")
          .insert({
            document_id: documentId,
            chunk_id: chunk.chunkId || `chunk-${documentId}-${i + 1}`,
            text: chunk.text,
            position: chunk.position || i,
            section: chunk.metadata?.section,
            source: chunk.metadata?.source,
            embedding_status: "pending" // Mark for async embedding generation
          });
        
        if (chunkError) {
          console.error(`Error storing chunk ${i + 1}:`, chunkError);
        } else {
          successCount++;
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          documentId: documentId,
          message: `Successfully queued ${successCount} of ${chunks.length} chunks for embedding generation.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error("Error processing content:", parseError);
      throw new Error(`Failed to process content: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    // Type assertion for error handling
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
