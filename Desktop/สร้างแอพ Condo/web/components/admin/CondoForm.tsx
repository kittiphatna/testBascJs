'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CoverImageUpload from './CoverImageUpload'

const FACILITIES_OPTIONS = [
  'สระว่ายน้ำ', 'ฟิตเนส', 'ที่จอดรถ', 'รปภ. 24 ชม.', 'ลิฟต์',
  'สวนหย่อม', 'ห้องซาวน่า', 'Co-working space', 'ร้านสะดวกซื้อ', 'ศูนย์เด็กเล่น',
]

const NEARBY_SUGGESTIONS = [
  'BTS', 'MRT', 'Airport Rail Link',
  'เซ็นทรัล', 'เอ็มควอเทียร์', 'เทอร์มินัล 21', 'ไอคอนสยาม', 'สยามพารากอน',
  'โรงพยาบาล', 'มหาวิทยาลัย', 'สวนสาธารณะ', 'ตลาด', 'ซูเปอร์มาร์เก็ต',
]

interface CondoFormData {
  name: string
  slug: string
  address: string
  district: string
  province: string
  lat: string
  lng: string
  developer: string
  build_year: string
  total_floors: string
  total_units: string
  facilities: string[]
  nearby_places: string[]
  cover_image_url: string
  source_url: string
  source_platform: string
  agent_verified: boolean
}

const EMPTY: CondoFormData = {
  name: '',
  slug: '',
  address: '',
  district: '',
  province: 'กรุงเทพมหานคร',
  lat: '',
  lng: '',
  developer: '',
  build_year: '',
  total_floors: '',
  total_units: '',
  facilities: [],
  nearby_places: [],
  cover_image_url: '',
  source_url: '',
  source_platform: 'manual',
  agent_verified: false,
}

interface CondoFormProps {
  defaultValues?: Partial<CondoFormData>
  condoId?: string
}

export default function CondoForm({ defaultValues, condoId }: CondoFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<CondoFormData>({ ...EMPTY, ...defaultValues })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nearbyInput, setNearbyInput] = useState('')

  const set = (field: keyof CondoFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
  }

  function toggleFacility(f: string) {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }))
  }

  function toggleNearby(place: string) {
    setForm((prev) => ({
      ...prev,
      nearby_places: prev.nearby_places.includes(place)
        ? prev.nearby_places.filter((x) => x !== place)
        : [...prev.nearby_places, place],
    }))
  }

  function addCustomNearby(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && nearbyInput.trim()) {
      e.preventDefault()
      const place = nearbyInput.trim()
      if (!form.nearby_places.includes(place)) {
        setForm((prev) => ({ ...prev, nearby_places: [...prev.nearby_places, place] }))
      }
      setNearbyInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      name: form.name,
      slug: form.slug || autoSlug(form.name),
      address: form.address || null,
      district: form.district || null,
      province: form.province,
      lat: form.lat ? parseFloat(form.lat) : null,
      lng: form.lng ? parseFloat(form.lng) : null,
      developer: form.developer || null,
      build_year: form.build_year ? parseInt(form.build_year) : null,
      total_floors: form.total_floors ? parseInt(form.total_floors) : null,
      total_units: form.total_units ? parseInt(form.total_units) : null,
      facilities: form.facilities,
      nearby_places: form.nearby_places,
      cover_image_url: form.cover_image_url || null,
      source_url: form.source_url || null,
      source_platform: form.source_platform,
      agent_verified: form.agent_verified,
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any
      const { error: err } = condoId
        ? await db.from('condos').update(payload).eq('id', condoId)
        : await db.from('condos').insert(payload)

      if (err) throw err
      router.push('/admin/condos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* ชื่อ + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="ชื่อคอนโด *">
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => {
              setForm((f) => ({ ...f, name: e.target.value, slug: autoSlug(e.target.value) }))
            }}
            placeholder="เช่น The Line อโศก"
            className={inputCls}
          />
        </Field>
        <Field label="Slug (URL)">
          <input
            type="text"
            value={form.slug}
            onChange={set('slug')}
            placeholder="the-line-asok"
            className={inputCls}
          />
        </Field>
      </div>

      {/* ที่อยู่ */}
      <Field label="ที่อยู่">
        <input type="text" value={form.address} onChange={set('address')} placeholder="เลขที่ ถนน ซอย" className={inputCls} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="เขต/อำเภอ">
          <input type="text" value={form.district} onChange={set('district')} placeholder="เช่น วัฒนา" className={inputCls} />
        </Field>
        <Field label="จังหวัด *">
          <input required type="text" value={form.province} onChange={set('province')} className={inputCls} />
        </Field>
      </div>

      {/* พิกัด */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude">
          <input type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="13.7563" className={inputCls} />
        </Field>
        <Field label="Longitude">
          <input type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="100.5018" className={inputCls} />
        </Field>
      </div>
      <p className="text-xs text-gray-400 -mt-3">
        หา lat/lng ได้จาก{' '}
        <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="underline text-blue-500">
          Google Maps
        </a>{' '}
        → คลิกขวาที่ตึง → Copy พิกัด
      </p>

      {/* Developer + ปี */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Developer">
          <input type="text" value={form.developer} onChange={set('developer')} placeholder="เช่น Sansiri" className={inputCls} />
        </Field>
        <Field label="ปีที่สร้าง">
          <input type="number" value={form.build_year} onChange={set('build_year')} placeholder="2020" className={inputCls} />
        </Field>
        <Field label="จำนวนชั้น">
          <input type="number" value={form.total_floors} onChange={set('total_floors')} placeholder="30" className={inputCls} />
        </Field>
      </div>

      <Field label="จำนวนยูนิตทั้งหมด">
        <input type="number" value={form.total_units} onChange={set('total_units')} placeholder="300" className={inputCls} />
      </Field>

      {/* สิ่งอำนวยความสะดวก */}
      <Field label="สิ่งอำนวยความสะดวก">
        <div className="flex flex-wrap gap-2 mt-1">
          {FACILITIES_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFacility(f)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                form.facilities.includes(f)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </Field>

      {/* สถานที่ใกล้เคียง */}
      <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/40 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">📍 สถานที่ใกล้เคียง</p>
          <p className="text-xs text-gray-400 mt-0.5">จะใช้เป็นแท็กแนะนำตอนเพิ่มห้อง เช่น "ใกล้ BTS อโศก"</p>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {NEARBY_SUGGESTIONS.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => toggleNearby(place)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                form.nearby_places.includes(place)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {place}
            </button>
          ))}
        </div>

        {/* Custom place input */}
        <input
          type="text"
          value={nearbyInput}
          onChange={(e) => setNearbyInput(e.target.value)}
          onKeyDown={addCustomNearby}
          placeholder="เพิ่มสถานที่เอง เช่น BTS อโศก, Tops Market... (Enter)"
          className={inputCls}
        />

        {/* Selected places */}
        {form.nearby_places.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-gray-400 self-center">เลือกแล้ว:</span>
            {form.nearby_places.map((place) => (
              <span
                key={place}
                className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
              >
                {place}
                <button
                  type="button"
                  onClick={() => toggleNearby(place)}
                  className="opacity-70 hover:opacity-100 ml-0.5"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cover Image */}
      <Field label="รูป Cover คอนโด">
        <CoverImageUpload
          currentUrl={form.cover_image_url || null}
          onUpload={(url) => setForm((f) => ({ ...f, cover_image_url: url }))}
        />
      </Field>

      {/* Source */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Source Platform">
          <select value={form.source_platform} onChange={set('source_platform')} className={selectCls}>
            <option value="manual">Manual</option>
            <option value="facebook">Facebook</option>
            <option value="line">Line</option>
          </select>
        </Field>
        <Field label="Source URL">
          <input type="url" value={form.source_url} onChange={set('source_url')} placeholder="https://..." className={inputCls} />
        </Field>
      </div>

      {/* Verified */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agent_verified}
          onChange={(e) => setForm((f) => ({ ...f, agent_verified: e.target.checked }))}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-sm font-medium text-gray-700">ตรวจสอบแล้ว (agent_verified) — จะแสดงบนแผนที่</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'กำลังบันทึก...' : condoId ? 'บันทึกการแก้ไข' : 'เพิ่มคอนโด'}
        </button>
        <a href="/admin/condos" className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
          ยกเลิก
        </a>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
const selectCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white'
