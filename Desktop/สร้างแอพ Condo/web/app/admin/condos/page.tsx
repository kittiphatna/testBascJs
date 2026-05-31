import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Condo } from '@/lib/database.types'
import Link from 'next/link'
import CondoActions from '@/components/admin/CondoActions'

export default async function AdminCondosPage() {
  let condos: Condo[] = []

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('condos')
      .select('*')
      .order('created_at', { ascending: false })
    condos = (data as Condo[]) ?? []
  } catch {
    // not configured yet
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">จัดการคอนโด</h1>
        <Link
          href="/admin/condos/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + เพิ่มคอนโดใหม่
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['ชื่อคอนโด', 'ที่อยู่', 'จังหวัด', 'สิ่งอำนวยความสะดวก', 'ตรวจสอบ', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {condos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  ยังไม่มีข้อมูลคอนโด — กด <strong>+ เพิ่มคอนโดใหม่</strong>
                </td>
              </tr>
            ) : (
              condos.map((condo) => (
                <tr key={condo.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{condo.name}</div>
                    <div className="text-gray-400 text-xs">{condo.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{condo.district ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{condo.province}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {condo.facilities?.slice(0, 3).map((f) => (
                        <span key={f} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {condo.facilities?.length > 3 && (
                        <span className="text-gray-400 text-xs">+{condo.facilities.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {condo.agent_verified ? (
                      <span className="text-emerald-600 text-xs font-medium">✅ ผ่านแล้ว</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-medium">⏳ รอตรวจ</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CondoActions condoId={condo.id} condoName={condo.name} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
