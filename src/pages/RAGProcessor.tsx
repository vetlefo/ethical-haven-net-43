
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { requireAdmin } from '@/utils/authUtils';
import { useEffect, useState } from 'react';
import RAGContentProcessor from '@/components/RAGContentProcessor';
import Footer from '@/components/Footer';

const RAGProcessor: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authorized = await requireAdmin(navigate);
      setIsAuthorized(authorized);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyber-blue/20 border-t-cyber-blue rounded-full"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // The requireAdmin function will handle redirection
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyber-light">RAG Content Processor</h1>
          <p className="text-cyber-light/70 mt-2">
            Transform raw content into searchable knowledge with AI processing and embeddings
          </p>
        </div>

        <RAGContentProcessor />
      </main>
      <Footer />
    </div>
  );
};

export default RAGProcessor;
