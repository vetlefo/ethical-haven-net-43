
-- Check if the is_rag_enabled column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'compliance_reports'
        AND column_name = 'is_rag_enabled'
    ) THEN
        ALTER TABLE public.compliance_reports
        ADD COLUMN is_rag_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
