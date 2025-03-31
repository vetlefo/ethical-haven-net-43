
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
    
    chunks.push({
      text: chunk,
      position: position,
      chunkId: `chunk-${position + 1}`
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

// Function to generate embeddings
async function generateEmbedding(text: string, apiKey: string) {
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
      throw new Error(`Embedding API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
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
      // Check if the content is a JSON string and parse it if it is
      const contentObj = typeof requestData.content === 'string' 
        ? JSON.parse(requestData.content) 
        : requestData.content;

      // Initialize document ID and metadata
      const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      let chunks;
      let metadata = {};
      
      // Handle structured report JSON
      if (contentObj.title && contentObj.content) {
        console.log("Processing structured report content");
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
        
        // Extract text from report sections
        let fullText = '';
        if (contentObj.content?.sections) {
          contentObj.content.sections.forEach((section) => {
            fullText += section.title + '\n\n' + section.content + '\n\n';
          });
        } else {
          fullText = contentObj.summary || '';
        }
        
        chunks = splitIntoChunks(fullText);
      } else if (Array.isArray(contentObj)) {
        // Handle array format (direct chunks)
        console.log("Processing array of chunks");
        chunks = contentObj;
      } else {
        // Handle plain text
        console.log("Processing plain text content");
        chunks = splitIntoChunks(requestData.content);
      }

      console.log(`Processing ${chunks.length} chunks for embedding`);

      // Store document metadata
      const { error: docError } = await supabase
        .from("rag_documents")
        .insert({
          document_id: documentId,
          title: metadata.title || "Untitled Document",
          summary: metadata.summary,
          country: metadata.country,
          region: metadata.region,
          categories: metadata.categories,
          regulations: metadata.regulations,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (docError) {
        console.error("Error storing document metadata:", docError);
        throw new Error(`Failed to store document metadata: ${docError.message}`);
      }
      
      // Store each chunk with embedding_status = "pending"
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        const { error: chunkError } = await supabase
          .from("rag_chunks")
          .insert({
            document_id: documentId,
            chunk_id: chunk.chunkId || `chunk-${i + 1}`,
            text: chunk.text,
            position: chunk.position || i,
            section: chunk.metadata?.section,
            source: chunk.metadata?.source,
            embedding_status: "pending" // Mark for async embedding generation
          });
        
        if (chunkError) {
          console.error(`Error storing chunk ${i + 1}:`, chunkError);
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          documentId: documentId,
          message: `Successfully queued ${chunks.length} chunks for embedding generation.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (parseError) {
      console.error("Error parsing content:", parseError);
      throw new Error(`Failed to parse content: ${parseError.message}`);
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
