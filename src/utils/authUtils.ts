
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
    const isAuth = !!data.session;
    console.log('Auth check result:', isAuth, data.session?.user?.email);
    return isAuth;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Login with email and password
 * @param email User email
 * @param password User password
 * @returns Success status and any error message
 */
export const loginWithCredentials = async (
  email: string, 
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Attempting login for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('Login successful for:', data.user?.email);
    return { success: true };
  } catch (error) {
    console.error('Unexpected login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
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
    
    console.log('Admin check for email:', userEmail);
    
    // Check if user email matches the admin email
    // This should be made more secure in production by using a proper role system
    const isAdminUser = userEmail === 'vetle@reprint.ink';
    console.log('Is admin user:', isAdminUser);
    return isAdminUser;
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
    console.log('User not authenticated, redirecting to home');
    toast({
      title: "Authentication Required",
      description: "Please login to access this page",
      variant: "destructive",
    });
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
    console.log('User not an admin, redirecting to home');
    toast({
      title: "Access Denied",
      description: "You don't have administrator privileges",
      variant: "destructive",
    });
    navigate('/');
    return false;
  }
  
  return true;
};

