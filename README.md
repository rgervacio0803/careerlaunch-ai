# CareerLaunch AI

Upload a resume and paste a job description to get an ATS score, recruiter-style insights, an optimized resume in eight templates, a tailored cover letter, and interview prep. Everything downloads as text-based PDFs that ATS software can read.

CareerLaunch AI is free during early access. Users need an account (Supabase Auth).

## How it fits together

- **Frontend** (`/`): React 19 + Vite. Supabase handles sign-up and log-in in the browser.
- **API server** (`/server`): Express. Reads PDF/DOCX/TXT resumes and calls OpenAI. Every AI endpoint checks the user's Supabase access token and is rate-limited per user.

Resumes and job descriptions are sent to the server and OpenAI to generate results; the API server itself stores nothing. Once an application has an ATS analysis, the browser saves it to the user's account in the Supabase `applications` table (protected by row-level security, so users only see their own rows). Users can reopen or delete saved applications from **My Applications**. The current wizard state is also kept in the browser tab (`sessionStorage`) so a refresh doesn't lose work.

## Run it locally

You need Node.js 20.19 or newer, a Supabase project, and an OpenAI API key.

1. Frontend settings: copy `.env.example` to `.env.local` and fill in your Supabase URL and publishable key.
2. Server settings: copy `server/.env.example` to `server/.env` and fill in `OPENAI_API_KEY`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` (same Supabase project).
3. Database: in Supabase, open **SQL Editor → New query**, paste `supabase/migrations/20261027_create_applications.sql`, and click **Run**. This creates the `applications` table used for saved applications.
4. Install and start both:

```bash
npm install
npm run dev            # http://localhost:5173

cd server
npm install
npm start              # http://localhost:5000
```

## Deploying

- Set `VITE_API_URL` on the frontend host to the server's public URL.
- Set `CLIENT_URL` on the server to the frontend's public URL (comma-separate several). Requests from other sites are blocked.
- In Supabase → Authentication → URL Configuration, set the Site URL to the frontend URL so confirmation emails link to the right place.
- Never commit `.env`, `.env.local` or `server/.env`; they are already in `.gitignore`.

## Turning on payments later

Stripe code is in `server/index.js` but off (`ENABLE_PAYMENTS=false`). Before turning it on:

1. Save each user's plan from the webhook (`checkout.session.completed`, `customer.subscription.updated` / `deleted`), for example in a Supabase `profiles` table.
2. Enforce free-plan limits on the server using that saved plan.
3. Bring back the Pro checkout button on the landing page and handle `?payment=success`.
4. Add a link to Stripe's Customer Portal so users can cancel.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the frontend dev server |
| `npm run build` | Build the frontend into `dist/` |
| `npm run lint` | Lint the frontend and server |
| `cd server && npm start` | Start the API server |
