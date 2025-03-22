
import React from 'react';
import { Shield, Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Mail, href: "mailto:contact@cybersecure.com", label: "Email" }
  ];

  const pageLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
    { name: "Terms", href: "#" },
    { name: "Privacy", href: "#" }
  ];

  return (
    <footer className="bg-cyber-dark/80 border-t border-cyber-light/10 pt-12 pb-6 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-cyber-blue" />
              <span className="text-xl font-medium">
                Cyber<span className="text-cyber-blue">Secure</span>
              </span>
            </div>
            <p className="text-cyber-light/70 mb-6">
              Professional ethical hacking and cybersecurity services to protect 
              your digital assets from evolving threats.
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
          
          <div>
            <h3 className="text-lg font-medium mb-4">Newsletter</h3>
            <p className="text-cyber-light/70 mb-4">
              Subscribe to receive security alerts and updates on the latest 
              cybersecurity threats and defenses.
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
        
        <div className="pt-8 border-t border-cyber-light/10 text-center text-cyber-light/60 text-sm">
          <p>© {currentYear} CyberSecure. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
