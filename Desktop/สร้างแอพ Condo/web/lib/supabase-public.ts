import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client สำหรับ public pages — ไม่ใช้ cookies ทำให้ Next.js cache ได้
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
