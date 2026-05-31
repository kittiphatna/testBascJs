'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Condo } from '@/lib/database.types'
import ImageUpload from './ImageUpload'

interface RoomFormProps {
  condos: Pick<Condo, 'id' | 'name' | 'district' | 'nearby_places'>[]
  defaultValues?: Partial<RoomFormData>
  roomId?: string
}

interface RoomFormData {
  condo_id: string
  room_code: string
  room_number: string
  floor: string
  size_sqm: string
  room_type: string
  bedrooms: string
  bathrooms: string
  furnishing: string
  view_direction: string
  price_thb: string
  status: string
  available_from: string
  description: string
  tags: string
  agent_verified: boolean
  owner_name: string
  owner_phone: string
  owner_facebook: string
  owner_line_id: string
}

const EMPTY: RoomFormData = {
  condo_id: '',
  room_code: '',
  room_number: '',
  floor: '',
  size_sqm: '',
  room_type: 'studio',
  bedrooms: '0',
  bathrooms: '1',
  furnishing: 'fully',
  view_direction: '',
  price_thb: '',
  status: 'available',
  available_from: '',
  description: '',
  tags: '',
  agent_verified: false,
  owner_name: '',
  owner_phone: '',
  owner_facebook: '',
  owner_line_id: '',
}

export default function RoomForm({ condos, defaultValues, roomId }: RoomFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<RoomFormData>({ ...EMPTY, ...defaultValues })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof RoomFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const selectedCondo = condos.find((c) => c.id === form.condo_id)
  const nearbyTagSuggestions = selectedCondo?.nearby_places ?? []

  function toggleTag(tag: string) {
    const current = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]
    setForm((f) => ({ ...f, tags: next.join(', ') }))
  }

  const currentTags = form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      condo_id: form.condo_id,
      room_number: form.room_number || null,
      floor: form.floor ? parseInt(form.floor) : null,
      size_sqm: form.size_sqm ? parseFloat(form.size_sqm) : null,
      room_type: form.room_type || null,
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      furnishing: form.furnishing,
      view_direction: form.view_direction || null,
      price_thb: form.price_thb ? parseInt(form.price_thb) : null,
      status: form.status,
      available_from: form.available_from || null,
      description: form.description || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      agent_verified: form.agent_verified,
      room_code: form.room_code || null,
      owner_name: form.owner_name || null,
      owner_phone: form.owner_phone || null,
      owner_facebook: form.owner_facebook || null,
      owner_line_id: form.owner_line_id || null,
    }

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      const { error: err } = roomId
        ? await db.from('rooms').update(payload).eq('id', roomId)
        : await db.from('rooms').insert(payload)

      if (err) throw err
      if (roomId) {
        router.push('/admin/rooms')
      } else {
        // redirect ไปหน้า edit เพื่ออัปโหลดรูปได้เลย
        const { data: newRoom } = await db.from('rooms').select('id').order('listed_at', { ascending: false }).limit(1).single()
        router.push(newRoom ? `/admin/rooms/${newRoom.id}/edit` : '/admin/rooms')
      }
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

      {/* รหัสห้อง */}
      <Field label="รหัสห้อง">
        <div className="flex gap-2">
          <input
            type="text"
            value={form.room_code}
            onChange={set('room_code')}
            placeholder="เช่น A1B2C3 (ระบบจะสร้างให้อัตโนมัติถ้าว่าง)"
            className={`${inputCls} font-mono tracking-widest uppercase`}
          />
          {form.room_code && (
            <span className="flex items-center bg-gray-100 text-gray-600 text-xs font-mono px-3 rounded-xl whitespace-nowrap">
              #{form.room_code.toUpperCase()}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">ใช้อ้างอิงกับลูกค้าได้เลย เช่น "ห้อง #A1B2C3"</p>
      </Field>

      {/* Condo */}
      <Field label="คอนโด *">
        <select required value={form.condo_id} onChange={set('condo_id')} className={selectCls}>
          <option value="">-- เลือกคอนโด --</option>
          {condos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.district ? `(${c.district})` : ''}
            </option>
          ))}
        </select>
        {condos.length === 0 && (
          <p className="text-xs text-amber-600 mt-1">ยังไม่มีคอนโด — <a href="/admin/condos/new" className="underline">เพิ่มคอนโดก่อน</a></p>
        )}
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="เลขห้อง">
          <input type="text" value={form.room_number} onChange={set('room_number')} placeholder="เช่น 2304" className={inputCls} />
        </Field>
        <Field label="ชั้น">
          <input type="number" value={form.floor} onChange={set('floor')} placeholder="เช่น 23" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="ขนาด (ตร.ม.)">
          <input type="number" step="0.1" value={form.size_sqm} onChange={set('size_sqm')} placeholder="เช่น 35" className={inputCls} />
        </Field>
        <Field label="ราคา/เดือน (บาท) *">
          <input type="number" required value={form.price_thb} onChange={set('price_thb')} placeholder="เช่น 15000" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="ประเภทห้อง">
          <select value={form.room_type} onChange={set('room_type')} className={selectCls}>
            {['studio', '1bed', '2bed', '3bed', 'penthouse'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="ห้องนอน">
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} className={inputCls} />
        </Field>
        <Field label="ห้องน้ำ">
          <input type="number" min="1" value={form.bathrooms} onChange={set('bathrooms')} className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="เฟอร์นิเจอร์">
          <select value={form.furnishing} onChange={set('furnishing')} className={selectCls}>
            <option value="fully">Fully Furnished</option>
            <option value="partly">Partly Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </Field>
        <Field label="วิว">
          <input type="text" value={form.view_direction} onChange={set('view_direction')} placeholder="city / pool / garden" className={inputCls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="สถานะ">
          <select value={form.status} onChange={set('status')} className={selectCls}>
            <option value="available">ว่าง</option>
            <option value="rented">มีผู้เช่า</option>
            <option value="reserved">จอง</option>
            <option value="maintenance">ซ่อมบำรุง</option>
            <option value="unlisted">ซ่อน</option>
          </select>
        </Field>
        <Field label="ว่างตั้งแต่">
          <input type="date" value={form.available_from} onChange={set('available_from')} className={inputCls} />
        </Field>
      </div>

      <Field label="แท็ก (คั่นด้วย , )">
        <input type="text" value={form.tags} onChange={set('tags')} placeholder="ห้องมุม, วิวดี, ชั้นสูง" className={inputCls} />
        {nearbyTagSuggestions.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-1.5">📍 สถานที่ใกล้เคียงจากคอนโด (กดเพื่อเพิ่มเป็นแท็ก):</p>
            <div className="flex flex-wrap gap-1.5">
              {nearbyTagSuggestions.map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => toggleTag(place)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                    currentTags.includes(place)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-blue-600 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  {currentTags.includes(place) ? '✓ ' : '+ '}{place}
                </button>
              ))}
            </div>
          </div>
        )}
        {!form.condo_id && (
          <p className="text-xs text-gray-400 mt-1.5">เลือกคอนโดก่อนเพื่อดูสถานที่ใกล้เคียงแนะนำ</p>
        )}
        {form.condo_id && nearbyTagSuggestions.length === 0 && (
          <p className="text-xs text-gray-400 mt-1.5">คอนโดนี้ยังไม่มีสถานที่ใกล้เคียง — ไปเพิ่มได้ที่ <a href={`/admin/condos/${form.condo_id}/edit`} className="underline text-blue-500">แก้ไขคอนโด</a></p>
        )}
      </Field>

      <Field label="รายละเอียดเพิ่มเติม">
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="รายละเอียดห้อง..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* ข้อมูลเจ้าของ (Admin only) */}
      <div className="border border-orange-100 rounded-xl p-4 bg-orange-50/40 space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-700">🔒 ข้อมูลเจ้าของห้อง (Admin เท่านั้น)</p>
          <p className="text-xs text-gray-400 mt-0.5">ไม่แสดงให้ลูกค้าเห็น ใช้ติดต่อกลับเจ้าของห้อง</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="ชื่อเจ้าของห้อง">
              <input type="text" value={form.owner_name} onChange={set('owner_name')}
                placeholder="ชื่อ-นามสกุล" className={inputCls} />
            </Field>
            <Field label="เบอร์โทร">
              <input type="tel" value={form.owner_phone} onChange={set('owner_phone')}
                placeholder="08x-xxx-xxxx" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Facebook">
              <input type="text" value={form.owner_facebook} onChange={set('owner_facebook')}
                placeholder="ชื่อ FB หรือ URL" className={inputCls} />
            </Field>
            <Field label="Line ID">
              <input type="text" value={form.owner_line_id} onChange={set('owner_line_id')}
                placeholder="@lineid" className={inputCls} />
            </Field>
          </div>
        </div>
      </div>

      {/* รูปภาพห้อง */}
      {roomId ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">รูปภาพห้อง</label>
          <ImageUpload roomId={roomId} />
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
          📷 หลังกด <strong>เพิ่มห้อง</strong> ระบบจะพาไปหน้าแก้ไขเพื่ออัปโหลดรูปได้เลย
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.agent_verified}
          onChange={(e) => setForm((f) => ({ ...f, agent_verified: e.target.checked }))}
          className="w-4 h-4 accent-emerald-600"
        />
        <span className="text-sm font-medium text-gray-700">
          ตรวจสอบแล้ว (agent_verified) — <span className="text-emerald-600">หมุดจะขึ้นบนแผนที่</span>
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'กำลังบันทึก...' : roomId ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
        </button>
        <a href="/admin/rooms" className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
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
