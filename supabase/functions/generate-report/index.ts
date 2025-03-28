
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

// Mock data for testing or fallback
const fallbackReportJson = JSON.stringify({
  title: "GDPR Compliance Guide for Tech Companies",
  slug: "gdpr-compliance-guide-tech-companies",
  summary: "A comprehensive overview of GDPR requirements for technology companies.",
  content: {
    sections: [
      {
        title: "Introduction to GDPR",
        content: "The General Data Protection Regulation (GDPR) is a regulation in EU law on data protection and privacy for all individuals within the European Union. It addresses the export of personal data outside the EU."
      },
      {
        title: "Key Compliance Requirements",
        content: "GDPR compliance requires implementing several measures including data protection impact assessments, maintaining records of processing activities, and ensuring data subject rights are respected."
      },
      {
        title: "Implementation Steps",
        content: "Steps to achieve compliance include data mapping, reviewing privacy notices, establishing procedures for handling data subject requests, and implementing appropriate security measures."
      }
    ]
  },
  country: "Germany",
  region: "European Union",
  tags: ["GDPR", "Data Protection", "Compliance", "Privacy"],
  category: "Regulatory Guide",
  author: "Compliance Team",
  read_time: 15,
  is_featured: true
});

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
      throw new Error('Missing prompt or raw content for report generation');
    }

    // Validate the Gemini API key format
    if (!requestData.geminiApiKey.trim() || requestData.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
      console.error("Invalid Gemini API key provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid Gemini API key. Please provide a valid API key.',
          reportJson: fallbackReportJson // Provide fallback data for testing
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
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
            { text: "Transform the following content into a properly structured compliance report in the required JSON format:\n\n" + requestData.prompt }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2,
        max_output_tokens: 8192
      }
    };

    console.log("Sending request to Gemini API for report transformation...");
    
    try {
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
        
        // If API key is invalid, provide a specific error message
        if (errorText.includes("API key not valid")) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'The Gemini API key provided is not valid. Please check your API key and try again.',
              reportJson: fallbackReportJson // Provide fallback for testing
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
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
    } catch (geminiError) {
      console.error('Error calling Gemini API:', geminiError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: geminiError.message || 'Failed to call Gemini API',
          reportJson: fallbackReportJson // Provide fallback for testing
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        reportJson: fallbackReportJson // Provide fallback for testing 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
