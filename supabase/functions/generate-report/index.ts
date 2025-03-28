
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Schema for the report JSON structure
const reportSchema = {
  "type": "object",
  "required": ["title", "slug", "summary", "content"],
  "properties": {
    "title": {
      "type": "string",
      "description": "The title of the compliance report"
    },
    "slug": {
      "type": "string",
      "description": "URL-friendly version of the title (lowercase, hyphenated)"
    },
    "summary": {
      "type": "string",
      "description": "A brief summary of the report content (1-2 sentences)"
    },
    "content": {
      "type": "object",
      "required": ["sections"],
      "properties": {
        "sections": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["title", "content"],
            "properties": {
              "title": {
                "type": "string",
                "description": "Section title"
              },
              "content": {
                "type": "string",
                "description": "Section content in plain text"
              }
            }
          }
        },
        "visualizations": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["title", "type", "description"],
            "properties": {
              "title": {
                "type": "string",
                "description": "Visualization title"
              },
              "type": {
                "type": "string",
                "description": "Type of visualization (e.g., bar, line, pie)"
              },
              "description": {
                "type": "string",
                "description": "Description of what this visualization shows"
              }
            }
          }
        },
        "tables": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["title", "columns", "rows"],
            "properties": {
              "title": {
                "type": "string",
                "description": "Table title"
              },
              "columns": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Column headers"
              },
              "rows": {
                "type": "array",
                "items": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                },
                "description": "Table rows, each containing cell data as strings"
              }
            }
          }
        }
      }
    },
    "country": {
      "type": "string",
      "description": "Country focus of the report"
    },
    "region": {
      "type": "string",
      "description": "Region focus of the report"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags associated with the report"
    },
    "category": {
      "type": "string", 
      "description": "Report category (e.g., Market Analysis, Regulatory Update)"
    },
    "author": {
      "type": "string",
      "description": "Author of the report"
    },
    "cover_image": {
      "type": "string",
      "description": "URL to the cover image"
    },
    "read_time": {
      "type": "integer",
      "description": "Estimated read time in minutes"
    },
    "is_featured": {
      "type": "boolean",
      "description": "Whether this report should be featured on the homepage"
    }
  }
};

// System instruction for Gemini
const systemInstruction = `
You are a compliance report generator for mid-sized technology companies in various regions, with expertise in:
- Privacy regulations like GDPR, CCPA, PIPEDA
- IT security regulations like NIS2, IT Security Act 2.0
- Supply chain regulations like LkSG (German Supply Chain Act)
- Industry-specific compliance requirements
- ESG reporting frameworks

When given a prompt about creating a compliance report, you will:
1. Generate a complete, well-structured compliance report in JSON format
2. Follow the schema provided
3. Include realistic, accurate information based on current regulations
4. Provide practical insights for compliance officers
5. Create at least 3-5 sections with detailed content
6. Include relevant visualizations and tables where appropriate
7. Ensure all content is factually accurate and properly structured

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

    if (!requestData.prompt) {
      throw new Error('Missing prompt for report generation');
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
            { text: "Schema for the report:\n" + JSON.stringify(reportSchema, null, 2) },
            { text: "Generate a compliance report based on this prompt: " + requestData.prompt }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2,
        max_output_tokens: 8192
      }
    };

    console.log("Sending request to Gemini API...");
    
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
                   
    let reportJson = "";
    
    if (jsonMatch) {
      reportJson = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
    } else {
      reportJson = generatedText; // If no pattern matched, use the entire text
    }
    
    // Verify the JSON is valid
    try {
      JSON.parse(reportJson);
    } catch (error) {
      console.error("Invalid JSON in Gemini response:", error);
      throw new Error('Generated content is not valid JSON');
    }
    
    // Return the generated report JSON
    return new Response(
      JSON.stringify({ 
        success: true, 
        reportJson
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
