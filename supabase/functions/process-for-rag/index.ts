
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
        "required": ["id", "text", "metadata"],
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
      throw new Error('Missing content for RAG processing');
    }

    // Configure the request to the Gemini API
    const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";
    const geminiApiKey = requestData.geminiApiKey;
    
    const geminiRequest = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstruction },
            { text: "Schema for RAG document chunks:\n" + JSON.stringify(ragSchema, null, 2) },
            { text: "Process the following compliance report content into chunks suitable for RAG:\n\n" + requestData.content }
          ]
        }
      ],
      generation_config: {
        temperature: 0.1,
        max_output_tokens: 8192
      }
    };

    console.log("Sending request to Gemini API for RAG processing...");
    
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
                   
    let processedContent = "";
    
    if (jsonMatch) {
      processedContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
    } else {
      processedContent = generatedText; // If no pattern matched, use the entire text
    }
    
    // Verify the JSON is valid
    try {
      JSON.parse(processedContent);
    } catch (error) {
      console.error("Invalid JSON in Gemini response:", error);
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
