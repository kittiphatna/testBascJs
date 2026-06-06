import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import type { Tenant } from '@/lib/database.types'

export default async function AdminTenantsPage() {
  let tenants: Tenant[] = []

  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
    tenants = (data as Tenant[]) ?? []
  } catch { /* not configured */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ผู้เช่า</h1>
        <Link href="/admin/tenants/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
          + เพิ่มผู้เช่า
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['ชื่อ', 'เบอร์โทร', 'Line ID', 'อีเมล', 'อาชีพ', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tenants.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">ยังไม่มีผู้เช่า</td></tr>
            ) : tenants.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{t.full_name}</div>
                  <div className="text-xs text-gray-400">{t.nationality}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.line_id ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{t.occupation ?? '—'}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/tenants/${t.id}/edit`}
                    className="px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100">
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
