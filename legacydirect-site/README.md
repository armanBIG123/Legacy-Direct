# LegacyDirect

Next.js (App Router) rebuild of the LegacyDirect marketing site.

## Project structure

```
app/
  layout.js       Root layout — wraps every page in Header + Footer, loads fonts
  page.js          Homepage — assembles the section components below
  globals.css      All site styling (design tokens, layout, responsive rules)
components/
  Header.js        Sticky gold nav bar (scroll shadow + mobile menu, client component)
  Hero.js          Hero section with the policy preview card
  Steps.js         "A more direct solution" three-step section
  Segments.js      Legacy / Protection / Retirement cards
  Values.js         "Old values, new paperwork" section
  Timeline.js      150-years chart
  CtaBand.js       Gold closing call-to-action band
  Footer.js        Site footer
  Reveal.js        Scroll-in fade/slide wrapper used across sections (client component)
```

Header and Footer live in the root layout, so any new page you add under `app/`
(e.g. `app/about/page.js`, `app/faq/page.js`) automatically gets the same nav
and footer — the footer already links out to About, For agents, FAQs, Insurance
guide, and Coverage options pages that don't exist yet, which is a natural
place to start once you're ready to build those out.

## Run it locally

You'll need [Node.js](https://nodejs.org) 20.9 or newer installed (required by Next.js 16).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy it — Cloudflare Workers (matches the PaceLedger stack)

This project targets **Cloudflare Workers** via `vinext`, Cloudflare's recommended way to run Next.js apps on their platform as of 2026 — same hosting family as PaceLedger, so the domain, DNS, and hosting all live in one Cloudflare account.

1. **Check compatibility, then add vinext:**
   ```bash
   npx vinext check
   npx vinext init
   ```
   Choose **Cloudflare Workers** as the deployment target when prompted. This installs vinext/Vite, adds `dev:vinext` / `build:vinext` scripts, and generates the Wrangler configuration — non-destructive, so `npm run dev` still works as before.

2. **Test the Workers build locally:**
   ```bash
   npm run dev:vinext
   npm run build:vinext
   ```

3. **First deploy (creates the Worker):**
   ```bash
   npx @vinext/cloudflare deploy
   ```
   This gives you a live `*.workers.dev` URL.

4. **Connect GitHub for auto-deploy on push** (mirrors the PaceLedger workflow):
   In the Cloudflare dashboard → **Workers & Pages** → select the Worker → **Settings → Builds → Connect**, and link the `legacydirect` GitHub repo. From then on, every push to `main` rebuilds and redeploys automatically — no manual `deploy` command needed.

5. **Attach the domain:**
   Worker → **Settings → Domains & Routes → Add Custom Domain** → enter `legacydirect.com`. Since the domain is already on Cloudflare in the same account, this is usually a one-click step — no manual DNS records to add.

## Adding Supabase later

Once we build the interactive features (sign-in, saved application status, lead forms), Supabase slots in the same way it did for PaceLedger:

- Create a project at supabase.com (Postgres + Auth + Row Level Security).
- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as Worker secrets (`wrangler secret put SUPABASE_URL`, or via the Cloudflare dashboard under the Worker's **Settings → Variables**) rather than committing them to the repo.
- Install `@supabase/supabase-js` and call it from client components or Server Actions as needed.

No setup needed yet — this is here for when we get to it.

## Notes

- All copy, colors (purple/gold), and plan names (Gold IUL / Freedom IUL) match
  the latest version of the design we worked through.
- Nav links (`Sign in`, footer links, plan links) currently point to `#` and
  need real destinations once those pages/flows exist.
- Let me know what features you'd like added next — application forms, an
  agent-matching flow, real page routes for the footer links, a CMS for the
  copy, etc. — and we can build them into this structure.
