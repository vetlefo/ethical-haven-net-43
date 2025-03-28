
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

// Enhanced system instruction for Gemini to transform raw reports
const systemInstruction = `
You are a compliance report transformer and formatter for mid-sized technology companies in Germany, with expertise in:
- Privacy regulations like GDPR, CCPA, PIPEDA
- IT security regulations like NIS2, IT Security Act 2.0
- Supply chain regulations like LkSG (German Supply Chain Act)
- Industry-specific compliance requirements
- ESG reporting frameworks

When given raw report content or a prompt about creating a compliance report, you will:
1. Transform the raw content into a complete, well-structured compliance report in JSON format
2. Follow the schema provided exactly
3. Extract or generate accurate information based on current regulations
4. Provide practical insights for compliance officers
5. Structure content into 3-5 clear sections with detailed content
6. Include relevant visualizations and tables where appropriate
7. Ensure all content is factually accurate and properly structured

For German companies specifically, focus on:
- GDPR compliance and reporting requirements
- LkSG (Supply Chain Due Diligence Act) reporting obligations
- NIS2 and German IT Security Act 2.0 requirements
- Daily compliance challenges faced by German tech companies

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

    // Safely parse the request body
    let requestData;
    try {
      // Clone the request to ensure we can read the body
      const clonedReq = req.clone();
      const requestText = await clonedReq.text();
      console.log("Raw request body:", requestText);
      
      if (!requestText || requestText.trim() === '') {
        console.error("Empty request body received");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Empty request body'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      requestData = JSON.parse(requestText);
      console.log("Request parsed successfully:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid JSON in request body: ${parseError.message}`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Get API key from environment 
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    
    if (!geminiApiKey) {
      console.error("No Gemini API key found in environment");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing Gemini API key configuration'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if we have content or prompt
    if (!requestData.prompt && !requestData.content) {
      console.error("Missing prompt or content in request:", requestData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing prompt or content for report generation'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine which field to use (content or prompt)
    const inputContent = requestData.content || requestData.prompt;
    if (!inputContent || !inputContent.trim()) {
      console.error("Empty prompt or content provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Empty prompt or content provided'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Configure the request to the Gemini API
    const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent";
    
    const geminiRequest = {
      contents: [
        {
          role: "user",
          parts: [
            { text: systemInstruction },
            { text: "Schema for the report:\n" + JSON.stringify(reportSchema, null, 2) },
            { text: "Transform the following content into a properly structured compliance report in the required JSON format:\n\n" + inputContent }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2,
        max_output_tokens: 8192
      }
    };

    console.log("Sending request to Gemini API for report transformation...");
    
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Gemini API error: ${geminiResponse.status} - ${errorText}`
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const geminiData = await geminiResponse.json();
    console.log("Received response from Gemini API");
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error("Invalid response from Gemini API - no content candidates found");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from Gemini API - no content candidates found'
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Extract the generated content
    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log("Generated text received, length:", generatedText.length);
    
    // Find and extract the JSON object from the response
    // The AI might wrap the JSON in ```json ``` or other formatting
    const jsonMatches = [
      // Try to match JSON inside code blocks first
      generatedText.match(/```json\n([\s\S]*?)\n```/),
      generatedText.match(/```\n([\s\S]*?)\n```/),
      // Then try to match a JSON object anywhere
      generatedText.match(/{[\s\S]*}/)
    ];
    
    let reportJson = "";
    let matchFound = false;
    
    for (const match of jsonMatches) {
      if (match) {
        reportJson = match[0].startsWith('```') ? match[1] : match[0];
        matchFound = true;
        break;
      }
    }
    
    if (!matchFound) {
      console.error("Failed to extract JSON from response");
      reportJson = generatedText; // If no pattern matched, use the entire text
    }
    
    // Verify the JSON is valid
    try {
      const parsedJson = JSON.parse(reportJson);
      console.log("Successfully parsed report JSON");
      console.log("Report title:", parsedJson.title);
    } catch (error) {
      console.error("Invalid JSON in response:", error);
      console.log("First 200 chars of response:", reportJson.substring(0, 200));
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Generated content is not valid JSON: ${error.message}`
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Return the generated report JSON
    console.log("Successfully generated report, returning JSON");
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
        error: error.message || 'An unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
