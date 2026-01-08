/// <reference types="astro/client" />

type Role = 'admin' | 'user'

interface EnvBindings {
  DB: D1Database
  R2: R2Bucket
  APP_URL: string
  SESSION_COOKIE_NAME: string
  SESSION_SECRET: string
  ADMIN_EMAIL: string
  ADMIN_PASSWORD: string
  ADMIN_USERNAME?: string
  BOOTSTRAP_SECRET: string
  RESEND_API_KEY: string
  EMAIL_FROM: string
  R2_PUBLIC_BASE_URL?: string
  CLOUDFLARE_ANALYTICS_TOKEN?: string
  ALGOLIA_APP_ID?: string
  ALGOLIA_SEARCH_KEY?: string
  ALGOLIA_INDEX?: string
}

interface ImportMetaEnv {
  readonly PUBLIC_ALGOLIA_APP_ID?: string
  readonly PUBLIC_ALGOLIA_SEARCH_KEY?: string
  readonly PUBLIC_ALGOLIA_INDEX?: string
}

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string
        email: string
        role: Role
        display_name?: string | null
        avatar_url?: string | null
      }
      runtime: {
        env: EnvBindings
      }
    }
  }
}

export {}
