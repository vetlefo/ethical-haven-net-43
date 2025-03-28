
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const adminKey = Deno.env.get('ADMIN_API_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Verify admin API key
    const providedAdminKey = req.headers.get('Admin-Key');
    if (!providedAdminKey || providedAdminKey !== adminKey) {
      console.error("Unauthorized: Invalid admin key provided");
      console.error(`Provided key: ${providedAdminKey?.substring(0, 3)}... Expected key: ${adminKey.substring(0, 3)}...`);
      throw new Error('Unauthorized: Invalid admin key');
    }

    // Parse the request body
    const competitiveData = await req.json();
    
    // Validate that we received an array
    if (!Array.isArray(competitiveData)) {
      throw new Error('Invalid data format. Expected an array of competitor objects.');
    }

    console.log(`Processing ${competitiveData.length} competitors for insertion...`);
    
    // Insert the competitors into the database
    const { data, error } = await supabase
      .from('competitors')
      .upsert(
        competitiveData.map(competitor => ({
          competitor_name: competitor.competitor_name,
          primary_categories: competitor.primary_categories,
          feature_summary: competitor.feature_summary,
          feature_breadth_indicator: competitor.feature_breadth_indicator,
          ease_of_use_summary: competitor.ease_of_use_summary,
          pricing_model: competitor.pricing_model,
          target_market_segment: competitor.target_market_segment,
          geographic_focus: competitor.geographic_focus,
          ai_integration_level: competitor.ai_integration_level,
          integration_capabilities_summary: competitor.integration_capabilities_summary,
          key_strengths: competitor.key_strengths,
          key_weaknesses: competitor.key_weaknesses,
          company_size_proxy: competitor.company_size_proxy,
          founded_year: competitor.founded_year,
          source_report_identifier: competitor.source_report_identifier,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'competitor_name' }
      );

    if (error) {
      console.error("Error inserting competitive intelligence data:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Successfully inserted competitive intelligence data");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${competitiveData.length} competitors`,
        data: { inserted: competitiveData.length }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing competitive intelligence data:', error);
    
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
