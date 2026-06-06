import { createServerSupabaseClient } from '@/lib/supabase-server'
import ContractForm from '@/components/admin/ContractForm'

export default async function NewContractPage() {
  let rooms: { id: string; label: string }[] = []
  let tenants: { id: string; label: string }[] = []

  try {
    const supabase = await createServerSupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const [{ data: roomData }, { data: tenantData }] = await Promise.all([
      db.from('rooms').select('id, room_number, floor, condos(name)').eq('status', 'available').order('listed_at'),
      db.from('tenants').select('id, full_name').order('full_name'),
    ])

    rooms = (roomData ?? []).map((r: any) => ({
      id: r.id,
      label: `${r.condos?.name ?? '?'} — ห้อง ${r.room_number ?? '?'} ชั้น ${r.floor ?? '?'}`,
    }))
    tenants = (tenantData ?? []).map((t: any) => ({ id: t.id, label: t.full_name }))
  } catch { /* not configured */ }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">เพิ่มสัญญาเช่าใหม่</h1>
      <ContractForm rooms={rooms} tenants={tenants} />
    </div>
  )
}
