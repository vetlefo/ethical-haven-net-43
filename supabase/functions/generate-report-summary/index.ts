import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0"; // Use appropriate version

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Restrict in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- Environment Variables ---
const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
// Use Service Role Key for fetching report content from DB
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); 

// --- Summary Generation Schema & Prompt (Provided by User) ---
// IMPORTANT: Replace placeholders below with the full schema and prompt provided by the user.
const summarySchema = {
  "type": "object",
  "description": "Schema for structured information extracted and summarized from a long article.",
  "properties": {
    "summary": {
      "type": "string",
      "description": "A concise summary of the article (approx. 400-600 words), capturing main points, findings, and conclusions in clear language suitable for a website audience."
    },
    "tags": {
      "type": "array",
      "description": "A list of relevant keywords or phrases (approx. 5-10) representing the article's core content and themes.",
      "items": { "type": "string" }
    },
    "key_entities": {
      "type": "array",
      "description": "List of prominent organizations, products, or specific named concepts mentioned centrally in the article.",
      "items": { "type": "string" }
    },
    "main_topics_discussed": {
      "type": "array",
      "description": "List of the core subjects or themes covered in the article.",
      "items": { "type": "string" }
    },
    "identified_problems_or_challenges": {
      "type": "array",
      "description": "List of brief descriptions highlighting problems, challenges, or potential weaknesses mentioned regarding the software or the selection process.",
      "items": { "type": "string" }
    },
    "proposed_solutions_or_recommendations": {
      "type": "array",
      "description": "List of brief descriptions outlining solutions, recommendations, unique selling points, or best-fit scenarios mentioned.",
      "items": { "type": "string" }
    }
  },
  "required": [
    "summary", "tags", "key_entities", "main_topics_discussed", 
    "identified_problems_or_challenges", "proposed_solutions_or_recommendations"
  ]
}; 

const summarySystemInstruction = `
You are an expert AI assistant specialized in analyzing long-form content, summarizing key information for a web audience, and extracting structured data.

The following text is a long article submitted by a website administrator. The goal is to process this article to generate content suitable for display on a website and for internal categorization and analysis.

Please perform the following actions:

1.  **Generate a concise summary** of the article. The summary should be approximately **400-600 words** (or **4-6 paragraphs**) long, suitable for roughly one page of website content. Focus on the main points, key arguments, significant findings, and conclusions. Use clear, accessible language appropriate for a general website audience. Structure the summary logically using short paragraphs.

2.  **Identify and extract relevant tags**. Provide approximately **5 to 10 tags** (keywords and phrases) that accurately represent the article's core topics and themes. Include primary subjects, key concepts, and central entities.

3.  **Extract the following specific information** and present it clearly using labeled lists according to the provided JSON schema.

The output MUST be a single, valid JSON object conforming exactly to the schema. Do NOT include any introductory text, explanations, or markdown formatting outside of the JSON structure itself.
`; 

// Helper function to extract text from report content (adjust based on actual structure)
function extractTextFromReportContent(reportContent: any): string {
    // Assuming reportContent is the JSONB object stored in the DB
    // and follows the schema of the 'generate-report' function.
    // We need to concatenate the text from all sections.
    if (reportContent && reportContent.content && Array.isArray(reportContent.content.sections)) {
        return reportContent.content.sections.map((section: any) => section.content).join("\n\n");
    }
    // Fallback if structure is different or content is just text
    if (typeof reportContent === 'string') {
        return reportContent;
    }
    console.warn("Could not extract text from report content structure:", reportContent);
    return ""; // Return empty string if extraction fails
}


// --- Main Function Handler ---
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Note: JWT verification (including admin role check) is handled by Supabase based on config.toml

  try {
    // --- Basic Validation & Setup ---
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ success: false, error: 'Method Not Allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!geminiApiKey) {
      console.error("Missing Gemini API key configuration on server.");
      return new Response(JSON.stringify({ success: false, error: 'Server configuration error: Missing API key' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    const requestBody = await req.json();
    const { content, reportId } = requestBody; // Expect 'content' (string) or 'reportId' (string/number)

    let reportContentText: string | null = content || null;

    // --- Fetch Report Content if ID is provided ---
    if (!reportContentText && reportId) {
      if (!supabaseUrl || !supabaseServiceKey) {
         console.error("Missing Supabase credentials needed to fetch report by ID.");
         return new Response(JSON.stringify({ success: false, error: 'Server configuration error: Missing DB credentials' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      console.log(`Fetching report content for ID: ${reportId}`);
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      // Determine if reportId is likely a slug (string) or numeric ID
      const idColumn = typeof reportId === 'string' && isNaN(Number(reportId)) ? 'slug' : 'id'; 

      const { data: reportData, error: dbError } = await supabaseAdmin
        .from('compliance_reports') // Assuming this is the table name
        .select('content') // Assuming the full content is stored in a 'content' column (JSONB?)
        .eq(idColumn, reportId) 
        .maybeSingle(); // Use maybeSingle() in case ID doesn't exist

      if (dbError) {
        console.error(`Database error fetching report ${reportId}:`, dbError);
        return new Response(JSON.stringify({ success: false, error: `Database error: ${dbError.message}` }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!reportData) {
         console.error(`Report not found for ID/Slug: ${reportId}`);
         return new Response(JSON.stringify({ success: false, error: `Report not found: ${reportId}` }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
      // Extract text from the fetched content object
      reportContentText = extractTextFromReportContent(reportData); 
      if (!reportContentText) {
          console.error(`Could not extract text content from report ${reportId}`);
          return new Response(JSON.stringify({ success: false, error: 'Failed to extract text from stored report content.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      console.log(`Successfully fetched and extracted text for report ${reportId}`);
    }

    // Final validation: Ensure we have content to process
    if (!reportContentText || typeof reportContentText !== 'string' || reportContentText.trim().length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Missing or empty content to generate summary from.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- Call Gemini API for Summary Generation ---
    console.log("Sending request to Gemini API for summary generation...");
    const geminiApiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"; // Or appropriate model
    
    const geminiRequest = {
      contents: [
        {
          role: "user",
          parts: [
            { text: summarySystemInstruction },
            { text: "JSON Schema:\n" + JSON.stringify(summarySchema, null, 2) },
            { text: "Article Content:\n\n" + reportContentText }
          ]
        }
      ],
      generation_config: {
        temperature: 0.2, // Adjust temperature as needed for creativity vs factualness
        max_output_tokens: 4096, // Adjust based on expected summary size + schema
        response_mime_type: "application/json", // Request JSON output directly
      }
    };

    const geminiResponse = await fetch(`${geminiApiUrl}?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiRequest)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini summary API error:", errorText);
      throw new Error(`Gemini summary API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    console.log("Received summary response from Gemini API");

    // --- Validate and Extract JSON Summary ---
    let summaryJson;
    if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
            // Attempt to parse the JSON directly from the response text part
            summaryJson = JSON.parse(geminiData.candidates[0].content.parts[0].text);
            // TODO: Add validation against summarySchema if needed (using a JSON schema validator library)
            console.log("Successfully parsed summary JSON.");
        } catch (parseError) {
            console.error("Failed to parse JSON summary from Gemini response:", parseError);
            console.error("Raw Gemini text:", geminiData.candidates[0].content.parts[0].text);
            const parseErrorMessage = parseError instanceof Error ? parseError.message : String(parseError);
            throw new Error(`Generated content is not valid JSON: ${parseErrorMessage}`);
        }
    } else {
        console.error("Invalid response structure from Gemini summary API:", geminiData);
        throw new Error('Invalid response structure from Gemini summary API');
    }
    
    // --- Return Success ---
    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: summaryJson // Return the parsed JSON object
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // General catch block
    console.error('Error in generate-report-summary function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});