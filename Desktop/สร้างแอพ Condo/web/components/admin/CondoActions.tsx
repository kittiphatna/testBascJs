'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CondoActions({ condoId, condoName }: { condoId: string; condoName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function deleteCondo() {
    if (!confirm(`ลบ "${condoName}"?\n\nห้องทั้งหมดในคอนโดนี้จะถูกลบด้วย`)) return
    setLoading(true)
    const res = await fetch(`/api/condos/${condoId}`, { method: 'DELETE' })
    if (!res.ok) {
      const { error } = await res.json()
      alert(`ลบไม่สำเร็จ: ${error}`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={`/admin/condos/${condoId}/edit`}
        className="px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        แก้ไข
      </a>
      <button
        onClick={deleteCondo}
        disabled={loading}
        className="px-2 py-1 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {loading ? '...' : 'ลบ'}
      </button>
    </div>
  )
}
