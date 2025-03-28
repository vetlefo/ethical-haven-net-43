
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
 * Check if user is an admin by checking their email against the allowed admin email
 * @returns True if user is admin, false otherwise
 */
export const isAdmin = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    const userEmail = data.session?.user?.email?.toLowerCase();
    
    // Check if user email matches the admin email
    // This should be made more secure in production by using a proper role system
    return userEmail === 'vetle@reprint.ink';
  } catch (error) {
    console.error('Error checking admin status:', error);
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

/**
 * Checks if user is authenticated and an admin, redirects if not
 * @param navigate The react-router-dom navigate function
 * @returns True if authenticated and admin, false otherwise
 */
export const requireAdmin = async (navigate: any): Promise<boolean> => {
  const authenticated = await requireAuth(navigate);
  if (!authenticated) return false;
  
  const admin = await isAdmin();
  if (!admin && navigate) {
    navigate('/');
    return false;
  }
  
  return true;
};
