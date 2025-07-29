/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_ENVIRONMENT?: string
  readonly VITE_DEBUG?: string
  readonly FRONTEND_DEV_PORT?: string
  readonly NODE_ENV?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly SSR?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
