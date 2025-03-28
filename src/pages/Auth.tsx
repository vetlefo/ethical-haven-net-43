
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        // Special case for admin
        if (loginEmail === 'vetle@reprint.ink') {
          toast({
            title: "Invalid admin password",
            description: "Please check your password and try again",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message || "Invalid credentials. Admin email: vetle@reprint.ink",
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp(signupEmail, signupPassword);
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
      } else {
        setActiveTab('login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="animate-pulse text-cyber-blue">Loading authentication state...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <div className="fixed top-4 left-4 z-10">
        <Button 
          onClick={() => navigate('/')} 
          variant="ghost" 
          className="text-cyber-light hover:text-cyber-blue flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border border-cyber-light/10 bg-cyber-slate/60 backdrop-blur-sm text-cyber-light shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <Shield className="h-10 w-10 text-cyber-blue" />
            </div>
            <CardTitle className="text-2xl font-semibold">
              Welcome to Report<span className="text-cyber-blue">Case</span>
            </CardTitle>
            <CardDescription className="text-cyber-light/70">
              {activeTab === 'login' 
                ? "Sign in to access the platform" 
                : "Create a new account to get started"}
            </CardDescription>
          </CardHeader>
          
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="px-6">
              <TabsList className="grid grid-cols-2 w-full bg-cyber-dark/30">
                <TabsTrigger 
                  value="login"
                  className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-blue"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-cyber-blue/10 data-[state=active]:text-cyber-blue"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-6">
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="vetle@reprint.ink"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-cyber-dark border-cyber-light/20 text-cyber-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-cyber-dark border-cyber-light/20 text-cyber-light"
                    />
                  </div>
                  
                  {loginEmail === 'vetle@reprint.ink' && (
                    <div className="p-2 bg-cyber-blue/10 rounded text-xs border border-cyber-blue/20">
                      <strong>Admin Login:</strong> You're logging in as an administrator.
                    </div>
                  )}
                  
                  <Button 
                    type="submit"
                    className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-cyber-dark border-cyber-light/20 text-cyber-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-cyber-dark border-cyber-light/20 text-cyber-light"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-cyber-dark border-cyber-light/20 text-cyber-light"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-6 pb-6 pt-0">
              <div className="text-xs text-center text-cyber-light/50">
                By continuing, you agree to our <a href="#" className="text-cyber-blue hover:underline">Terms of Service</a> and <a href="#" className="text-cyber-blue hover:underline">Privacy Policy</a>.
              </div>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
