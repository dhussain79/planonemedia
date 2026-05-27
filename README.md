# PlanOneMedia

A media asset trading and discovery portal for the MENA market. Browse, compare, and book OOH, DOOH, TV, and digital media inventory across GCC countries.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** PostgreSQL 16 + PostGIS (Neon)
- **ORM:** Prisma 6
- **Search:** Meilisearch
- **Maps:** Mapbox GL JS
- **Auth:** NextAuth.js v5 (Auth.js)
- **Payments:** Bank invoicing + VAT (media); local KSA gateway (subscriptions)
- **Hosting:** Vercel (Pro)
- **Email:** Resend + React Email
- **Analytics:** PostHog + Sentry

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (public)/     # Public pages (assets, auth)
    (dashboard)/  # Authenticated pages (seller, buyer, admin)
  components/
    ui/           # shadcn/ui components
    layout/       # Layout components
    assets/       # Asset-specific components
    booking/      # Booking components
  lib/
    prisma/       # Database
    pricing/      # Pricing engine
    search/       # Meilisearch
    payments/     # Payment processing
    storage/      # Cloudflare R2
  services/       # Business logic
  hooks/          # React hooks
  types/          # TypeScript types
```

## License

Private — All rights reserved.
