# Codebase Analysis: ReportCase

This document provides a comprehensive analysis of the `src/` (frontend) and `supabase/` (backend) directories of the ReportCase project, based on the file structure and key source files examined.

## 1. Introduction

*   **Project Goal:** Based on the name "ReportCase", the presence of compliance-focused sample reports (`reports/`), and admin components like `AdminAIReportGenerator` and `AdminRagEmbeddings`, the project appears to be a web application designed for generating, managing, and potentially analyzing compliance reports. It likely leverages AI (specifically Google Gemini) for content generation and Retrieval-Augmented Generation (RAG) for information processing or querying.
*   **Technology Stack:**
    *   **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI (`components/ui/`), React Router (`react-router-dom`), TanStack Query (`@tanstack/react-query`).
    *   **Backend:** Supabase (Database, Authentication, Edge Functions), Deno (Edge Function runtime).
    *   **AI:** Google Gemini (Pro for generation/extraction, Embedding model for RAG).

## 2. Architecture Overview

*   **High-level Description:** The project follows a standard modern web application architecture: a Single Page Application (SPA) built with React serving as the frontend, communicating with a backend hosted on Supabase. Supabase provides database storage, user authentication, and serverless compute via Edge Functions written in TypeScript/Deno. These Edge Functions interact with external AI services (Google Gemini API) for core processing tasks.
*   **Mermaid Diagram:**
    ```mermaid
    graph LR
        A[User Browser] --> B(React Frontend - Vite/TS);
        B --> C{Supabase Platform};
        C -- Auth/DB Queries --> D[Supabase PostgreSQL DB];
        C -- Function Invocation --> E[Supabase Edge Functions (Deno)];
        E -- API Call --> F(Google Gemini API);
        E --> D;
    ```

## 3. Frontend Analysis (`src/`)

*   **Directory Structure:**
    *   `components/`: Reusable UI components, including general UI (`ui/` - Shadcn), page-specific sections (e.g., `Hero.tsx`, `About.tsx`), and feature-specific components (`admin/`, `rag/`, `research/`).
    *   `pages/`: Top-level page components corresponding to application routes (e.g., `Index.tsx`, `Admin.tsx`, `Reports.tsx`).
    *   `contexts/`: React Context providers, notably `AuthContext.tsx` for managing user authentication state.
    *   `hooks/`: Custom React hooks (e.g., `use-mobile.tsx`, `use-toast.ts`, `useContentProcessing.ts`, and specific hooks within admin components).
    *   `services/`: Functions for interacting with backend APIs or data sources (e.g., `reportService.ts`).
    *   `integrations/`: Code specific to integrating with external services, currently `supabase/`.
    *   `lib/`: Utility functions, often framework-related (e.g., `utils.ts` from Shadcn).
    *   `utils/`: General utility functions and potentially static data (e.g., `authUtils.ts`, `reportData.ts`).
*   **Core Application (`App.tsx`, `main.tsx`):**
    *   `main.tsx`: Standard Vite entry point, rendering the `App` component into the DOM.
    *   `App.tsx`: Sets up global providers (`QueryClientProvider` for TanStack Query, `TooltipProvider` for Shadcn UI tooltips, `AuthProvider` for authentication). Defines application routes using `BrowserRouter` and `Routes` from `react-router-dom`, mapping paths to page components (`Index`, `Reports`, `Admin`, `Auth`, etc.) and includes a catch-all `NotFound` route. Imports global styles (`index.css`) and component-specific styles (`App.css`). Includes global notification components (`Toaster`, `Sonner`).
*   **Key Pages:**
    *   `Index.tsx`: Public landing page, composed of various presentational components (`Hero`, `About`, `Services`, etc.) with scroll-reveal effects.
    *   `Admin.tsx`: Protected admin dashboard using `Tabs` to switch between `AdminAIReportGenerator`, `AdminRagEmbeddings`, and `UnifiedArticleProcessor` components. Implements authentication checks using `AuthContext` and redirects unauthorized users. Includes an admin operations log (`Terminal`).
    *   `Reports.tsx`/`ComplianceReports.tsx`: Likely display lists of generated reports, potentially fetching data via `reportService.ts` and TanStack Query.
    *   `ReportDetail.tsx`: Displays the content of a specific report, identified by an ID in the route.
    *   `Auth.tsx`: Handles user login/signup, interacting with `AuthContext` and Supabase Auth.
    *   `RAGProcessor.tsx`: Likely provides a user interface for interacting with the RAG functionality (content processing, querying).
*   **UI Layer:** Uses Tailwind CSS for utility-first styling (`tailwind.config.ts`, `postcss.config.js`, `index.css`). Leverages Shadcn UI for pre-built, customizable components (`components/ui/`, `components.json`). Global styles and CSS variables (including dark mode) are defined in `index.css`. `App.css` contains some basic root styling.
*   **State Management:**
    *   Server state (data fetching, caching, mutations) is likely managed by TanStack Query (`@tanstack/react-query`), initialized in `App.tsx`.
    *   Authentication state (user object, loading status, admin status, login/logout functions) is managed globally via `AuthContext.tsx`.
    *   Local component state is managed using React's `useState` and `useEffect` hooks.
*   **Supabase Integration (`integrations/supabase/client.ts`):**
    *   Initializes the Supabase JavaScript client.
    *   **Critique:** Contains **hardcoded** Supabase URL and Anon Key. This is a significant security risk, exposing credentials directly in the frontend code. These should be loaded from environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` defined in `vite-env.d.ts`) using `import.meta.env.VITE_...`.
    *   Defines an `apiRoutes` object mapping logical names to string paths (e.g., `/api/generate-report`). This mapping seems unconventional for Supabase function invocation, which typically uses `supabase.functions.invoke('function-name')`. This might indicate a custom proxy/gateway or simply be an internal convention for organizing function calls, but it warrants clarification.
*   **Admin Terminal (`src/pages/Admin.tsx`):**
    *   Implements a simple, in-memory logging mechanism using a static `TerminalStore` class.
    *   Uses a basic publish-subscribe pattern (`addLine`, `subscribe`, `notifyListeners`) to update the `Terminal` component.
    *   **Critique & Improvements:**
        *   **Lack of Persistence:** Logs are lost on page refresh or session end. Consider using `localStorage`/`sessionStorage` for simple persistence or integrating with a backend logging solution for more robust needs.
        *   **Scalability:** Storing potentially many log lines in memory could become inefficient. The current limit (100 lines) mitigates this somewhat, but a more robust solution might be needed for heavy usage.
        *   **State Management:** Using a static class for shared state outside of React's standard state management can sometimes lead to unexpected behavior or difficulties in testing. Consider integrating log state into a React context or a dedicated state management library if complexity increases.
        *   **Features:** Could be enhanced with features like filtering, searching, clearing logs, or copying log content.

## 4. Backend Analysis (`supabase/`)

*   **Structure:**
    *   `config.toml`: Contains the Supabase project ID (`kxvjrktpadujfcxpfuxi`).
    *   `functions/`: Contains individual Supabase Edge Functions, each in its own subdirectory with an `index.ts` entry point and often a `config.toml` for function-specific settings (like JWT verification).
*   **Edge Functions:**
    *   `generate-report/index.ts`:
        *   **Purpose:** Accepts a prompt or raw content via POST request and uses the Gemini Pro model (`gemini-2.5-pro-exp-03-25`) to generate a structured compliance report.
        *   **AI Interaction:** Employs a detailed system prompt instructing the AI to act as a German compliance expert and adhere strictly to a provided JSON schema (`reportSchema`).
        *   **Output:** Returns the generated report as a JSON object within a `{ success: true, reportJson: ... }` structure.
        *   **Dependencies:** Requires `GEMINI_API_KEY` from Supabase environment variables.
    *   `process-for-rag/index.ts`:
        *   **Purpose:** Dual-purpose function determined by `contentType` in the request body.
        *   **RAG Prep:** If not 'competitive-intel', it chunks input text (`splitIntoChunks`), generates embeddings using a Gemini embedding model (`gemini-embedding-exp-03-07`), and structures the output according to `ragSchema` (including document/chunk IDs, text, metadata, and embeddings).
        *   **Competitive Intel:** If 'competitive-intel', it uses Gemini Pro (`gemini-2.5-pro-exp-03-25`) with a specific prompt (`competitiveIntelInstruction`) and schema (`competitiveIntelSchema`) to extract structured competitor data from a larger report text.
        *   **Output:** Returns the processed content (either RAG JSON or competitive intel JSON) as a string within `{ success: true, processedContent: "..." }`.
        *   **Dependencies:** Requires `geminiApiKey` to be passed in the *request body*. **Inconsistency:** This differs from `generate-report`'s use of environment variables.
    *   `admin-*` functions (`admin-competitive-intel`, `admin-rag-embeddings`, `admin-reports`): Based on names and typical Supabase patterns, these likely handle administrative tasks related to their respective domains, potentially involving CRUD operations on the Supabase database (e.g., storing/retrieving processed embeddings, reports, or competitive intelligence data). They might require admin-level authentication enforced via JWT verification in their `config.toml`.
    *   `store-report/index.ts`: Likely responsible for taking a generated report (presumably in the format defined by `generate-report`'s schema) and storing it in the Supabase database. The presence of `migration.sql` suggests it defines or modifies the necessary database table structure for reports.
*   **Database:** Implicitly uses the Supabase PostgreSQL database for storing application data, including user authentication details (managed by Supabase Auth) and likely the generated reports, RAG embeddings, and other application-specific data managed by the Edge Functions. The exact schema would be defined by Supabase Auth defaults and custom migrations (like the one in `store-report/`).

## 5. Data & Content Analysis (`reports/`)

*   **Directory Structure:** Contains subdirectories for different report topics (e.g., `african-esg`, `eu-us-whistleblower`, `global-hr-compliance`). Each subdirectory holds:
    *   A `.md` file: The full text of the report (e.g., `ESG-Reporting-in-African-Finance-full.md`).
    *   A `.json` file: A structured summary/analysis of the corresponding `.md` report (e.g., `esg-africa.json`).
*   **Sample Reports (`.md`):** The examined `eu-us-whistleblower` report is a detailed, well-structured document analyzing legal requirements and providing implications for the ReportCase software, including citations.
*   **Summary Schema/Output (`.json`):** The examined `eu-us-whistle.json` contains extracted lists (problems, entities, topics, solutions, tags) and a detailed text summary.
*   **Schema Comparison:** The structure of the sample `.json` summary files is **significantly different** from the JSON schemas defined within the `generate-report` (full report content structure) and `process-for-rag` (chunked/embedded RAG data or competitive intel structure) backend functions. This suggests the sample JSON summaries are generated through a separate process (potentially manual analysis or a different AI prompt/workflow not present in the examined backend code) rather than being direct outputs of the `generate-report` or `process-for-rag` functions.

## 6. Key Workflows / Data Flows

*   **Admin Generating a Report:**
    1.  Admin user navigates to the Admin page (`/admin`).
    2.  Authenticates via `AuthContext`.
    3.  Interacts with `AdminAIReportGenerator` component.
    4.  Submits a prompt/content.
    5.  Frontend likely calls the `generate-report` Supabase function (potentially via the `/api/generate-report` route defined in `client.ts`).
    6.  `generate-report` function calls Gemini API with prompt and schema.
    7.  Gemini returns structured JSON report.
    8.  Function returns JSON to the frontend.
    9.  Frontend displays the result (e.g., in `ResultTab.tsx`).
    10. Admin might trigger saving the report, likely calling the `store-report` function.
*   **Admin Processing Content for RAG Embeddings:**
    1.  Admin user navigates to the Admin page (`/admin`).
    2.  Authenticates via `AuthContext`.
    3.  Interacts with `AdminRagEmbeddings` component (or potentially `UnifiedArticleProcessor`).
    4.  Submits raw content and API key.
    5.  Frontend calls the `process-for-rag` Supabase function (potentially via `/api/process-for-rag`), passing content and API key.
    6.  `process-for-rag` function chunks the text.
    7.  For each chunk, it calls the Gemini Embedding API.
    8.  Function assembles the RAG JSON structure (including embeddings).
    9.  Function returns the structured RAG JSON string to the frontend.
    10. Frontend displays the processed content/status.
    11. Admin might trigger storing embeddings, likely calling `admin-rag-embeddings` function.
*   **User Authentication Flow:**
    1.  User navigates to a protected route or the `/auth` page.
    2.  `AuthProvider` checks Supabase Auth state (`user`, `isLoading`).
    3.  If not logged in, user interacts with `Auth.tsx` page components.
    4.  User submits credentials (email/password or OAuth).
    5.  `AuthContext`'s `signIn` or `signUp` function calls Supabase Auth methods (`supabase.auth.signInWithPassword`, etc.).
    6.  Supabase handles authentication.
    7.  On success, `AuthProvider` updates user state.
    8.  Protected components render, or user is redirected.
    9.  Logout calls `AuthContext`'s `signOut`, which calls `supabase.auth.signOut`.

## 7. Analysis & Recommendations

*   **Security:** **(High Priority)** Remove hardcoded Supabase URL and Anon Key from `src/integrations/supabase/client.ts`. Use Vite environment variables (`import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`) as intended per `vite-env.d.ts`.
*   **Consistency:** Standardize API key handling for Gemini. Prefer using Supabase Edge Function environment variables (configured in Supabase dashboard) over passing keys in request bodies (`process-for-rag`). This enhances security and simplifies configuration.
*   **API Routing:** Clarify the purpose of the `apiRoutes` object in `src/integrations/supabase/client.ts`. If it's just an internal mapping, ensure it's used consistently. If it implies a custom routing layer/proxy, document it. Consider refactoring to use the standard `supabase.functions.invoke('function-name', { body: ... })` method for clarity unless there's a strong reason for the current approach.
*   **Error Handling:** Review frontend error handling for Supabase function calls and other API interactions. Ensure user-friendly error messages are displayed (using `toast` seems common) and potential issues are logged appropriately for debugging. Check if Edge Functions return consistent error formats.
*   **Redundancy/Clarity:** Evaluate the relationship between `AdminAIReportGenerator`, `AdminRagEmbeddings`, and `UnifiedArticleProcessor` in the Admin panel. Ensure their purposes are distinct and clear to the user, or consider consolidating overlapping functionality into a more streamlined workflow.
*   **Scalability:** The `process-for-rag` function's chunking and embedding loop could face performance bottlenecks or timeouts with very large documents. Consider implementing background processing (e.g., using Supabase database triggers or queues if available) for long-running embedding tasks. Also, review the embedding model's rate limits.
*   **Terminal Improvements:** Enhance the `TerminalStore` in `src/pages/Admin.tsx`:
    *   Add persistence using `localStorage` or `sessionStorage`.
    *   Consider a more robust state management approach if complexity grows (e.g., Zustand, Jotai, or a dedicated context).
    *   Add features like clear, copy, filter, or search.
*   **Schema Consistency:** Document the discrepancy between the JSON summary structure found in `reports/` and the schemas used in the backend functions (`generate-report`, `process-for-rag`). Clarify how the summary JSON files are generated and ensure consistency if they are intended to be programmatically produced or consumed.
## 9. RAG Search Implementation Considerations

Implementing a RAG search feature using the existing embedding infrastructure is a logical extension of the current capabilities. Here are key considerations and potential steps:

*   **Vector Database:**
    *   **Requirement:** A vector database is needed to store and efficiently query the embeddings generated by the `process-for-rag` function.
    *   **Supabase Integration:** Supabase offers `pgvector`, a PostgreSQL extension for vector similarity search. This is the most natural fit, allowing you to store embeddings alongside their corresponding text chunks and metadata within the existing Supabase database. The `store-report` or `admin-rag-embeddings` functions would need to be updated (or a new function created) to insert the chunk text, metadata, and embedding vector into the appropriate table configured with `pgvector`.
*   **Search Endpoint:**
    *   **Requirement:** A new backend endpoint (Supabase Edge Function) is needed to handle user search queries.
    *   **Function Logic:**
        1.  Accept a user's natural language query.
        2.  Generate an embedding for the user's query using the *same* Gemini embedding model (`gemini-embedding-exp-03-07`) used for document chunking. Consistency here is crucial.
        3.  Perform a vector similarity search (e.g., cosine similarity or inner product) against the stored embeddings in the `pgvector` table to find the most relevant text chunks.
        4.  Retrieve the text content of these top N relevant chunks.
        5.  **(Optional but Recommended) Generation Step:** Pass the user's original query and the retrieved text chunks as context to a generative AI model (like Gemini Pro). Prompt the model to synthesize an answer to the user's query based *only* on the provided context chunks. This step improves the quality and coherence of the final answer.
        6.  Return the synthesized answer (or just the raw retrieved chunks if skipping the generation step) to the frontend.
*   **Frontend Implementation:**
    *   **UI:** Create a search interface (likely within `RAGProcessor.tsx` or a new dedicated page/component) allowing users to input questions.
    *   **API Call:** Call the new search endpoint function when the user submits a query.
    *   **Display:** Render the results returned from the backend (either the synthesized answer or the relevant text snippets). Consider highlighting sources or allowing users to view the original context chunks.
*   **Refinements & Considerations:**
    *   **Chunking Strategy:** The effectiveness of RAG heavily depends on the quality and size of the text chunks. The current `splitIntoChunks` function might need refinement based on search performance and result quality. Experiment with chunk sizes and overlap strategies.
    *   **Metadata Filtering:** Enhance the search by allowing filtering based on metadata stored with the chunks (e.g., source document, category, date) before or after the vector search.
    *   **Prompt Engineering:** Carefully craft the prompt for the final generation step (if used) to ensure the AI stays grounded in the retrieved context and answers the specific user query accurately.
    *   **Performance:** Monitor query latency, especially as the number of stored embeddings grows. Optimize `pgvector` indexing and query parameters.
    *   **Evaluation:** Implement methods to evaluate the quality and relevance of the search results.


## 8. Conclusion

ReportCase is a sophisticated application leveraging React, Supabase, and Google Gemini to provide AI-powered compliance reporting and RAG capabilities. Its strengths lie in its modern frontend stack, use of serverless functions for backend logic, and integration with powerful AI models.

Key areas for improvement include addressing the critical security vulnerability of hardcoded Supabase keys, standardizing API key handling in the backend, clarifying the API routing mechanism, enhancing the admin terminal's persistence and features, and ensuring consistency between different data schemas used throughout the application. Addressing these points will significantly improve the application's security, maintainability, and robustness.