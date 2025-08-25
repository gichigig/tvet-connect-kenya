// Storage Configuration
export const storageConfig = {
  provider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER as 'b2' | 'cloudflare',
  b2Config: {
    applicationKeyId: process.env.B2_APPLICATION_KEY_ID!,
    applicationKey: process.env.B2_APPLICATION_KEY!,
    bucketId: process.env.B2_BUCKET_ID!,
    bucketName: process.env.B2_BUCKET_NAME!
  },
  cloudflareConfig: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    bucketName: process.env.CLOUDFLARE_BUCKET_NAME!
  }
}

// Supabase Configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}

// Initialize services
import { UnifiedStorage } from './storage'
import { AuthService } from './auth/supabase'
import { DataService } from './data/supabase'

export const storage = new UnifiedStorage(storageConfig)
export const auth = new AuthService(supabaseConfig)
export const db = new DataService(supabaseConfig)

// Export types
export type { Tables } from '@/lib/supabase-schema'
export { storageConfig, supabaseConfig }
