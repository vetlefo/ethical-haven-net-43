
import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('revealed');
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form after showing success message
      setTimeout(() => {
        setFormState({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "contact@cybersecure.com",
      href: "mailto:contact@cybersecure.com"
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567"
    },
    {
      icon: MapPin,
      label: "Office",
      value: "San Francisco, CA, USA",
      href: "#"
    }
  ];

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="py-20 px-6 relative reveal-section"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            Contact
          </div>
          <h2 className="font-bold">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            Ready to secure your systems? Reach out for a consultation
            or to discuss how I can help protect your digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass-card p-8">
            <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-cyber-light/80 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    className="w-full bg-cyber-dark/50 border border-cyber-light/10 rounded-md px-4 py-3 text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cyber-light/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    className="w-full bg-cyber-dark/50 border border-cyber-light/10 rounded-md px-4 py-3 text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-cyber-light/80 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    className="w-full bg-cyber-dark/50 border border-cyber-light/10 rounded-md px-4 py-3 text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-transparent transition-all"
                    placeholder="Security Consultation"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-cyber-light/80 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formState.message}
                    onChange={handleChange}
                    className="w-full bg-cyber-dark/50 border border-cyber-light/10 rounded-md px-4 py-3 text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-transparent transition-all resize-none"
                    placeholder="I'd like to discuss security options for my organization..."
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className={cn(
                      "cyber-button w-full flex items-center justify-center",
                      (isSubmitting || isSubmitted) && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Processing...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div>
            <div className="glass-card p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <a 
                    key={index}
                    href={info.href}
                    className="flex items-start gap-4 group"
                  >
                    <div className="p-3 rounded-full bg-cyber-blue/10 text-cyber-blue">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-cyber-light/70">{info.label}</p>
                      <p className="text-cyber-light group-hover:text-cyber-blue transition-colors">
                        {info.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-2xl font-semibold mb-6">Emergency Response</h3>
              <p className="text-cyber-light/70 mb-4">
                Experiencing a security incident? Get immediate assistance with our priority response service.
              </p>
              <div className="bg-cyber-dark/50 p-4 rounded border border-red-500/20 mb-4">
                <p className="text-red-400 font-medium flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Security Incident Hotline
                </p>
                <p className="text-cyber-light mt-2">+1 (555) 911-CYBER</p>
              </div>
              <p className="text-sm text-cyber-light/60">
                Available 24/7 for urgent security incidents and breaches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
