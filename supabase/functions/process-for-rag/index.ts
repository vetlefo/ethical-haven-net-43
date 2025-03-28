
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

// Schema for competitive intelligence reports
const competitiveIntelSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "competitor_name": { "type": "string" },
      "primary_categories": { 
        "type": "array", 
        "items": { "type": "string" }
      },
      "feature_summary": { "type": "string" },
      "feature_breadth_indicator": { "type": "string" },
      "ease_of_use_summary": { "type": "string" },
      "pricing_model": { "type": "string" },
      "target_market_segment": { 
        "type": "array", 
        "items": { "type": "string" }
      },
      "geographic_focus": { 
        "type": "array", 
        "items": { "type": "string" }
      },
      "ai_integration_level": { "type": "string" },
      "integration_capabilities_summary": { "type": "string" },
      "key_strengths": { 
        "type": "array", 
        "items": { "type": "string" }
      },
      "key_weaknesses": { 
        "type": "array", 
        "items": { "type": "string" }
      },
      "company_size_proxy": {
        "type": "object",
        "properties": {
          "employee_count": { "type": ["string", "null"] },
          "funding_status": { "type": ["string", "null"] }
        }
      },
      "founded_year": { "type": ["integer", "null"] },
      "source_report_identifier": { "type": ["string", "null"] }
    }
  }
};

// System instruction for Gemini to process content for RAG
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

// System instruction for competitive intelligence analysis
const competitiveIntelInstruction = `
Act as a Data Analyst specializing in Competitive Intelligence.

Your Task:
I will provide you with the text content of ONE comprehensive competitor analysis report (approx. 10-15 pages) that covers MULTIPLE software companies in the reporting and compliance space. Your task is to carefully read the entire report, identify the sections pertaining to each competitor, extract specific pieces of information for EACH competitor, summarize them concisely, and output the results as a single structured JSON array. Each object within the array will represent one competitor.

Goal:
To create a consistent, structured dataset summarizing key attributes of multiple competitors from a single source document, which will later be used for visualization and comparative analysis. It is crucial that you use the exact same JSON structure and keys for every competitor object within the array.

Output Format:
Please provide the output STRICTLY as a single JSON array. Each element in the array must be a JSON object conforming to the structure specified below. Do NOT include any introductory text, explanations, or markdown formatting outside of the JSON structure itself.

Important Instructions:
* Iterate through the report, identifying each competitor discussed.
* For EACH competitor, extract the information required for the fields in the JSON object structure.
* If information for a specific field cannot be found for a competitor in the report, use 'null' for number/integer fields, "Not specified" for string fields, or an empty array [] for list fields, as appropriate based on the JSON structure. DO NOT invent information.
* Keep summaries concise and focused on the key points from the report for that specific competitor.
* Ensure the final output is a single, valid JSON array containing one object per competitor analyzed in the report.
* Consistency in applying these instructions is paramount.

Focus on extracting:
- Company information (name, founding year, size)
- Product features and capabilities
- Market positioning and target segments
- Geographic focus
- Strengths and weaknesses
- AI integration and technology stack
- Pricing models
`;

// Function to generate embeddings using Google's Genai API
async function generateEmbedding(text, apiKey) {
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

// Function to split text into chunks that are within the token limit
function splitIntoChunks(text, maxChunkSize = 2000) {
  // Simple splitting by paragraphs first
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    // Skip empty paragraphs
    if (!paragraph.trim()) continue;
    
    // If adding this paragraph would make the chunk too large, start a new chunk
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  // Add the last chunk if it's not empty
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // If any chunks are still too large, split them by sentences
  const finalChunks = [];
  for (const chunk of chunks) {
    if (chunk.length <= maxChunkSize) {
      finalChunks.push(chunk);
    } else {
      // Split by sentences if chunk is still too large
      const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
      let sentenceChunk = "";
      
      for (const sentence of sentences) {
        if ((sentenceChunk + sentence).length > maxChunkSize && sentenceChunk.length > 0) {
          finalChunks.push(sentenceChunk.trim());
          sentenceChunk = sentence;
        } else {
          sentenceChunk += (sentenceChunk ? " " : "") + sentence;
        }
      }
      
      if (sentenceChunk.trim()) {
        finalChunks.push(sentenceChunk.trim());
      }
    }
  }

  return finalChunks;
}

// Process content for RAG with embeddings
async function processContentForRag(content, apiKey) {
  try {
    // Split the content into manageable chunks
    const contentChunks = splitIntoChunks(content);
    console.log(`Split content into ${contentChunks.length} chunks`);
    
    const processedChunks = [];
    
    // Process each chunk and generate embeddings
    for (let i = 0; i < contentChunks.length; i++) {
      const chunk = contentChunks[i];
      console.log(`Processing chunk ${i + 1}/${contentChunks.length}, size: ${chunk.length} chars`);
      
      try {
        // Generate embedding for this chunk
        const embedding = await generateEmbedding(chunk, apiKey);
        
        processedChunks.push({
          id: `chunk-${i + 1}`,
          text: chunk,
          metadata: {
            position: i + 1,
            source: "document",
            section: `Section ${i + 1}`
          },
          embedding: embedding
        });
        
        console.log(`Successfully processed chunk ${i + 1}`);
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        // Continue with other chunks even if one fails
        processedChunks.push({
          id: `chunk-${i + 1}`,
          text: chunk,
          metadata: {
            position: i + 1,
            source: "document",
            section: `Section ${i + 1}`
          },
          embedding: [] // Empty embedding as a fallback
        });
      }
    }
    
    // Create the RAG document
    return {
      documentId: `doc-${Date.now()}`,
      chunks: processedChunks,
      metadata: {
        title: "Processed Document",
        date: new Date().toISOString(),
        summary: "Automatically processed document"
      }
    };
  } catch (error) {
    console.error("Error processing content:", error);
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

    // Parse the request body
    const requestData = await req.json();
    
    if (!requestData.geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    if (!requestData.content) {
      throw new Error('Missing content for processing');
    }

    // Determine if this is a compliance report or competitive intelligence report
    const isCompetitiveIntel = requestData.contentType === 'competitive-intel';
    
    // Use the Gemini API key from the request
    const geminiApiKey = requestData.geminiApiKey;
    
    let processedContent;
    
    if (isCompetitiveIntel) {
      // Configure the request to the Gemini API for competitive intelligence
      const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";
      
      const geminiRequest = {
        contents: [
          {
            role: "user",
            parts: [
              { text: competitiveIntelInstruction },
              { text: "Schema for competitive intelligence reports:\n" + JSON.stringify(competitiveIntelSchema, null, 2) },
              { text: "Process the following competitor analysis report into structured JSON format:\n\n" + requestData.content }
            ]
          }
        ],
        generation_config: {
          temperature: 0.1,
          max_output_tokens: 8192
        }
      };

      console.log(`Sending request to Gemini API for competitive intelligence processing...`);
      
      // Call the Gemini API
      const geminiResponse = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(geminiRequest)
      });
      
      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API error:", errorText);
        throw new Error(`Gemini API error: ${geminiResponse.status} ${errorText}`);
      }
      
      const geminiData = await geminiResponse.json();
      console.log("Received response from Gemini API");
      
      if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }
      
      // Extract the generated content
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      
      // Find and extract the JSON object from the response
      // The AI might wrap the JSON in ```json ``` or other formatting
      let jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                    generatedText.match(/```\n([\s\S]*?)\n```/) || 
                    generatedText.match(/{[\s\S]*}/);
                    
      if (jsonMatch) {
        processedContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
      } else {
        processedContent = generatedText; // If no pattern matched, use the entire text
      }
    } else {
      // For RAG processing, use our direct embedding approach
      console.log("Processing content for RAG embeddings with Gemini...");
      const ragDocument = await processContentForRag(requestData.content, geminiApiKey);
      processedContent = JSON.stringify(ragDocument, null, 2);
    }
    
    // Verify the JSON is valid
    try {
      JSON.parse(processedContent);
    } catch (error) {
      console.error("Invalid JSON in processed content:", error);
      throw new Error('Generated content is not valid JSON');
    }
    
    // Return the processed content
    return new Response(
      JSON.stringify({ 
        success: true, 
        processedContent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
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
