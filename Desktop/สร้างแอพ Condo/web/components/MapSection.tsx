'use client'

/**
 * Layer: Map Section
 * แผนที่แบบ full-width + card แสดงรายละเอียดห้องที่เลือก (มุมขวาบน)
 * ตาม sketch: แผนที่กว้างเต็ม + กล่องข้อมูลลอยด้านขวา
 */

import dynamic from 'next/dynamic'
import type { AvailableRoomMap } from '@/lib/database.types'
import SelectedRoomCard from './SelectedRoomCard'

const CondoMap = dynamic(() => import('./CondoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-indigo-50 animate-pulse">
      <p className="text-indigo-400 text-sm">กำลังโหลดแผนที่...</p>
    </div>
  ),
})

interface MapSectionProps {
  rooms: AvailableRoomMap[]
  selectedRoom: AvailableRoomMap | null
  onRoomSelect: (room: AvailableRoomMap | null) => void
}

export default function MapSection({ rooms, selectedRoom, onRoomSelect }: MapSectionProps) {
  return (
    <section className="relative w-full h-[520px] bg-indigo-50">

      {/* ── แผนที่ ── */}
      <CondoMap rooms={rooms} onRoomSelect={onRoomSelect} />

      {/* ── Card ห้องที่เลือก (มุมขวาบน ตาม sketch) ── */}
      {selectedRoom && (
        <div className="absolute top-4 right-4 z-10 w-72">
          <SelectedRoomCard room={selectedRoom} onClose={() => onRoomSelect(null)} />
        </div>
      )}

    </section>
  )
}
