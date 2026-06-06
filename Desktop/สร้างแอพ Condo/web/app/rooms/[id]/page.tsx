import { createPublicClient } from '@/lib/supabase-public'
import Navbar from '@/components/Navbar'
import { notFound } from 'next/navigation'
import type { Room } from '@/lib/database.types'

export const revalidate = 300

type CondoSnippet = {
  name: string
  address: string | null
  district: string | null
  province: string
  facilities: string[]
  cover_image_url: string | null
}

type RoomWithCondo = Room & { condos: CondoSnippet }

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createPublicClient() as any)
    .from('rooms')
    .select('*, condos(name, address, district, province, lat, lng, facilities, cover_image_url), images(public_url, sort_order, is_cover)')
    .eq('id', id)
    .single()

  if (!data) notFound()

  const room = data as unknown as RoomWithCondo & { images: { public_url: string; sort_order: number; is_cover: boolean }[] }
  const condo = room.condos
  const images = (room.images ?? []).sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0) || a.sort_order - b.sort_order)
  const coverUrl = images[0]?.public_url ?? condo?.cover_image_url ?? null

  const furnishingLabel: Record<string, string> = {
    fully: 'Fully Furnished',
    partly: 'Partly Furnished',
    unfurnished: 'Unfurnished',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* รูปภาพ */}
        {images.length > 0 ? (
          <div className="mb-6 space-y-2">
            <div className="rounded-2xl h-72 overflow-hidden bg-gray-100">
              <img src={images[0].public_url} alt={condo?.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img, i) => (
                  <div key={i} className="rounded-xl h-20 overflow-hidden bg-gray-100">
                    <img src={img.public_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-2xl h-64 mb-6 flex flex-col items-center justify-center text-gray-300 gap-2">
            {coverUrl ? (
              <img src={coverUrl} alt={condo?.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <span className="text-4xl">📷</span>
                <span className="text-sm">ยังไม่มีรูปภาพ</span>
              </>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{condo?.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {condo?.district && `${condo.district}, `}{condo?.province}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              ฿{room.price_thb?.toLocaleString() ?? '—'}
            </div>
            <div className="text-xs text-gray-400">ต่อเดือน</div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'ประเภท', value: room.room_type?.toUpperCase() ?? '—' },
            { label: 'ขนาด', value: room.size_sqm ? `${room.size_sqm} ตร.ม.` : '—' },
            { label: 'ห้องนอน', value: `${room.bedrooms} ห้อง` },
            { label: 'ห้องน้ำ', value: `${room.bathrooms} ห้อง` },
            { label: 'ชั้น', value: room.floor ?? '—' },
            { label: 'เฟอร์นิเจอร์', value: furnishingLabel[room.furnishing] ?? room.furnishing },
            { label: 'วิว', value: room.view_direction ?? '—' },
            { label: 'ว่างตั้งแต่', value: room.available_from ?? 'พร้อมเข้าอยู่' },
          ].map((d) => (
            <div key={d.label} className="bg-white rounded-xl p-3 border border-gray-100">
              <div className="text-xs text-gray-400 mb-0.5">{d.label}</div>
              <div className="text-sm font-semibold text-gray-800">{d.value}</div>
            </div>
          ))}
        </div>

        {/* Tags */}
        {room.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {room.tags.map((tag: string) => (
              <span key={tag} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {room.description && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">รายละเอียด</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{room.description}</p>
          </div>
        )}

        {/* Facilities */}
        {condo?.facilities?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">สิ่งอำนวยความสะดวก</h2>
            <div className="flex flex-wrap gap-2">
              {condo.facilities.map((f: string) => (
                <span key={f} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-emerald-600 rounded-2xl p-6 text-white text-center">
          <h2 className="text-lg font-bold mb-1">สนใจห้องนี้?</h2>
          <p className="text-emerald-100 text-sm mb-4">ติดต่อนายหน้าเพื่อนัดดูห้องได้เลย</p>
          <a
            href="https://line.me/ti/p/~your_line_id"
            className="bg-white text-emerald-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors inline-block text-sm"
          >
            💬 ติดต่อผ่าน LINE
          </a>
        </div>
      </div>
    </div>
  )
}
