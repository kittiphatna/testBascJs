import { createServerSupabaseClient } from '@/lib/supabase-server'
import CondoForm from '@/components/admin/CondoForm'
import { notFound } from 'next/navigation'

export default async function EditCondoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase.from('condos').select('*').eq('id', id).single()

  if (!data) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const condo = data as any

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไขคอนโด — {condo.name}</h1>
      <CondoForm
        condoId={condo.id}
        defaultValues={{
          name: condo.name,
          slug: condo.slug,
          address: condo.address ?? '',
          district: condo.district ?? '',
          province: condo.province,
          lat: condo.lat?.toString() ?? '',
          lng: condo.lng?.toString() ?? '',
          developer: condo.developer ?? '',
          build_year: condo.build_year?.toString() ?? '',
          total_floors: condo.total_floors?.toString() ?? '',
          total_units: condo.total_units?.toString() ?? '',
          facilities: condo.facilities ?? [],
          nearby_places: condo.nearby_places ?? [],
          cover_image_url: condo.cover_image_url ?? '',
          source_url: condo.source_url ?? '',
          source_platform: condo.source_platform ?? 'manual',
          agent_verified: condo.agent_verified ?? false,
        }}
      />
    </div>
  )
}
