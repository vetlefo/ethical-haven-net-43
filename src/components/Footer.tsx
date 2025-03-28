import React, { useState } from 'react';
import { Shield, Github, Linkedin, Twitter, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { loginWithCredentials } from '@/utils/authUtils';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contact@reportcase.com", label: "Email" }
  ];

  const pageLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" }
  ];

  const onSubmitLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const { success, error } = await loginWithCredentials(values.email, values.password);
      
      if (!success) {
        throw new Error(error || "Login failed. Please check your credentials.");
      }
      
      toast({
        title: "Login successful",
        description: "Redirecting to admin panel...",
      });
      
      // Close the dialog and navigate to admin page
      setIsLoginOpen(false);
      navigate('/admin');
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Email: vetle@reprint.ink",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-cyber-dark/80 border-t border-cyber-light/10 pt-12 pb-6 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* First column - Logo and socials */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-cyber-blue" />
              <span className="text-xl font-medium">
                Report<span className="text-cyber-blue">Case</span>
              </span>
            </div>
            <p className="text-cyber-light/70 mb-6">
              Comprehensive market research on international compliance software 
              opportunities across Europe, US, Asia, and Africa.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href}
                  aria-label={link.label}
                  className="p-2 rounded-full bg-cyber-light/5 text-cyber-light/70 hover:bg-cyber-blue/20 hover:text-cyber-blue transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Second column - Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Links</h3>
            <ul className="space-y-3">
              {pageLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-cyber-light/70 hover:text-cyber-blue transition-colors relative group overflow-hidden block"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-blue transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Third column - Newsletter */}
          <div>
            <h3 className="text-lg font-medium mb-4">Newsletter</h3>
            <p className="text-cyber-light/70 mb-4">
              Subscribe to receive our research updates and insights on the latest 
              international compliance market trends.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-cyber-dark border border-cyber-light/10 rounded-l-md px-4 py-2 text-cyber-light w-full focus:outline-none focus:ring-1 focus:ring-cyber-blue"
              />
              <button 
                type="submit" 
                className="bg-cyber-blue px-4 py-2 rounded-r-md text-cyber-dark font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-cyber-light/10 text-center text-cyber-light/60 text-sm flex justify-between items-center">
          <p>© {currentYear} ReportCase. All rights reserved.</p>
          
          {/* Subtle admin login link */}
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="text-cyber-light/30 hover:text-cyber-light/60 transition-colors flex items-center space-x-1 text-xs"
          >
            <Lock className="w-3 h-3" />
            <span>Admin</span>
          </button>
        </div>
      </div>
      
      {/* Admin Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-cyber-dark border border-cyber-light/10 text-cyber-light w-full max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyber-blue" />
              Admin Access
            </DialogTitle>
            <DialogDescription className="text-cyber-light/70">
              Enter your credentials to access the admin dashboard.
              <div className="mt-2 p-2 bg-cyber-light/5 rounded text-xs border border-cyber-blue/20">
                <strong>Admin Email:</strong> vetle@reprint.ink
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyber-light">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="vetle@reprint.ink" 
                        className="bg-cyber-slate border-cyber-light/20 text-cyber-light" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-cyber-light">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        className="bg-cyber-slate border-cyber-light/20 text-cyber-light" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLoginOpen(false)}
                  className="border-cyber-light/20 text-cyber-light hover:bg-cyber-light/5"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-cyber-blue hover:bg-cyber-blue/80 text-cyber-dark"
                  disabled={isLoading}
                >
                  {isLoading ? "Authenticating..." : "Login"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </footer>
  );
};

export default Footer;
