import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

type ContractRow = {
  id: string
  start_date: string
  end_date: string
  monthly_rent: number
  status: string
  rooms: { room_number: string | null; floor: number | null; condos: { name: string } | null } | null
  tenants: { full_name: string; phone: string | null } | null
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  active: { label: 'มีผลบังคับ', cls: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'หมดแล้ว', cls: 'bg-gray-100 text-gray-500' },
  terminated: { label: 'ยกเลิก', cls: 'bg-red-100 text-red-600' },
  renewed: { label: 'ต่อสัญญา', cls: 'bg-blue-100 text-blue-700' },
}

function daysLeft(endDate: string) {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  return diff
}

export default async function AdminContractsPage() {
  let contracts: ContractRow[] = []

  try {
    const supabase = await createServerSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('contracts')
      .select('id, start_date, end_date, monthly_rent, status, rooms(room_number, floor, condos(name)), tenants(full_name, phone)')
      .order('end_date', { ascending: true })
      .limit(200)
    contracts = data ?? []
  } catch { /* not configured */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">สัญญาเช่า</h1>
        <Link href="/admin/contracts/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
          + เพิ่มสัญญา
        </Link>
      </div>

      {/* แจ้งเตือนสัญญาใกล้หมด */}
      {(() => {
        const soon = contracts.filter((c) => c.status === 'active' && daysLeft(c.end_date) <= 30 && daysLeft(c.end_date) >= 0)
        if (soon.length === 0) return null
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800">
            ⚠️ มี <strong>{soon.length}</strong> สัญญาที่จะหมดภายใน 30 วัน
          </div>
        )
      })()}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['ห้อง / คอนโด', 'ผู้เช่า', 'ระยะเวลา', 'ค่าเช่า/เดือน', 'วันหมด', 'สถานะ', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">ยังไม่มีสัญญา</td></tr>
            ) : contracts.map((c) => {
              const s = STATUS_LABEL[c.status] ?? { label: c.status, cls: 'bg-gray-100 text-gray-500' }
              const days = daysLeft(c.end_date)
              const urgentCls = c.status === 'active' && days <= 7 ? 'bg-red-50' :
                c.status === 'active' && days <= 30 ? 'bg-amber-50' : ''
              return (
                <tr key={c.id} className={`hover:bg-gray-50 ${urgentCls}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.rooms?.condos?.name ?? '—'}</div>
                    <div className="text-xs text-gray-400">
                      {c.rooms?.room_number ? `ห้อง ${c.rooms.room_number}` : '—'}
                      {c.rooms?.floor ? ` ชั้น ${c.rooms.floor}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{c.tenants?.full_name ?? '—'}</div>
                    <div className="text-xs text-gray-400">{c.tenants?.phone ?? ''}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {c.start_date} →<br />{c.end_date}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ฿{c.monthly_rent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{c.end_date}</div>
                    {c.status === 'active' && (
                      <div className={`text-xs font-medium mt-0.5 ${days <= 7 ? 'text-red-600' : days <= 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {days >= 0 ? `อีก ${days} วัน` : `เกิน ${Math.abs(days)} วัน`}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.cls}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/contracts/${c.id}/edit`}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100">
                      แก้ไข
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
