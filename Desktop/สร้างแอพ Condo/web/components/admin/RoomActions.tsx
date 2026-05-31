'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoomActionsProps {
  roomId: string
  verified: boolean
}

export default function RoomActions({ roomId, verified }: RoomActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleVerify() {
    setLoading(true)
    await fetch(`/api/rooms/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_verified: !verified }),
    })
    router.refresh()
    setLoading(false)
  }

  async function deleteRoom() {
    if (!confirm('ลบห้องนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return
    setLoading(true)
    await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleVerify}
        disabled={loading}
        title={verified ? 'ยกเลิก Verified' : 'Verify ห้องนี้'}
        className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          verified
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
        }`}
      >
        {verified ? '✅ Verified' : '⬜ Verify'}
      </button>
      <a
        href={`/admin/rooms/${roomId}/edit`}
        className="px-2 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
      >
        แก้ไข
      </a>
      <button
        onClick={deleteRoom}
        disabled={loading}
        title="ลบห้องนี้"
        className="px-2 py-1 rounded-lg text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        ลบ
      </button>
    </div>
  )
}
