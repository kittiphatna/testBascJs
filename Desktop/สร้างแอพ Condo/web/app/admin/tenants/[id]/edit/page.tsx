import { createServerSupabaseClient } from '@/lib/supabase-server'
import TenantForm from '@/components/admin/TenantForm'
import { notFound } from 'next/navigation'

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('tenants').select('*').eq('id', id).single()
  if (!data) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = data as any
  const ec = t.emergency_contact ?? {}

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไขผู้เช่า — {t.full_name}</h1>
      <TenantForm tenantId={t.id} defaultValues={{
        full_name: t.full_name,
        phone: t.phone ?? '',
        email: t.email ?? '',
        line_id: t.line_id ?? '',
        id_card_number: t.id_card_number ?? '',
        nationality: t.nationality ?? 'ไทย',
        occupation: t.occupation ?? '',
        emergency_name: ec.name ?? '',
        emergency_phone: ec.phone ?? '',
        emergency_relation: ec.relation ?? '',
        notes: t.notes ?? '',
      }} />
    </div>
  )
}
