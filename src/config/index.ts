export const config = {
  app: {
    name: "PlanOneMedia",
    description: "Media asset trading and discovery portal for the MENA market",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  meilisearch: {
    host: process.env.MEILISEARCH_HOST,
    apiKey: process.env.MEILISEARCH_API_KEY,
  },
  mapbox: {
    token: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  },
  storage: {
    r2: {
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
    },
  },
  email: {
    from: "PlanOneMedia <noreply@planonemedia.com>",
    resendApiKey: process.env.RESEND_API_KEY,
  },
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  },
  realtime: {
    soketiAppKey: process.env.SOKETI_APP_KEY,
    soketiAppSecret: process.env.SOKETI_APP_SECRET,
    soketiHost: process.env.SOKETI_HOST,
  },
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
} as const;
