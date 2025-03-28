
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
  is_rag_enabled?: boolean;
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing authorization header' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a Supabase client with the Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('Verifying user token');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Invalid or expired token' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', user.id, user.email);

    // Check if user is admin (you can modify this check based on your needs)
    // For example, you might check if the user's email matches an admin email
    const isAdmin = user.email === 'vetle@reprint.ink';
    if (!isAdmin) {
      console.error('User is not an admin:', user.email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Forbidden: Admin privileges required' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse the request body
    console.log('Parsing request data');
    const reportData: ReportInput = await req.json();
    
    // Validate required fields
    if (!reportData.title || !reportData.summary || !reportData.content) {
      console.error('Missing required fields in report data');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: title, summary, and content are required.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate a slug if not provided
    if (!reportData.slug) {
      reportData.slug = reportData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().substring(9);
    }

    console.log('Inserting report into database');

    // First, let's run the migration to ensure the column exists
    const { error: migrationError } = await supabase.rpc('pg_extension', { 
      query: `
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public'
                AND table_name = 'compliance_reports'
                AND column_name = 'is_rag_enabled'
            ) THEN
                ALTER TABLE public.compliance_reports
                ADD COLUMN is_rag_enabled BOOLEAN DEFAULT FALSE;
            END IF;
        END $$;
      `
    });

    if (migrationError) {
      console.error('Migration error:', migrationError);
      // Continue anyway, as we'll handle the case if the column doesn't exist
    }

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
        category: reportData.category || 'General',
        author: reportData.author || user.email || 'System Generated',
        cover_image: reportData.cover_image || null,
        read_time: reportData.read_time || Math.ceil(reportData.summary.length / 1000) + 5,
        is_featured: reportData.is_featured !== undefined ? reportData.is_featured : false,
        is_rag_enabled: reportData.is_rag_enabled !== undefined ? reportData.is_rag_enabled : false,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Database error: ${error.message}` 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful operation
    console.log('Report added successfully:', data[0].id);

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
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
