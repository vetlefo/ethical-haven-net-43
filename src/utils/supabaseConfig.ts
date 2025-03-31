
/**
 * Utility functions for Supabase configuration
 * Provides safer access to Supabase URL and key without accessing protected properties
 */

// Get the Supabase URL
export const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || 'https://kxvjrktpadujfcxpfuxi.supabase.co';
};

// Get the Supabase anon key
export const getSupabaseAnonKey = () => {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dmpya3RwYWR1amZjeHBmdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTkwMzksImV4cCI6MjA1ODE5NTAzOX0.HKDNvLzo8FV1bVk-CNxV2dZ-CCV8NaIrYP_q3ciXHII';
};

// Get the Supabase Edge Functions base URL
export const getEdgeFunctionUrl = (functionName: string) => {
  const baseUrl = getSupabaseUrl();
  return `${baseUrl}/functions/v1/${functionName}`;
};
