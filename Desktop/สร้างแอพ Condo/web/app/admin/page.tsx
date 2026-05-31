import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function AdminDashboard() {
  let stats = { total: 0, available: 0, rented: 0, expiringIn30: 0 }

  try {
    const supabase = await createServerSupabaseClient()
    const [rooms, expiring] = await Promise.all([
      supabase.from('rooms').select('status'),
      supabase
        .from('contracts')
        .select('id')
        .eq('status', 'active')
        .lte('end_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]),
    ])

    const roomRows = (rooms.data ?? []) as { status: string }[]
    stats = {
      total: roomRows.length,
      available: roomRows.filter((r) => r.status === 'available').length,
      rented: roomRows.filter((r) => r.status === 'rented').length,
      expiringIn30: expiring.data?.length ?? 0,
    }
  } catch {
    // Supabase not configured yet
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashCard label="ห้องทั้งหมด" value={stats.total} icon="🚪" color="gray" />
        <DashCard label="ห้องว่าง" value={stats.available} icon="✅" color="emerald" />
        <DashCard label="มีผู้เช่า" value={stats.rented} icon="🔑" color="blue" />
        <DashCard label="สัญญาหมดใน 30 วัน" value={stats.expiringIn30} icon="⚠️" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  )
}

function DashCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: string
  color: 'gray' | 'emerald' | 'blue' | 'amber'
}) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
      <div className={`${colors[color]} w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3`}>
        {icon}
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        {[
          { href: '/admin/rooms/new', label: '+ เพิ่มห้องใหม่', color: 'bg-emerald-600 text-white hover:bg-emerald-700' },
          { href: '/admin/condos/new', label: '+ เพิ่มคอนโดใหม่', color: 'bg-blue-600 text-white hover:bg-blue-700' },
          { href: '/admin/review', label: '✅ Review Queue', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
          { href: '/admin/contracts', label: '📄 ดูสัญญาที่จะหมด', color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
        ].map((a) => (
          <a
            key={a.href}
            href={a.href}
            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${a.color}`}
          >
            {a.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4">กิจกรรมล่าสุด</h2>
      <p className="text-sm text-gray-400 text-center py-8">ยังไม่มีกิจกรรม — เชื่อม Supabase เพื่อดูข้อมูล</p>
    </div>
  )
}
