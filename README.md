# Wisher 🎁

> Never miss a moment. Always say the perfect thing.

AI-powered personalised wish generator for birthdays, anniversaries, and every special occasion.
Generate unique, heartfelt messages in any tone and any language — powered by Claude AI.

## Live Demo
[wisher.com](https://wisher.com)

## Features
- Add contacts with birthdays, anniversaries, and custom events
- AI-generated unique wishes — never repeated for the same person
- 6 tone options: Warm, Funny, Formal, Emotional, Poetic, Gen Z
- 12+ languages including Hindi, Marathi, Spanish, French
- Dashboard with upcoming events in next 30 days
- One-click copy or share directly to WhatsApp
- Wish history per contact

## Tech Stack
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Database + Auth:** Supabase (PostgreSQL)
- **AI:** Anthropic Claude API
- **Deployment:** Vercel

## Getting Started
1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your keys
4. Run the schema in your Supabase SQL editor: `supabase/schema.sql`
5. Run locally: `npm run dev`

## Environment Variables
See `.env.local.example` for required variables.
