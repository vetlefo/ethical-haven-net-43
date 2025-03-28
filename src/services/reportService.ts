
import { supabase } from "@/integrations/supabase/client";

export interface ComplianceReport {
  id: string;
  title: string;
  slug: string;
  country?: string;
  region?: string;
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
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  category?: string;
  author?: string;
  cover_image?: string;
  read_time?: number;
  is_featured: boolean;
}

export const getReports = async (): Promise<ComplianceReport[]> => {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .order('published_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  
  return data || [];
};

export const getReportBySlug = async (slug: string): Promise<ComplianceReport | null> => {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) {
    console.error(`Error fetching report by slug "${slug}":`, error);
    return null;
  }
  
  return data;
};

export const getFeaturedReports = async (): Promise<ComplianceReport[]> => {
  const { data, error } = await supabase
    .from('compliance_reports')
    .select('*')
    .eq('is_featured', true)
    .order('published_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching featured reports:', error);
    return [];
  }
  
  return data || [];
};
