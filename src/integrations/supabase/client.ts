
import { createClient } from '@supabase/supabase-js';

// Use the hardcoded Supabase URL and anon key for this project
const supabaseUrl = 'https://kxvjrktpadujfcxpfuxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dmpya3RwYWR1amZjeHBmdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTkwMzksImV4cCI6MjA1ODE5NTAzOX0.HKDNvLzo8FV1bVk-CNxV2dZ-CCV8NaIrYP_q3ciXHII';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API route configuration
export const apiRoutes = {
  // Admin routes
  adminReports: '/api/admin-reports',
  adminRagEmbeddings: '/api/admin-rag-embeddings',
  adminCompetitiveIntel: '/api/admin-competitive-intel',
  
  // Processing routes
  generateReport: '/api/generate-report',
  processForRag: '/api/process-for-rag',
  
  // Public routes
  reports: '/api/reports',
  reportDetail: '/api/report-detail',
  searchRag: '/api/search-rag',
};

export default supabase;
