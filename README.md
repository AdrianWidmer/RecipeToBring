# RecipeToBring

A modern, mobile-first Next.js app that extracts recipes from URLs (websites, YouTube, TikTok) using AI and seamlessly imports ingredients to the Bring! shopping list app.

## Features

- **AI-Powered Recipe Extraction**: Paste any recipe URL and let GPT-4 extract ingredients and instructions
- **Multi-Source Support**: Works with recipe websites, YouTube videos, and TikTok
- **Bring! Integration**: One-click import of ingredients to your Bring! shopping list
- **Modern UI**: Built with ShadCN and Aceternity UI components for a sleek Apple-like design
- **Mobile-First**: Fully responsive, optimized for mobile devices
- **PWA Ready**: Installable on iPad and mobile devices
- **Rate Limiting**: 10 recipe extractions per user per day
- **Public & Private Recipes**: Choose to share recipes or keep them private

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS, ShadCN UI, Aceternity UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google, Apple, Magic Link)
- **AI**: OpenAI GPT-4
- **Video APIs**: YouTube Data API v3
- **Deployment**: Vercel
- **Storage**: Supabase Storage

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- An OpenAI API key
- (Optional) YouTube Data API key

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd RecipeToBring
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. In the SQL Editor, run the migration file:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy and run the entire SQL script

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env


# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
RecipeToBring/
├── app/                      # Next.js App Router pages
│   ├── add/                 # Add recipe page
│   ├── api/                 # API routes
│   ├── explore/             # Browse public recipes
│   ├── recipe/[id]/         # Recipe detail page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── aceternity/          # Aceternity UI effects
│   ├── forms/               # Form components
│   ├── recipe/              # Recipe-specific components
│   └── ui/                  # ShadCN base components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase client & types
│   ├── openai.ts           # OpenAI integration
│   ├── recipe-parser.ts    # Main parsing logic
│   ├── youtube.ts          # YouTube API
│   ├── tiktok.ts           # TikTok scraping
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
└── supabase/              # Database migrations
    └── migrations/
```

## Database Schema

The app uses the following tables:

- **profiles**: User profiles (extends Supabase Auth)
- **recipes**: Stored recipes with ingredients and instructions
- **favorites**: User-favorited recipes
- **recipe_extractions**: Rate limiting tracker

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## API Routes

- `POST /api/recipe/extract`: Extract recipe from URL using AI
- `POST /api/recipe/save`: Save extracted recipe to database

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Add environment variables in Vercel dashboard
5. Deploy!

### Configure Supabase

1. Update `NEXT_PUBLIC_APP_URL` with your Vercel URL
2. Add your Vercel domain to Supabase Auth allowed URLs:
   - Go to Authentication > URL Configuration
   - Add `https://your-domain.vercel.app/*` to redirect URLs

### Enable PWA

The app is already configured as a PWA. When deployed:

1. Users can "Add to Home Screen" on iOS/Android
2. Works offline (after first visit)
3. Custom app icon appears on device

## Authentication (Optional)

Authentication is prepared but not fully implemented. To add it:

1. Enable providers in Supabase (Google, Apple, Magic Link)
2. Implement auth UI components
3. Replace hardcoded user IDs with actual auth

## Rate Limiting

- Users are limited to 10 recipe extractions per 24 hours
- Tracked in `recipe_extractions` table
- Old entries are cleaned up automatically

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

- [Bring! App](https://www.getbring.com/) for the shopping list integration
- [ShadCN UI](https://ui.shadcn.com/) for beautiful components
- [Aceternity UI](https://ui.aceternity.com/) for amazing effects
- [OpenAI](https://openai.com/) for GPT-4 recipe extraction
- [Supabase](https://supabase.com/) for backend infrastructure

---

Built with by Adrian Widmer
