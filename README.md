# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5a5d0a14-13b3-4bb1-993a-1028b52fa349

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5a5d0a14-13b3-4bb1-993a-1028b52fa349) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables.
# Create a file named .env in the project root directory.
# Add the following lines, replacing the placeholder values with your actual Supabase credentials:
# VITE_SUPABASE_URL=YOUR_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

### Environment Variables

This project requires the following environment variables to connect to Supabase:

*   `VITE_SUPABASE_URL`: Your Supabase project URL.
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase project anon key.

Create a `.env` file in the root of the project and add these variables:

```dotenv
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

**Important:** Ensure the `.env` file is added to your `.gitignore` file to prevent accidentally committing sensitive keys.

### Supabase Edge Functions Environment Variables

The Supabase Edge Functions (located in `supabase/functions/`) require their own environment variables, which need to be set in the Supabase project dashboard or via the Supabase CLI. The key variable identified is:

*   `GEMINI_API_KEY`: Your API key for the Google Gemini service, used for AI report generation and embedding creation.

Refer to the [Supabase documentation on Edge Function environment variables](https://supabase.com/docs/guides/functions/environment-variables) for instructions on how to set these.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5a5d0a14-13b3-4bb1-993a-1028b52fa349) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
