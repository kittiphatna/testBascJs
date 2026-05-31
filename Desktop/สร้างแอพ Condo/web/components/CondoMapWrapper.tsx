'use client'

import dynamic from 'next/dynamic'
import type { AvailableRoomMap } from '@/lib/database.types'

const CondoMap = dynamic(() => import('./CondoMap'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100 animate-pulse">
      <div className="text-gray-400 text-sm">กำลังโหลดแผนที่...</div>
    </div>
  ),
})

export default function CondoMapWrapper({ rooms }: { rooms: AvailableRoomMap[] }) {
  return <CondoMap rooms={rooms} />
}
