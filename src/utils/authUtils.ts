
import { supabase } from '@/integrations/supabase/client';

/**
 * Get the current authenticated session token
 * @returns The JWT token if authenticated, null otherwise
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Check if the user is currently authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Redirects to login if not authenticated
 * @param navigate The react-router-dom navigate function
 * @returns True if authenticated, false otherwise
 */
export const requireAuth = async (navigate: any): Promise<boolean> => {
  const authenticated = await isAuthenticated();
  if (!authenticated && navigate) {
    navigate('/');
    return false;
  }
  return authenticated;
};
