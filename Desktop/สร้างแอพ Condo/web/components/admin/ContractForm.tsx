'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Option { id: string; label: string }

interface ContractFormData {
  room_id: string
  tenant_id: string
  start_date: string
  end_date: string
  monthly_rent: string
  deposit_amount: string
  status: string
  termination_note: string
}

const EMPTY: ContractFormData = {
  room_id: '', tenant_id: '', start_date: '', end_date: '',
  monthly_rent: '', deposit_amount: '', status: 'active', termination_note: '',
}

export default function ContractForm({
  rooms, tenants, defaultValues, contractId,
}: {
  rooms: Option[]
  tenants: Option[]
  defaultValues?: Partial<ContractFormData>
  contractId?: string
}) {
  const router = useRouter()
  const [form, setForm] = useState<ContractFormData>({ ...EMPTY, ...defaultValues })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (f: keyof ContractFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [f]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      room_id: form.room_id,
      tenant_id: form.tenant_id,
      start_date: form.start_date,
      end_date: form.end_date,
      monthly_rent: parseInt(form.monthly_rent),
      deposit_amount: form.deposit_amount ? parseInt(form.deposit_amount) : null,
      status: form.status,
      termination_note: form.termination_note || null,
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any
      const { error: err } = contractId
        ? await db.from('contracts').update(payload).eq('id', contractId)
        : await db.from('contracts').insert(payload)
      if (err) throw err

      // อัปเดต status ห้องถ้าสัญญา active
      if (!contractId && form.status === 'active') {
        await db.from('rooms').update({ status: 'rented' }).eq('id', form.room_id)
      }

      router.push('/admin/contracts')
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
        <Field label="ห้อง *">
          <select required value={form.room_id} onChange={set('room_id')} className={sel}>
            <option value="">-- เลือกห้อง --</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </Field>
        <Field label="ผู้เช่า *">
          <select required value={form.tenant_id} onChange={set('tenant_id')} className={sel}>
            <option value="">-- เลือกผู้เช่า --</option>
            {tenants.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="วันเริ่มสัญญา *">
          <input required type="date" value={form.start_date} onChange={set('start_date')} className={inp} />
        </Field>
        <Field label="วันหมดสัญญา *">
          <input required type="date" value={form.end_date} onChange={set('end_date')} className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="ค่าเช่า/เดือน (บาท) *">
          <input required type="number" value={form.monthly_rent} onChange={set('monthly_rent')} placeholder="15000" className={inp} />
        </Field>
        <Field label="เงินประกัน (บาท)">
          <input type="number" value={form.deposit_amount} onChange={set('deposit_amount')} placeholder="30000" className={inp} />
        </Field>
      </div>

      <Field label="สถานะสัญญา">
        <select value={form.status} onChange={set('status')} className={sel}>
          <option value="active">มีผลบังคับ</option>
          <option value="expired">หมดแล้ว</option>
          <option value="terminated">ยกเลิกก่อนกำหนด</option>
          <option value="renewed">ต่อสัญญา</option>
        </select>
      </Field>

      {(form.status === 'terminated') && (
        <Field label="เหตุผลการยกเลิก">
          <textarea value={form.termination_note} onChange={set('termination_note')} rows={2}
            className={`${inp} resize-none`} placeholder="ระบุเหตุผล..." />
        </Field>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {loading ? 'กำลังบันทึก...' : contractId ? 'บันทึกการแก้ไข' : 'เพิ่มสัญญา'}
        </button>
        <a href="/admin/contracts" className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">
          ยกเลิก
        </a>
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>{children}</div>
}

const inp = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
const sel = `${inp} bg-white`
