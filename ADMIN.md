# Bazaar — Admin & Operations Manual

A practical reference for managing and operating the Bazaar classified ads marketplace.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Frontend](#frontend)
3. [Backend (Supabase)](#backend-supabase)
4. [WhatsApp Bot (n8n + WAHA)](#whatsapp-bot-n8n--waha)
5. [Deployment](#deployment)
6. [Managing Listings](#managing-listings)
7. [Categories](#categories)
8. [Images](#images)
9. [Theme Customization](#theme-customization)
10. [SEO Updates](#seo-updates)
11. [Safety Notices](#safety-notices)
12. [Moderation](#moderation)

---

## Tech Stack Overview

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 8 |
| Routing | React Router v6 |
| Data fetching | SWR |
| Styling | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL) |
| File storage | Supabase Storage |
| Search Edge Function | Supabase Edge Function (Deno) |
| Local business fallback | Google Places API (New) |
| WhatsApp bot engine | n8n (workflow automation) |
| WhatsApp connection | WAHA (self-hosted WhatsApp HTTP API) |

---

## Frontend

### Running locally
```bash
npm install
npm run dev          # http://localhost:5173
```

### Building for production
```bash
npm run build        # outputs to dist/
```

### Key source files

| File | Purpose |
|---|---|
| `src/App.tsx` | Route tree (all page routes defined here) |
| `src/types/index.ts` | Shared TypeScript types (Profile, Listing, Inquiry, etc.) |
| `src/api/listings.ts` | All listing API calls to Supabase |
| `src/api/profiles.ts` | Profile API calls |
| `src/api/inquiries.ts` | Inquiry (contact form) API calls |
| `src/pages/` | One folder per feature area (listings, sellers, buyers) |
| `src/components/` | Shared UI components |

### Environment variables
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=https://eucjgaotitktharsllws.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Backend (Supabase)

### Database tables

| Table | Purpose |
|---|---|
| `profiles` | User accounts (role: seller / buyer) |
| `listings` | Classified ads (title, body, price, category, status) |
| `inquiries` | Contact messages sent to listing owners |

### Edge Function — `search-listings`

Located at `supabase/functions/search-listings/index.ts`.

**What it does:**
1. Strips stop words from the query ("find", "in", "near", "best", etc.)
2. Searches the local DB using AND keyword matching (each word must match title OR body)
3. If fewer than 3 DB results AND `GOOGLE_PLACES_API_KEY` is set → fills remaining slots from Google Places

**Deploy the function:**
```bash
npx supabase functions deploy search-listings
```

**Required secret (set in Supabase dashboard):**
- `GOOGLE_PLACES_API_KEY` — get from [Google Cloud Console](https://console.cloud.google.com)
  - Enable: **Places API (New)**
  - Restrict key to the Places API for security

Dashboard path: `Edge Functions → search-listings → Secrets → Add`

---

## WhatsApp Bot (n8n + WAHA)

The bot lives in the `n8n/` folder.

### Architecture

```
WhatsApp group message
  → WAHA container (port 3000) receives it
  → WAHA POSTs to n8n webhook (http://n8n:5678/webhook/waha-listener)
  → n8n workflow runs:
      1. Filter: check group whitelist + detect keyword
      2. Search: call Supabase Edge Function
      3. Format: build reply message
      4. Send: POST to WAHA /api/sendText
  → WAHA sends reply back into the WhatsApp group
```

### First-time setup

**Prerequisites:** Docker Desktop installed and running.

**1. Start containers**
```bash
cd n8n
docker compose up -d
```

**2. Connect WhatsApp (scan QR)**
- Open http://localhost:3000 (WAHA dashboard)
- Click **Start session** → session name: `default`
- Scan the QR code with your WhatsApp phone
- Session is saved in a Docker volume — survives container restarts

**3. Import the workflow into n8n**
- Open http://localhost:5678 (login: `admin` / `changeme`)
- Menu (top-right) → **Import from file** → select `n8n/workflow.json`
- Click **Activate** toggle to enable the workflow

**4. Set your group ID**
- Send a message in your target WhatsApp group
- In n8n: go to **Executions** → click the latest run → open **Filter & Detect Intent** node → check `payload.from` — this is your group ID (format: `123456789@g.us`)
- Edit the workflow → open **Filter & Detect Intent** node → update `ALLOWED_GROUPS`:
  ```js
  const ALLOWED_GROUPS = ['your-group-id@g.us'];
  ```
- Save and keep activated

**5. Update URLs before going live**
In the **Format Reply** node, update `APP_BASE_URL` to your deployed domain:
```js
const APP_BASE_URL = 'https://your-domain.com';
```

### Intent patterns (what triggers the bot)

The bot responds when a message matches any of these patterns:

| Pattern | Example |
|---|---|
| `looking for X` | "looking for a Honda Civic" |
| `find X` | "find maternity hospital near tolichowki" |
| `need X` | "need a plumber urgently" |
| `want X` | "want second-hand laptop" |
| `anyone know X` | "anyone know good dentist in banjara hills" |
| `any good X` | "any good restaurants nearby" |
| `best X near` | "best gym near me" |
| `X chahiye` | "AC repair chahiye" |
| `mujhe X chahiye` | "mujhe mechanic chahiye" |
| and more… | see the code node for the full list |

### Reply format

**DB result:**
```
🔍 Found 2 results for "Honda Civic":

1. *Honda Civic 2019* — ₹12,50,000
   📍 Hyderabad  📞 +91 98765 43210
   🔗 https://your-domain.com/listings/abc123

2. *Civic VX 2021* — Contact for price
   📍 Banjara Hills
   🔗 https://your-domain.com/listings/def456
```

**Google Places result:**
```
1. *Fernandez Hospital* — Contact for price
   📍 Bogulkunta, Hyderabad
   🗺️ https://maps.google.com/...
```

### Stopping / restarting the bot
```bash
cd n8n
docker compose down          # stop
docker compose up -d         # start again (sessions and workflows persist)
docker compose logs -f n8n   # view n8n logs
docker compose logs -f waha  # view WAHA logs
```

### Changing the n8n password
Edit `n8n/docker-compose.yml` → update `N8N_BASIC_AUTH_PASSWORD`.
Restart: `docker compose up -d`.

### Production deployment
On a VPS (Ubuntu/Debian), change in `docker-compose.yml`:
```yaml
WEBHOOK_URL: https://your-domain.com:5678
```
And set `WAHA`'s `WHATSAPP_HOOK_URL` to the public n8n URL:
```yaml
WHATSAPP_HOOK_URL: https://your-domain.com:5678/webhook/waha-listener
```
Or put both behind Nginx/Caddy and use path-based routing.

---

## Deployment

### Frontend (Vercel — recommended)
```bash
vercel deploy
```
Or connect the GitHub repo to Vercel for automatic deploys on push.

### Edge Function
```bash
npx supabase functions deploy search-listings
```

### Environment variables to set in Vercel
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Managing Listings

Listings are stored in the `listings` table in Supabase.

**Fields:**
- `title` — the ad headline
- `body` — description
- `price` — numeric price (0 = "contact for price")
- `category` — one of: Electronics, Vehicles, Furniture, Fashion, Home & Garden, Sports, Books & Media, Toys & Games, Services, Other
- `condition` — New / Like New / Good / Fair / For Parts
- `status` — `active` or `sold`
- `images` — array of Supabase Storage paths
- `user_id` — the seller's profile ID

**To manage listings:** Use the Supabase dashboard at https://supabase.com/dashboard → Table Editor → `listings`.

---

## Categories

Categories are defined as a constant in `src/api/listings.ts`. The current list:

```
Electronics, Vehicles, Furniture, Fashion, Home & Garden,
Sports, Books & Media, Toys & Games, Services, Other
```

To add/remove/rename categories, edit the `CATEGORIES` array in that file and update any matching filter UI in `src/pages/listings/ListingsPage.tsx`.

---

## Images

Product images are stored in **Supabase Storage** (bucket: `listing-images`).

User avatars are generated from **DiceBear** (deterministic, based on user ID). To use real uploaded avatars, store them in Supabase Storage and update `getAvatarUrl()` in `src/lib/format.ts`.

---

## Theme Customization

The design system uses CSS custom properties defined in `src/styles/globals.css`.

### Changing colors
Edit the `:root` block:
```css
:root {
  --color-primary: #C84B2F;   /* main brand color */
  --color-accent:  #D4931A;   /* secondary accent */
}
```

### Dark mode
Users toggle dark mode via the moon/sun button in the navbar. The preference is saved to `localStorage`.

---

## SEO Updates

Edit `index.html`:
- `<title>` — site title
- `<meta name="description">` — 150–160 character description
- `<meta property="og:title">`, `og:description` — social preview text
- `og:image` — update to a 1200×630px image URL

Update the canonical base URL from `https://bazaar.example.com` to your real domain.

For per-listing dynamic titles and meta tags, add `react-helmet-async`.

---

## Safety Notices

Safety tips appear on every listing detail page. To edit them, find the safety tips section in `src/pages/listings/ListingDetailPage.tsx`:

```jsx
<ul>
  <li>Meet in a public place</li>
  <li>Never pay in advance</li>
  ...
</ul>
```

---

## Moderation

To moderate content, use the [Supabase dashboard](https://supabase.com/dashboard):

1. **Delete a listing:** Table Editor → `listings` → delete the row
2. **Delete an inquiry:** Table Editor → `inquiries` → delete the row
3. **Suspend a user:** Table Editor → `profiles` → update a field or use Row Level Security policies

For a full moderation panel, build an `/admin` route protected by Supabase Auth (role-based access).

---

*Last updated: 2026. For technical changes, consult a developer.*
