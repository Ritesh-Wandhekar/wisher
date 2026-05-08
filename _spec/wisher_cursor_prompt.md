# Wisher.com — Cursor Prompt (Phase 1 MVP)
> Paste this entire prompt into Cursor/Windsurf with your empty cloned repo open.

---

## PROJECT OVERVIEW

Build a full-stack web app called **Wisher** — an AI-powered wish generator that helps users never forget birthdays, anniversaries, and important events. Users add contacts with event dates, and the app uses Claude AI to generate a unique, personalised wish every single time — in any tone and any language.

This is Phase 1 MVP. Build everything listed below completely. Do not skip any section.

---

## TECH STACK

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Database + Auth:** Supabase (PostgreSQL + Google OAuth)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Deployment target:** Vercel
- **Package manager:** npm

---

## INITIAL SETUP TASKS

1. Initialise a Next.js 15 project with TypeScript and Tailwind CSS (App Router, no src/ directory, use `app/` at root).
2. Install and configure shadcn/ui.
3. Install dependencies:
   - `@supabase/supabase-js`
   - `@supabase/ssr`
   - `@anthropic-ai/sdk`
   - `date-fns`
   - `lucide-react`
4. Create a `.gitignore` file. Make sure `.env.local` is included so API keys are never pushed to GitHub.
5. Create a `.env.local.example` file (no real values, just variable names with blank values) so other developers know what keys are needed.
6. Create a proper `README.md` (described at the end of this prompt).

---

## ENVIRONMENT VARIABLES

The app needs these variables in `.env.local`. Create `.env.local.example` with these names and empty values:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
```

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

Create a file `supabase/schema.sql` with the following SQL. The user will run this in their Supabase SQL editor.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (auto-created from Supabase auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Contacts table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  relationship text not null, -- e.g. 'Friend', 'Family', 'Colleague', 'Partner'
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Events table (birthdays, anniversaries, custom)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  contact_id uuid references public.contacts on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  type text not null, -- 'birthday', 'anniversary', 'custom'
  title text not null, -- e.g. 'Birthday', 'Work Anniversary', 'Graduation'
  date date not null, -- store as date (YYYY-MM-DD), year can be null for recurring
  is_recurring boolean default true, -- true = happens every year
  created_at timestamp with time zone default timezone('utc', now())
);

-- Wish history (so AI never repeats a wish for same person)
create table public.wish_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  contact_id uuid references public.contacts on delete cascade not null,
  event_id uuid references public.events on delete cascade not null,
  wish_text text not null,
  language text not null default 'English',
  tone text not null default 'Warm',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Row Level Security (RLS) — users can only see their own data
alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.events enable row level security;
alter table public.wish_history enable row level security;

create policy "Users can manage their own profile" on public.profiles
  for all using (auth.uid() = id);

create policy "Users can manage their own contacts" on public.contacts
  for all using (auth.uid() = user_id);

create policy "Users can manage their own events" on public.events
  for all using (auth.uid() = user_id);

create policy "Users can manage their own wish history" on public.wish_history
  for all using (auth.uid() = user_id);
```

---

## PROJECT STRUCTURE

Create this exact folder and file structure:

```
wisher/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← sidebar + header wrapper
│   │   ├── page.tsx            ← dashboard home (upcoming events)
│   │   ├── contacts/
│   │   │   ├── page.tsx        ← contacts list
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← single contact detail + events
│   │   └── generate/
│   │       └── page.tsx        ← wish generator page
│   ├── api/
│   │   ├── generate-wish/
│   │   │   └── route.ts        ← POST: calls Claude API
│   │   ├── contacts/
│   │   │   └── route.ts        ← GET, POST
│   │   ├── contacts/[id]/
│   │   │   └── route.ts        ← GET, PUT, DELETE
│   │   ├── events/
│   │   │   └── route.ts        ← GET, POST
│   │   └── events/[id]/
│   │       └── route.ts        ← GET, PUT, DELETE
│   ├── globals.css
│   └── layout.tsx              ← root layout with fonts
├── components/
│   ├── ui/                     ← shadcn/ui components go here
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── contacts/
│   │   ├── ContactCard.tsx
│   │   ├── ContactForm.tsx
│   │   └── ContactList.tsx
│   ├── events/
│   │   ├── EventForm.tsx
│   │   └── EventBadge.tsx
│   ├── wishes/
│   │   ├── WishGenerator.tsx   ← main AI wish UI
│   │   ├── WishCard.tsx
│   │   └── ToneSelector.tsx
│   └── dashboard/
│       ├── UpcomingEvents.tsx
│       └── StatsCards.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           ← browser Supabase client
│   │   ├── server.ts           ← server Supabase client
│   │   └── middleware.ts
│   ├── claude.ts               ← Claude API helper
│   ├── utils.ts                ← cn() helper + date utils
│   └── constants.ts            ← tones, languages, event types
├── types/
│   └── index.ts                ← TypeScript interfaces
├── middleware.ts                ← Supabase auth middleware
├── supabase/
│   └── schema.sql
├── .env.local.example
├── .gitignore
└── README.md
```

---

## TYPES (types/index.ts)

Define these TypeScript interfaces:

```typescript
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone?: string;
  notes?: string;
  created_at: string;
  events?: Event[];
}

export interface Event {
  id: string;
  contact_id: string;
  user_id: string;
  type: 'birthday' | 'anniversary' | 'custom';
  title: string;
  date: string;
  is_recurring: boolean;
  created_at: string;
  contact?: Contact;
}

export interface WishHistory {
  id: string;
  user_id: string;
  contact_id: string;
  event_id: string;
  wish_text: string;
  language: string;
  tone: string;
  created_at: string;
}

export interface GenerateWishRequest {
  contactName: string;
  contactId: string;
  eventId: string;
  eventType: string;
  eventTitle: string;
  relationship: string;
  tone: string;
  language: string;
  previousWishes: string[];
}

export interface GenerateWishResponse {
  wish: string;
  saved: boolean;
}
```

---

## CONSTANTS (lib/constants.ts)

```typescript
export const TONES = [
  { value: 'Warm', label: 'Warm & Heartfelt', emoji: '🤍' },
  { value: 'Funny', label: 'Funny & Playful', emoji: '😄' },
  { value: 'Formal', label: 'Formal & Professional', emoji: '🤝' },
  { value: 'Emotional', label: 'Emotional & Deep', emoji: '💙' },
  { value: 'Poetic', label: 'Poetic & Lyrical', emoji: '✨' },
  { value: 'GenZ', label: 'Gen Z Vibes', emoji: '🔥' },
];

export const LANGUAGES = [
  'English', 'Hindi', 'Marathi', 'Spanish',
  'French', 'German', 'Japanese', 'Portuguese',
  'Arabic', 'Bengali', 'Tamil', 'Telugu',
];

export const RELATIONSHIP_TYPES = [
  'Best Friend', 'Friend', 'Family', 'Parent',
  'Sibling', 'Partner', 'Spouse', 'Colleague',
  'Boss', 'Mentor', 'Classmate', 'Neighbour',
];

export const EVENT_TYPES = [
  { value: 'birthday', label: 'Birthday', icon: '🎂' },
  { value: 'anniversary', label: 'Anniversary', icon: '💍' },
  { value: 'custom', label: 'Custom Event', icon: '🎉' },
];
```

---

## SUPABASE SETUP (lib/supabase/)

### client.ts — browser client
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### server.ts — server client (for API routes and server components)
Use `createServerClient` from `@supabase/ssr` with cookies from `next/headers`.

### middleware.ts (root level)
Protect all `/` dashboard routes. Redirect unauthenticated users to `/login`. Allow `/login` and `/auth/callback` without auth.

---

## AUTH PAGES

### app/(auth)/login/page.tsx

Clean, minimal login page. Include:
- App name "Wisher" with a small emoji or icon (🎁 or 🌟)
- Tagline: "Never miss a moment. Always say the perfect thing."
- "Continue with Google" button using Supabase OAuth
- The button calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' } })`
- Nice background — soft gradient or clean white with subtle pattern
- Responsive, centered layout

### app/(auth)/auth/callback/route.ts
Handle OAuth callback, exchange code for session, redirect to dashboard.

---

## DASHBOARD LAYOUT (app/(dashboard)/layout.tsx)

Build a full sidebar layout with:

**Sidebar (desktop):**
- App logo + name "Wisher" at the top
- Navigation links with icons (lucide-react):
  - Dashboard (Home icon) → `/`
  - Contacts (Users icon) → `/contacts`
  - Generate Wish (Sparkles icon) → `/generate`
- User avatar + name at the bottom with logout button

**Header (mobile):**
- Hamburger menu that opens a slide-in drawer with same nav links
- App name in centre

**Main content area:**
- Scrollable, padded container
- Responsive: sidebar visible on lg+, hidden on mobile

---

## PAGES

### app/(dashboard)/page.tsx — Dashboard Home

Show:
1. **Welcome message** — "Good morning, [name] 👋" using time of day
2. **Stats row** (4 cards):
   - Total contacts
   - Events this month
   - Wishes generated (all time)
   - Upcoming in 7 days
3. **Upcoming Events section:**
   - List of events in the next 30 days
   - Each event shows: contact name, event type badge, days until event (e.g. "in 3 days")
   - "Generate Wish" button on each card — links to `/generate?contactId=...&eventId=...`
   - Sort by soonest first
   - If no upcoming events, show an empty state with a "Add Contact" button

**Logic for upcoming events:**
- Fetch all events from DB for this user
- Since events are recurring (birthdays), calculate the next occurrence of each event in the current year (or next year if already passed)
- Show those in the next 30 days sorted by date

### app/(dashboard)/contacts/page.tsx — Contacts List

Show:
1. Page title "Contacts" + "Add Contact" button (opens modal/sheet)
2. Search bar to filter contacts by name
3. Grid of ContactCards (2 cols on tablet, 3 on desktop, 1 on mobile)
4. Each card shows: name, relationship badge, number of events, last wish generated
5. Click a card → go to `/contacts/[id]`
6. Empty state if no contacts

**Add Contact flow:**
- shadcn/ui Sheet or Dialog
- Form fields: Name (required), Relationship (select), Phone (optional), Notes (optional)
- After saving, immediately open "Add Event" modal so user can add a birthday/anniversary

### app/(dashboard)/contacts/[id]/page.tsx — Contact Detail

Show:
1. Contact name, relationship badge, phone, notes
2. Edit and Delete buttons
3. "Events" section — list all events for this contact with edit/delete
4. "Add Event" button
5. "Wish History" section — all previously generated wishes for this contact (most recent first)
6. "Generate New Wish" button → links to `/generate?contactId=[id]`

### app/(dashboard)/generate/page.tsx — Wish Generator

This is the most important page. Build it carefully.

**Layout:**
- Left panel (or top on mobile): Contact & event selector
- Right panel (or bottom on mobile): Generated wish output

**Left panel — inputs:**
1. Contact selector — searchable dropdown of user's contacts
2. Event selector — shows events for selected contact
3. Tone selector — 6 tone buttons (use the TONES constants), visually styled as pill buttons, one selected at a time
4. Language selector — searchable dropdown using LANGUAGES constants
5. "Generate Wish ✨" button — large, prominent, full width

**Right panel — output:**
- Shows a card with the generated wish text in large, readable font
- Copy to clipboard button (icon + "Copied!" feedback)
- Share options: WhatsApp (opens `https://wa.me/?text=[encoded wish]`), SMS
- "Regenerate" button — calls API again with same inputs
- Loading skeleton when generating
- Empty state before first generation: "Select a contact and click Generate ✨"

**Behaviour:**
- If URL has `?contactId=...&eventId=...` query params, pre-select those values
- After generating, save to wish_history automatically
- Show a small note: "This wish has been saved to history so it won't be repeated"

---

## API ROUTES

### app/api/generate-wish/route.ts

```typescript
// POST /api/generate-wish
// Body: GenerateWishRequest
// Returns: GenerateWishResponse

// Steps:
// 1. Validate request body
// 2. Get authenticated user from Supabase (server client)
// 3. Fetch previousWishes from wish_history for this contact+event (last 10)
// 4. Build Claude prompt (see prompt below)
// 5. Call Claude API
// 6. Save new wish to wish_history table
// 7. Return wish text
```

**Claude prompt to use inside this route:**

```
You are a heartfelt wish writer. Generate a single, unique, personalised wish message.

Details:
- Recipient name: {contactName}
- Relationship to sender: {relationship}
- Occasion: {eventTitle} ({eventType})
- Tone: {tone}
- Language: {language}

Rules:
- Write ONLY the wish message, nothing else. No introductions, no explanations.
- The wish must be unique and NOT similar to any of these previous wishes sent to this person:
  {previousWishes list, one per line}
- Length: 2–4 sentences. Warm and personal.
- If language is not English, write entirely in that language.
- For Gen Z tone: use casual internet slang naturally but not excessively.
- For Poetic tone: use metaphors, rhythm, imagery.
- For Formal tone: professional language, suitable for workplace.
- Do NOT use placeholder text like [Name] — use the actual name provided.
- Do NOT start every wish the same way. Vary the opening.
```

### app/api/contacts/route.ts
- GET: fetch all contacts for authenticated user, include event count
- POST: create new contact

### app/api/contacts/[id]/route.ts
- GET: fetch single contact with all events and wish history
- PUT: update contact
- DELETE: delete contact (cascades to events and wish history)

### app/api/events/route.ts
- GET: fetch events (optionally filtered by contactId or upcoming=true)
- POST: create new event

### app/api/events/[id]/route.ts
- PUT: update event
- DELETE: delete event

---

## COMPONENTS TO BUILD

### WishGenerator.tsx
Main component for the generate page. Manages all state: selectedContact, selectedEvent, tone, language, generatedWish, isLoading. Calls `/api/generate-wish`.

### ToneSelector.tsx
6 pill buttons for tone selection. Selected tone has distinct active style. Displays emoji + label.

### ContactCard.tsx
Card showing contact summary. Name, relationship badge (coloured by type), event count, "Generate Wish" quick action.

### UpcomingEvents.tsx
Calculates and displays next 30 days of events. For recurring events, calculates next occurrence. Shows "Today", "Tomorrow", or "in N days" label.

### EventBadge.tsx
Small coloured badge showing event type. Birthday = purple, Anniversary = pink, Custom = blue.

---

## UI / DESIGN GUIDELINES

- **Colour palette:** Use a purple-to-violet gradient as the brand accent colour (`#7C3AED` to `#6D28D9`). Clean white backgrounds. Soft gray for secondary surfaces.
- **Typography:** Use Geist Sans (already available in Next.js 15) or Inter. Headings bold, body regular.
- **Cards:** Rounded corners (`rounded-2xl`), subtle shadow (`shadow-sm`), white background.
- **Buttons:** Primary = purple filled. Secondary = ghost/outline. Destructive = red outline.
- **Spacing:** Generous padding. Don't crowd elements.
- **Empty states:** Always include an empty state with an icon, short message, and a CTA button.
- **Loading states:** Use shadcn/ui Skeleton components for loading. Show skeleton on the wish output card while generating.
- **Toasts:** Use shadcn/ui Toaster for success/error messages (e.g. "Wish copied!", "Contact saved!").
- **Responsive:** Mobile-first. Everything must work well on a phone screen.
- **Accessibility:** All form inputs have labels. Buttons have aria-labels where icon-only.

---

## ERROR HANDLING

- All API routes must return proper HTTP status codes (200, 201, 400, 401, 500)
- All API routes must be wrapped in try/catch
- Frontend must handle API errors gracefully and show toast notifications
- If Claude API fails, show "Could not generate wish. Please try again." — do not crash
- If user is unauthenticated and hits a protected route, redirect to `/login`

---

## README.md

Create a complete README with:

```markdown
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
```

---

## FINAL CHECKLIST — before finishing

Make sure all of the following work end-to-end:

- [ ] Login with Google redirects to dashboard
- [ ] Unauthenticated users are redirected to /login
- [ ] User can add a contact
- [ ] User can add events to a contact (birthday, anniversary, custom)
- [ ] Dashboard shows upcoming events in next 30 days
- [ ] Generate page can select contact + event + tone + language
- [ ] Clicking "Generate Wish" calls Claude and shows the result
- [ ] Wish is saved to wish_history after generation
- [ ] Copy to clipboard works
- [ ] WhatsApp share link works
- [ ] Contacts page shows all contacts with search
- [ ] Contact detail shows events and wish history
- [ ] All forms show validation errors on empty required fields
- [ ] .env.local is in .gitignore
- [ ] README is complete with setup instructions

---

Start from the setup tasks at the top and work downward. Ask me if you need to clarify anything before proceeding.
