# Setup Guide for RecipeToBring

## Quick Start Checklist

Follow these steps to get your app running:

### Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name (e.g., "RecipeToBring")
   - Set a strong database password
   - Choose a region close to you

2. **Run the Database Migration**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New Query"
   - Open the file `supabase/migrations/001_initial_schema.sql` from your project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run"
   - You should see "Success. No rows returned" (this is normal)

3. **Get Your API Keys**
   - Go to Project Settings > API
   - Copy these values:
     - **Project URL** (starts with `https://`)
     - **anon public** key
     - **service_role** key (click "Reveal" to see it)

4. **Enable Authentication Providers** (Optional for now)
   - Go to Authentication > Providers
   - Enable Google and/or Apple Sign-In if desired
   - For now, you can skip this as the app uses a dummy user ID

### Step 2: Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OpenAI (already set - no changes needed)
OPENAI_API_KEY=sk-proj-...

# YouTube API (Optional - can get later)
YOUTUBE_API_KEY=your_youtube_api_key_here

# App URL (use localhost for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages (~500 packages, takes 2-3 minutes).

### Step 4: Run Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

### Step 5: Test the App

1. **Visit the homepage**: `http://localhost:3000`
   - You should see a beautiful landing page with animated background

2. **Try adding a recipe**:
   - Click "Add Your First Recipe"
   - Paste a recipe URL (try these examples):
     - `https://www.allrecipes.com/recipe/12151/banana-cream-pie-i/`
     - `https://www.bbcgoodfood.com/recipes/classic-lasagne`
     - Any YouTube cooking video URL
   - Click "Extract Recipe"
   - Wait 5-10 seconds for AI processing
   - Review the extracted recipe
   - Click "Save Recipe"
   - You'll be redirected to the recipe detail page

3. **Test the Bring! button**:
   - On the recipe detail page, you should see a "Add to Bring!" button
   - Click it to add ingredients to Bring! app

## Optional: YouTube API Setup

If you want to properly fetch YouTube video data (otherwise it falls back to scraping):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "YouTube Data API v3"
4. Create credentials > API Key
5. Copy the key and add to `.env.local`

## Creating App Icons for PWA

To create proper PWA icons:

1. Create a 512x512 PNG logo
2. Use a tool like [RealFaviconGenerator](https://realfavicongenerator.net/)
3. Upload your logo
4. Download the generated icons
5. Place them in `public/icons/` folder

For now, the manifest is set up but icons need to be added.

## Troubleshooting

### "Missing required fields" error
- Check that your Supabase credentials are correct in `.env.local`
- Restart the dev server after changing environment variables

### OpenAI API errors
- Verify your API key is valid
- Check you have credits in your OpenAI account
- The app uses GPT-4o which requires a paid account

### Database errors
- Make sure you ran the migration SQL in Supabase
- Check that Row Level Security policies are enabled
- Verify your service_role key is correct

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`

## Deployment to Vercel

1. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/RecipeToBring.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js settings

3. **Add Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from `.env.local`
   - **Important**: Update `NEXT_PUBLIC_APP_URL` to your Vercel URL

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

5. **Update Supabase**:
   - Go to Supabase > Authentication > URL Configuration
   - Add your Vercel domain to "Redirect URLs"
   - Pattern: `https://your-app.vercel.app/**`

## Next Steps

- [ ] Add real authentication (replace dummy user ID)
- [ ] Create custom PWA icons
- [ ] Test on mobile devices
- [ ] Add user profile page
- [ ] Implement favorites functionality
- [ ] Add search and filtering
- [ ] Set up error monitoring (Sentry)

## Support

If you encounter issues:
1. Check the console for errors
2. Review the README.md
3. Check Supabase logs
4. Verify all environment variables are set

Happy cooking! 👨‍🍳
