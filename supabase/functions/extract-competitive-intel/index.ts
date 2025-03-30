import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Get API key from environment
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("Missing environment variable: GEMINI_API_KEY");
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Gemini API key configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for content
    if (!requestData.content) {
      throw new Error('Missing content for processing');
    }

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
    let processedContent;
    let jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                  generatedText.match(/```\n([\s\S]*?)\n```/) || 
                  generatedText.match(/\[[\s\S]*\]/); // Match array specifically
                  
    if (jsonMatch) {
      processedContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
    } else {
      // Attempt to find the start of a JSON array if no markdown block found
      const arrayStart = generatedText.indexOf('[');
      if (arrayStart !== -1) {
        processedContent = generatedText.substring(arrayStart);
      } else {
        console.warn("Could not reliably extract JSON array from Gemini response. Returning raw text.");
        processedContent = generatedText; // Fallback if no pattern matched
      }
    }

    // Verify the JSON is valid (specifically an array)
    let parsedJson;
    try {
      parsedJson = JSON.parse(processedContent);
      if (!Array.isArray(parsedJson)) {
        throw new Error('Generated content is not a valid JSON array');
      }
    } catch (error) {
      console.error("Invalid JSON in processed content:", error);
      console.error("Raw content received:", processedContent); // Log raw content for debugging
      throw new Error('Generated content is not a valid JSON array');
    }
    
    // Return the processed content (as parsed JSON object/array)
    return new Response(
      JSON.stringify({ 
        success: true, 
        // Return the parsed JSON array directly
        competitiveIntelligence: parsedJson 
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