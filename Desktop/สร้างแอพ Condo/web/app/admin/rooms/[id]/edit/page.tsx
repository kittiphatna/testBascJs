import { createServerSupabaseClient } from '@/lib/supabase-server'
import RoomForm from '@/components/admin/RoomForm'
import { notFound } from 'next/navigation'
import type { Condo } from '@/lib/database.types'

export default async function EditRoomPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()

  const [{ data: roomData }, { data: condosData }] = await Promise.all([
    supabase.from('rooms').select('*').eq('id', params.id).single(),
    supabase.from('condos').select('id, name, district, nearby_places').order('name'),
  ])

  if (!roomData) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const room = roomData as any
  const condos = (condosData ?? []) as Pick<Condo, 'id' | 'name' | 'district' | 'nearby_places'>[]

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        แก้ไขห้อง — {room.room_number ? `ห้อง ${room.room_number}` : room.id.slice(0, 8)}
      </h1>
      <RoomForm
        roomId={room.id}
        condos={condos}
        defaultValues={{
          condo_id: room.condo_id,
          room_number: room.room_number ?? '',
          floor: room.floor?.toString() ?? '',
          size_sqm: room.size_sqm?.toString() ?? '',
          room_type: room.room_type ?? 'studio',
          bedrooms: room.bedrooms?.toString() ?? '0',
          bathrooms: room.bathrooms?.toString() ?? '1',
          furnishing: room.furnishing ?? 'fully',
          view_direction: room.view_direction ?? '',
          price_thb: room.price_thb?.toString() ?? '',
          status: room.status ?? 'available',
          available_from: room.available_from ?? '',
          description: room.description ?? '',
          tags: (room.tags ?? []).join(', '),
          agent_verified: room.agent_verified ?? false,
          room_code: room.room_code ?? '',
          owner_name: room.owner_name ?? '',
          owner_phone: room.owner_phone ?? '',
          owner_facebook: room.owner_facebook ?? '',
          owner_line_id: room.owner_line_id ?? '',
        }}
      />
    </div>
  )
}
