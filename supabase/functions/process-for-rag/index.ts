
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Schema for the RAG-ready document chunks
const ragSchema = {
  "type": "object",
  "required": ["documentId", "chunks", "metadata"],
  "properties": {
    "documentId": {
      "type": "string",
      "description": "A unique identifier for the document"
    },
    "chunks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "text", "metadata", "embedding"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier for this chunk"
          },
          "text": {
            "type": "string",
            "description": "The actual text content of this chunk (250-1000 words)"
          },
          "metadata": {
            "type": "object",
            "properties": {
              "source": {
                "type": "string",
                "description": "Where this content came from"
              },
              "section": {
                "type": "string",
                "description": "Section title or identifier"
              },
              "position": {
                "type": "integer",
                "description": "Position in the original document"
              }
            }
          },
          "embedding": {
            "type": "array",
            "items": {
              "type": "number"
            },
            "description": "Vector embedding generated from Gemini"
          }
        }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "description": "Document title"
        },
        "author": {
          "type": "string",
          "description": "Author of the document"
        },
        "date": {
          "type": "string",
          "description": "Creation or publication date (ISO format)"
        },
        "categories": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Categories or tags for this document"
        },
        "regulations": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Specific regulations covered (e.g., GDPR, LkSG, NIS2)"
        },
        "country": {
          "type": "string",
          "description": "Country focus of the document"
        },
        "region": {
          "type": "string",
          "description": "Region focus of the document"
        },
        "summary": {
          "type": "string",
          "description": "Brief summary of the document"
        }
      }
    }
  }
};

// System instruction for Gemini to process content for RAG (Note: This instruction is not currently used by the embedding logic but kept for potential future use or reference)
const systemInstruction = `
You are a processing engine that transforms raw compliance reports into structured, chunked documents ready for RAG (Retrieval Augmented Generation) with vector embeddings. Your focus is on compliance reports for mid-sized German technology companies.

When given raw report content, you will:
1. Analyze the content to identify logical sections and entities
2. Break the content into coherent, semantically meaningful chunks (250-1000 words each)
3. Structure these chunks according to the provided schema
4. Extract relevant metadata for each chunk and the overall document
5. Focus on German regulatory requirements like GDPR, LkSG, NIS2, and German IT Security Act 2.0
6. Ensure chunks maintain context and are optimized for retrieval
7. Generate unique identifiers for the document and each chunk

Focus on extracting:
- Key regulatory requirements
- Compliance deadlines and timeframes
- Reporting obligations
- Risk assessment methodologies
- Implementation steps
- Penalties for non-compliance
- Data protection measures
- IT security requirements
- Industry-specific regulations

The output must be valid JSON that conforms exactly to the schema provided, with no additional commentary.
`;

// Function to split text into chunks with overlap
function splitIntoChunks(
  text: string,
  chunkSize = 2000, // Target size in characters
  overlapSize = 200 // Overlap size in characters
): string[] {
  
  if (overlapSize >= chunkSize) {
    console.warn("Overlap size is greater than or equal to chunk size. Setting overlap to chunkSize / 10.");
    overlapSize = Math.floor(chunkSize / 10);
  }
  if (overlapSize < 0) {
     overlapSize = 0; // Ensure overlap is not negative
  }

  const chunks: string[] = [];
  let startIndex = 0;

  // Iterate through the text, creating overlapping chunks
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex);
    chunks.push(chunk);

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

// This function now ONLY splits content into chunks.
// Embedding generation is handled asynchronously via DB trigger.
function processContentForChunking(content: string): string[] {
  try {
    // Split the content into manageable chunks
    const contentChunks = splitIntoChunks(content);
    console.log(`Split content into ${contentChunks.length} chunks`);
    return contentChunks;
  } catch (error) {
    console.error("Error chunking content:", error);
    throw error; // Re-throw the error to be caught by the main handler
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

    // Parse the request body
    const requestData = await req.json();

    // Check for content
    if (!requestData.content) {
      throw new Error('Missing content for processing');
    }

    // This function now ONLY chunks the content. Embeddings are handled async.
    console.log("Chunking content...");
    const textChunks = processContentForChunking(requestData.content);

    // Return the array of text chunks
    return new Response(
      JSON.stringify({
        success: true,
        chunks: textChunks // Return the array of strings
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
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
