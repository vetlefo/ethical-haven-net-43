# Codebase Analysis Plan: ReportCase

This document outlines the plan for analyzing the `src/` and `supabase/` directories of the ReportCase project to generate a comprehensive structured markdown document.

## 1. Introduction

*   **Project Goal:** Describe the likely purpose (Compliance reporting, RAG, AI-powered content generation based on "ReportCase" name and components).
*   **Technology Stack:** List key technologies (React, Vite, TS, Tailwind, Shadcn UI, Supabase DB/Auth/Functions, Google Gemini).

## 2. Architecture Overview

*   **High-level Description:** Detail the client-server architecture (React SPA + Supabase Backend).
*   **Mermaid Diagram:** Illustrate the main data flow:
    ```mermaid
    graph LR
        A[User Browser] --> B(React Frontend);
        B --> C{Supabase};
        C -- Auth/DB --> D[Supabase Database];
        C -- Function Invocation --> E[Supabase Edge Functions];
        E -- API Call --> F(Google Gemini API);
        E --> D;
    ```

## 3. Frontend Analysis (`src/`)

*   **Directory Structure:** Explain the role of `components/`, `pages/`, `contexts/`, `hooks/`, `services/`, `integrations/`, `lib/`, `utils/`.
*   **Core Application (`App.tsx`, `main.tsx`):** Analyze routing setup (`react-router-dom`), global providers (`QueryClientProvider`, `AuthProvider`, `TooltipProvider`).
*   **Key Pages:** Summarize the purpose of `Index.tsx` (landing), `Admin.tsx` (core admin tools), `Reports.tsx`/`ComplianceReports.tsx` (displaying reports), `ReportDetail.tsx`, `Auth.tsx`, `RAGProcessor.tsx`.
*   **UI Layer:** Mention Tailwind CSS, `index.css` setup, and `components/ui/` (Shadcn UI).
*   **State Management:** Note the use of `@tanstack/react-query` for server state and `AuthContext` for authentication state.
*   **Supabase Integration (`integrations/supabase/client.ts`):** Review client initialization. **Critique:** Highlight the hardcoded API keys as a security risk and inconsistency with `vite-env.d.ts`. Discuss the `apiRoutes` mapping.
*   **Admin Terminal (`src/pages/Admin.tsx`):** Analyze the `TerminalStore` implementation (in-memory, simple pub/sub). Discuss limitations (no persistence, potential memory issues, basic implementation) and suggest improvements.

## 4. Backend Analysis (`supabase/`)

*   **Structure:** Describe the `functions/` directory and `config.toml`.
*   **Edge Functions:** Detail each function's role:
    *   `generate-report`: Input (prompt/content), Gemini interaction (specific model, system prompt, schema), output (structured JSON report).
    *   `process-for-rag`: Dual purpose (RAG prep vs. Competitive Intel). Detail chunking logic, embedding generation (specific model), RAG schema, competitive intel extraction logic/schema. Note the different API key handling (passed in request body).
    *   `admin-*` functions: Infer purpose based on names (likely CRUD operations or specific admin tasks).
    *   `store-report`: Presumed role in persisting generated/processed data to Supabase DB (mention `migration.sql`).
*   **Database:** Note the implicit use of Supabase Postgres.

## 5. Data & Content Analysis (`reports/`)

*   **Directory Structure:** List and categorize files within `reports/`.
*   **Sample Reports:** Analyze the structure and content of sample `.md` reports.
*   **Summary Schema/Output:** Analyze the corresponding `.json` files. Compare their structure to the schemas defined in the Supabase functions (`generate-report`, `process-for-rag`).

## 6. Key Workflows / Data Flows

*   Illustrate the sequence for:
    *   Admin Generating a Report.
    *   Admin Processing Content for RAG Embeddings.
    *   User Authentication Flow (using `AuthContext` and Supabase Auth).

## 7. Analysis & Recommendations

*   **Security:** Emphasize fixing hardcoded keys (`src/integrations/supabase/client.ts`). Recommend using Vite environment variables.
*   **Consistency:** Standardize API key handling in backend functions (prefer Supabase environment variables).
*   **API Routing:** Clarify/document the `/api/...` routing mechanism or refactor to use standard `supabase.functions.invoke`.
*   **Error Handling:** Suggest reviewing frontend error handling for API calls.
*   **Redundancy/Clarity:** Evaluate potential overlap in admin components (`AdminAIReportGenerator`, `AdminRagEmbeddings`, `UnifiedArticleProcessor`).
*   **Scalability:** Note potential performance considerations for chunking/embedding very large documents in `process-for-rag`.
*   **Terminal Improvements:** Summarize suggested improvements for the admin terminal (e.g., persistence, better state management, command history).
*   **Schema Consistency:** Comment on the consistency (or lack thereof) between sample JSON outputs in `reports/` and backend function schemas.

## 8. Conclusion

*   Summarize the application's capabilities and architecture.
*   Reiterate key strengths and areas for improvement.