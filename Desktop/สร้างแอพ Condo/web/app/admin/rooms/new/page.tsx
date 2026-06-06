import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Condo } from '@/lib/database.types'
import RoomForm from '@/components/admin/RoomForm'

export default async function NewRoomPage() {
  let condos: Pick<Condo, 'id' | 'name' | 'district' | 'nearby_places'>[] = []

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase.from('condos').select('id, name, district, nearby_places').order('name')
    condos = data ?? []
  } catch {
    // not configured yet
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">เพิ่มห้องใหม่</h1>
      <RoomForm condos={condos} />
    </div>
  )
}
