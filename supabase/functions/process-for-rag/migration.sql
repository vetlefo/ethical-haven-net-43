
-- Migration to add database trigger for async embedding generation

-- First, make sure we have the pg_net extension for making HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Make sure we have the necessary tables
DO $$
BEGIN
    -- Create rag_documents table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rag_documents') THEN
        CREATE TABLE public.rag_documents (
            document_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            summary TEXT,
            content_type TEXT,
            country TEXT,
            region TEXT,
            categories TEXT[],
            regulations TEXT[],
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );
    END IF;

    -- Create rag_chunks table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'rag_chunks') THEN
        CREATE TABLE public.rag_chunks (
            id BIGSERIAL PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES public.rag_documents(document_id),
            chunk_id TEXT NOT NULL,
            text TEXT NOT NULL,
            position INTEGER,
            section TEXT,
            source TEXT,
            embedding vector(768),
            embedding_status TEXT DEFAULT 'pending',
            embedding_error TEXT,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            UNIQUE(document_id, chunk_id)
        );

        -- Add index for similarity search
        CREATE INDEX IF NOT EXISTS rag_chunks_embedding_idx ON public.rag_chunks 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
    END IF;

    -- Add embedding_status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rag_chunks' 
        AND column_name = 'embedding_status'
    ) THEN
        ALTER TABLE public.rag_chunks ADD COLUMN embedding_status TEXT DEFAULT 'pending';
    END IF;

    -- Add embedding_error column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rag_chunks' 
        AND column_name = 'embedding_error'
    ) THEN
        ALTER TABLE public.rag_chunks ADD COLUMN embedding_error TEXT;
    END IF;
END$$;

-- Function to generate embeddings asynchronously when chunks are inserted
CREATE OR REPLACE FUNCTION process_pending_embeddings()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  project_ref TEXT;
  service_key TEXT;
  result RECORD;
BEGIN
  -- Only process rows with embedding_status = 'pending'
  IF NEW.embedding_status = 'pending' THEN
    -- Get the Supabase project reference and service key
    SELECT current_setting('app.settings.supabase_url') INTO project_ref;
    SELECT current_setting('app.settings.service_role_key') INTO service_key;
    
    -- Set up the function URL
    function_url := project_ref || '/functions/v1/generate-single-embedding';
    
    -- Log the request 
    RAISE LOG 'Calling generate-single-embedding for chunk_id: %', NEW.chunk_id;
    
    -- Make an asynchronous HTTP call to the generate-single-embedding function
    SELECT * FROM 
    net.http_post(
        url:=function_url,
        headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body:=jsonb_build_object(
            'chunk_id', NEW.chunk_id,
            'document_id', NEW.document_id,
            'text', NEW.text
        )
    ) INTO result;
    
    -- Log the result ID for tracking
    RAISE LOG 'Async HTTP request sent: %', result;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trigger_process_pending_embeddings ON public.rag_chunks;
CREATE TRIGGER trigger_process_pending_embeddings
AFTER INSERT ON public.rag_chunks
FOR EACH ROW
EXECUTE FUNCTION process_pending_embeddings();

-- Set the necessary configurations
COMMENT ON FUNCTION process_pending_embeddings() IS 'Triggers async embedding generation for new rag_chunks';

-- Notify schema refresh
NOTIFY pgrst, 'reload schema';
