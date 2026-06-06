import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Room, Condo } from '@/lib/database.types'
import Link from 'next/link'
import RoomActions from '@/components/admin/RoomActions'

type RoomWithCondo = Room & { condos: Pick<Condo, 'name' | 'district'> }

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  available: { label: 'ว่าง', cls: 'bg-emerald-100 text-emerald-700' },
  rented: { label: 'มีผู้เช่า', cls: 'bg-blue-100 text-blue-700' },
  reserved: { label: 'จอง', cls: 'bg-yellow-100 text-yellow-700' },
  maintenance: { label: 'ซ่อมบำรุง', cls: 'bg-orange-100 text-orange-700' },
  unlisted: { label: 'ซ่อน', cls: 'bg-gray-100 text-gray-500' },
}

export default async function AdminRoomsPage() {
  let rooms: RoomWithCondo[] = []

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('rooms')
      .select('*, condos(name, district)')
      .order('listed_at', { ascending: false })
      .limit(100)
    rooms = (data as RoomWithCondo[]) ?? []
  } catch {
    // not configured yet
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการห้อง</h1>
        <Link
          href="/admin/rooms/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + เพิ่มห้องใหม่
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['รหัส', 'คอนโด / ห้อง', 'ประเภท', 'ขนาด', 'ราคา/เดือน', 'สถานะ', 'การจัดการ'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  ยังไม่มีข้อมูลห้อง — กด <strong>+ เพิ่มห้องใหม่</strong>
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const status = STATUS_LABEL[room.status] ?? { label: room.status, cls: 'bg-gray-100 text-gray-500' }
                return (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                        #{room.room_code ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{room.condos?.name ?? '—'}</div>
                      <div className="text-gray-400 text-xs">
                        {room.room_number ? `ห้อง ${room.room_number}` : '—'}
                        {room.floor ? ` ชั้น ${room.floor}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 capitalize">{room.room_type ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{room.size_sqm ? `${room.size_sqm} ตร.ม.` : '—'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {room.price_thb ? `฿${room.price_thb.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RoomActions roomId={room.id} verified={room.agent_verified} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
