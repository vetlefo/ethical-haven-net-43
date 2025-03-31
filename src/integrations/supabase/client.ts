
import { createClient } from '@supabase/supabase-js';

// Load Supabase URL and anon key from environment variables with fallbacks
// These fallbacks are for development and production purposes
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kxvjrktpadujfcxpfuxi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dmpya3RwYWR1amZjeHBmdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTkwMzksImV4cCI6MjA1ODE5NTAzOX0.HKDNvLzo8FV1bVk-CNxV2dZ-CCV8NaIrYP_q3ciXHII';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export default supabase;
