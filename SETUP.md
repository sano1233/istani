# Istani Fitness Platform - Complete Setup Guide

## 🎯 What You're Building

An **autonomous AI-powered fitness platform** that:
- ✅ Remembers every user's data, progress, and preferences (Supabase)
- ✅ Generates personalized workout & meal plans (Gemini AI server-side)
- ✅ Provides scientific fitness education
- ✅ Monetizes with Google AdSense
- ✅ Gives users MASSIVE value for FREE

## 📋 Prerequisites

You need accounts for:
1. **Supabase** (database & auth) - https://supabase.com
2. **Vercel** (hosting) - https://vercel.com
3. **GitHub** (code repository)

## 🚀 Step 1: Set Up Supabase (10 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: istani-fitness
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### 1.2 Run Database Schema
1. In Supabase dashboard, click "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy ENTIRE contents of `supabase-schema.sql` file
4. Paste into SQL editor
5. Click "Run" button
6. You should see "Success. No rows returned"

### 1.3 Get Your Keys
1. Click "Project Settings" (gear icon in sidebar)
2. Click "API" in left menu
3. Copy these values (you'll need them):
   - **Project URL**: `https://kxsmgrlpojdsgvjdodda.supabase.co`
   - **anon/public key**: Long string starting with `eyJ...`
   - **service_role key**: Different long string starting with `eyJ...`

## 🔑 Step 2: Configure Environment Variables

### 2.1 Update `.env.local`
Replace these values in your `.env.local` file:

```bash
# Supabase (from Step 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://kxsmgrlpojdsgvjdodda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# Google Gemini API
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Anthropic Claude API (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# LLM provider selection: huggingface | gemini | claude
LLM_PROVIDER=gemini

# OpenRouter (optional, unified access to many models)
OPENROUTER_API_KEY=your_openrouter_api_key
# Default model for OpenRouter if not passed per request
OPENROUTER_MODEL=qwen/qwen-2.5-coder-32b-instruct

# Google AdSense (ALREADY CONFIGURED - DON'T CHANGE)
NEXT_PUBLIC_GOOGLE_ADS_CLIENT=ca-pub-2695159317297870
```

### 2.2 Never Commit Secrets
The `.env.local` file is in `.gitignore` - it will NEVER be committed to GitHub.

## 🏗️ Step 3: Deploy to Vercel (5 minutes)

### 3.1 Push to GitHub
```bash
cd /c/Users/mypow/istani
git add -A
git commit -m "Complete fitness platform with AI agent"
git push origin master
```

### 3.2 Deploy on Vercel
1. Go to https://vercel.com/new
2. Import `sano1233/istani` repository
3. Click "Deploy" (don't add env vars yet)
4. Wait for initial deploy to complete

### 3.3 Add Environment Variables in Vercel
1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add these **one by one**:

| **Name** | **Value** |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://kxsmgrlpojdsgvjdodda.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key from Supabase |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_MODEL` | Default OpenRouter model (e.g., `qwen/qwen-2.5-coder-32b-instruct`) |
| `LLM_PROVIDER` | `huggingface`, `gemini`, `claude`, or `openrouter` |
| `NEXT_PUBLIC_GOOGLE_ADS_CLIENT` | `ca-pub-2695159317297870` |
| `NEXT_PUBLIC_HOME_URL` | `https://istani.store` |
| `NEXT_PUBLIC_SUPPORT_URL` | `https://buymeacoffee.com/istanifitn` |

4. Click "Redeploy" after adding all variables

## ✅ Step 4: Test Your Platform

### 4.1 Visit Your Site
Go to: `https://your-project.vercel.app`

### 4.2 Create Test Account
1. Click "Sign Up"
2. Enter email and password
3. Check email for verification link
4. Click verification link
5. Log in!

### 4.3 Test AI Features
1. Complete your profile (age, weight, goals)
2. Click "Generate Workout Plan"
3. Wait 10-15 seconds
4. See personalized AI-generated plan!

## 🎨 What's Included

### User Features
- ✅ Secure authentication (Supabase Auth)
- ✅ User profiles with goals and metrics
- ✅ AI-generated personalized workout plans
- ✅ AI-generated personalized meal plans
- ✅ Progress tracking (weight, measurements)
- ✅ Scientific fitness education content
- ✅ Google Ads monetization

### Technical Features
- ✅ Server-side AI generation (Gemini NEVER exposed to client)
- ✅ Row-level security (users only see their data)
- ✅ Real-time database (Supabase)
- ✅ Scalable architecture
- ✅ Mobile responsive design

## 🔐 Security Features

### What's Protected
- ✅ API keys NEVER sent to client
- ✅ User data isolated by user ID
- ✅ SQL injection prevention (Supabase RLS)
- ✅ XSS prevention
- ✅ CSRF protection
- ✅ Secure authentication flow

### How It Works
1. User logs in → Gets session token
2. User requests AI plan → Token sent to server
3. Server verifies token with Supabase
4. Server calls Gemini API (user never sees key)
5. Server saves result to database
6. Client receives data

## 💰 Monetization (Hormozi Model)

### Value Ladder
1. **FREE tier** (current): Basic calculators, AI plans
2. **Paid tier** (future): 1-on-1 coaching, advanced analytics
3. **Enterprise tier** (future): Gym management software

### Google AdSense
- Already integrated in `src/app/page.tsx`
- Ad ID: `ca-pub-2695159317297870`
- Earns revenue from every page view

## 📊 Database Structure

### Tables Created
- `user_profiles` - User data and preferences
- `workout_plans` - AI-generated workouts
- `meal_plans` - AI-generated nutrition plans
- `progress_entries` - Weight/measurement tracking
- `ai_generations` - AI usage tracking

### Row Level Security
Every table has RLS enabled - users can ONLY access their own data.

## 🎯 Next Steps

### Immediate (Week 1)
- [ ] Test signup flow
- [ ] Generate sample AI plans
- [ ] Share with 10 friends
- [ ] Monitor Google AdSense revenue

### Short Term (Month 1)
- [ ] Add more workout templates
- [ ] Create nutrition database
- [ ] Add progress charts/graphs
- [ ] Collect user feedback

### Long Term (Quarter 1)
- [ ] Mobile app (React Native)
- [ ] Paid coaching tier
- [ ] Community features
- [ ] Advanced analytics

## 🆘 Troubleshooting

### "Supabase URL not found"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
- Restart dev server: `npm run dev`

### "Failed to generate plan"
- Check Gemini API key is correct
- Check Vercel environment variables
- Look at Vercel logs for errors

### "Unable to sign up"
- Check Supabase email settings
- Confirm email verification is enabled
- Check spam folder for verification email

## 📞 Support

- **Issues**: https://github.com/sano1233/istani/issues
- **Email**: simplelogin-newsletter.from340@simplelogin.com
- **Coffee**: https://buymeacoffee.com/istanifitn

---

**Built with Claude Code, Gemini 2.0, Supabase, and MCP** 🚀
