
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
};

export default supabase;
