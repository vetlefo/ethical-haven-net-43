
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, admin-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define a type for the report structure
interface ReportInput {
  title: string;
  slug: string;
  summary: string;
  content: {
    sections: {
      title: string;
      content: string;
    }[];
    visualizations?: {
      title: string;
      type: string;
      description: string;
    }[];
    tables?: {
      title: string;
      columns: string[];
      rows: string[][];
    }[];
  };
  country?: string;
  region?: string;
  tags?: string[];
  category?: string;
  author?: string;
  cover_image?: string;
  read_time?: number;
  is_featured?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if request is coming with admin key
  const adminKey = req.headers.get('admin-key');
  
  // This should be set as a secret in Supabase "ADMIN_API_KEY"
  const expectedKey = Deno.env.get('ADMIN_API_KEY');
  
  if (!adminKey || adminKey !== expectedKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Invalid admin key.' }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed. Only POST requests are supported.');
    }

    // Parse the request body
    const reportData: ReportInput = await req.json();
    
    // Validate required fields
    if (!reportData.title || !reportData.slug || !reportData.summary || !reportData.content) {
      throw new Error('Missing required fields: title, slug, summary, and content are required.');
    }

    // Create a Supabase client with the Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the report into the database
    const { data, error } = await supabase
      .from('compliance_reports')
      .insert({
        title: reportData.title,
        slug: reportData.slug,
        summary: reportData.summary,
        content: reportData.content,
        country: reportData.country || null,
        region: reportData.region || null,
        tags: reportData.tags || [],
        category: reportData.category || null,
        author: reportData.author || null,
        cover_image: reportData.cover_image || null,
        read_time: reportData.read_time || null,
        is_featured: reportData.is_featured !== undefined ? reportData.is_featured : false,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Log successful operation
    console.log('Report added successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Report added successfully', 
        report: data[0] 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error.message);
    
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
