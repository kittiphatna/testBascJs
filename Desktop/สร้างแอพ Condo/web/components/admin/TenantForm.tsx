'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface TenantFormData {
  full_name: string
  phone: string
  email: string
  line_id: string
  id_card_number: string
  nationality: string
  occupation: string
  emergency_name: string
  emergency_phone: string
  emergency_relation: string
  notes: string
}

const EMPTY: TenantFormData = {
  full_name: '', phone: '', email: '', line_id: '',
  id_card_number: '', nationality: 'ไทย', occupation: '',
  emergency_name: '', emergency_phone: '', emergency_relation: '', notes: '',
}

export default function TenantForm({ defaultValues, tenantId }: { defaultValues?: Partial<TenantFormData>; tenantId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState<TenantFormData>({ ...EMPTY, ...defaultValues })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (f: keyof TenantFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [f]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      line_id: form.line_id || null,
      id_card_number: form.id_card_number || null,
      nationality: form.nationality,
      occupation: form.occupation || null,
      emergency_contact: form.emergency_name
        ? { name: form.emergency_name, phone: form.emergency_phone, relation: form.emergency_relation }
        : {},
      notes: form.notes || null,
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any
      const { error: err } = tenantId
        ? await db.from('tenants').update(payload).eq('id', tenantId)
        : await db.from('tenants').insert(payload)
      if (err) throw err
      router.push('/admin/tenants')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <Field label="ชื่อ-นามสกุล *">
          <input required value={form.full_name} onChange={set('full_name')} placeholder="สมชาย ใจดี" className={cls} />
        </Field>
        <Field label="สัญชาติ">
          <input value={form.nationality} onChange={set('nationality')} className={cls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="เบอร์โทร">
          <input value={form.phone} onChange={set('phone')} placeholder="08x-xxx-xxxx" className={cls} />
        </Field>
        <Field label="Line ID">
          <input value={form.line_id} onChange={set('line_id')} placeholder="@lineid" className={cls} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="อีเมล">
          <input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" className={cls} />
        </Field>
        <Field label="อาชีพ">
          <input value={form.occupation} onChange={set('occupation')} placeholder="พนักงานบริษัท" className={cls} />
        </Field>
      </div>

      <Field label="เลขบัตรประชาชน">
        <input value={form.id_card_number} onChange={set('id_card_number')} placeholder="x-xxxx-xxxxx-xx-x" className={cls} />
      </Field>

      {/* ผู้ติดต่อฉุกเฉิน */}
      <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
        <p className="text-sm font-medium text-gray-700">📞 ผู้ติดต่อฉุกเฉิน</p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="ชื่อ">
            <input value={form.emergency_name} onChange={set('emergency_name')} placeholder="สมหญิง ใจดี" className={cls} />
          </Field>
          <Field label="เบอร์โทร">
            <input value={form.emergency_phone} onChange={set('emergency_phone')} placeholder="08x-xxx-xxxx" className={cls} />
          </Field>
          <Field label="ความสัมพันธ์">
            <input value={form.emergency_relation} onChange={set('emergency_relation')} placeholder="แม่" className={cls} />
          </Field>
        </div>
      </div>

      <Field label="หมายเหตุ (สำหรับนายหน้า)">
        <textarea value={form.notes} onChange={set('notes')} rows={3} className={`${cls} resize-none`} placeholder="บันทึกเพิ่มเติม..." />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {loading ? 'กำลังบันทึก...' : tenantId ? 'บันทึกการแก้ไข' : 'เพิ่มผู้เช่า'}
        </button>
        <a href="/admin/tenants" className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
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

const cls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
