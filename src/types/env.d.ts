/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LITEAPI_ENV: string
  readonly VITE_LITEAPI_PROD_KEY: string
  readonly VITE_LITEAPI_SANDBOX_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
