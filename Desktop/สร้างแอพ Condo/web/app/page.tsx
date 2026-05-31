import Navbar from '@/components/Navbar'
import CondoMapWrapper from '@/components/CondoMapWrapper'
import { createPublicClient } from '@/lib/supabase-public'
import type { AvailableRoomMap } from '@/lib/database.types'

export const revalidate = 60

export default async function HomePage() {
  let rooms: AvailableRoomMap[] = []

  try {
    const supabase = createPublicClient()
    const { data } = await supabase.from('available_rooms_map').select('*')
    rooms = (data as AvailableRoomMap[]) ?? []
  } catch {
    // Supabase not configured yet — show empty map
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar stats */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 hidden md:flex">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">สรุป</h2>
            <div className="grid grid-cols-1 gap-3">
              <StatCard label="ห้องว่างทั้งหมด" value={rooms.length} color="emerald" />
              <StatCard
                label="คอนโดทั้งหมด"
                value={new Set(rooms.map((r) => r.condo_id)).size}
                color="blue"
              />
              <StatCard
                label="ราคาเฉลี่ย"
                value={
                  rooms.length
                    ? `฿${Math.round(
                        rooms.reduce((s, r) => s + (r.price_thb ?? 0), 0) / rooms.length
                      ).toLocaleString()}`
                    : '—'
                }
                color="purple"
              />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ประเภทห้อง</h2>
            <RoomTypeBreakdown rooms={rooms} />
          </div>
          <a
            href="/rooms"
            className="mt-auto block text-center bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
          >
            ค้นหาห้องทั้งหมด →
          </a>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <CondoMapWrapper rooms={rooms} />
        </main>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: 'emerald' | 'blue' | 'purple'
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
  }
  return (
    <div className={`${colors[color]} rounded-xl p-3`}>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  )
}

function RoomTypeBreakdown({ rooms }: { rooms: AvailableRoomMap[] }) {
  const counts = rooms.reduce<Record<string, number>>((acc, r) => {
    const t = r.room_type ?? 'other'
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})

  const labels: Record<string, string> = {
    studio: 'Studio',
    '1bed': '1 ห้องนอน',
    '2bed': '2 ห้องนอน',
    '3bed': '3 ห้องนอน',
    penthouse: 'Penthouse',
  }

  if (Object.keys(counts).length === 0) {
    return <p className="text-xs text-gray-400">ยังไม่มีข้อมูล</p>
  }

  return (
    <div className="space-y-2">
      {Object.entries(counts).map(([type, count]) => (
        <div key={type} className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{labels[type] ?? type}</span>
          <span className="font-semibold text-gray-900">{count}</span>
        </div>
      ))}
    </div>
  )
}
