import { createServerSupabaseClient } from '@/lib/supabase-server'
import ContractForm from '@/components/admin/ContractForm'
import { notFound } from 'next/navigation'

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [{ data: contract }, { data: roomData }, { data: tenantData }] = await Promise.all([
    db.from('contracts').select('*').eq('id', id).single(),
    db.from('rooms').select('id, room_number, floor, condos(name)').order('listed_at'),
    db.from('tenants').select('id, full_name').order('full_name'),
  ])

  if (!contract) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rooms = (roomData ?? []).map((r: any) => ({
    id: r.id,
    label: `${r.condos?.name ?? '?'} — ห้อง ${r.room_number ?? '?'} ชั้น ${r.floor ?? '?'}`,
  }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenants = (tenantData ?? []).map((t: any) => ({ id: t.id, label: t.full_name }))

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไขสัญญา</h1>
      <ContractForm
        contractId={contract.id}
        rooms={rooms}
        tenants={tenants}
        defaultValues={{
          room_id: contract.room_id,
          tenant_id: contract.tenant_id,
          start_date: contract.start_date,
          end_date: contract.end_date,
          monthly_rent: contract.monthly_rent?.toString() ?? '',
          deposit_amount: contract.deposit_amount?.toString() ?? '',
          status: contract.status,
          termination_note: contract.termination_note ?? '',
        }}
      />
    </div>
  )
}
