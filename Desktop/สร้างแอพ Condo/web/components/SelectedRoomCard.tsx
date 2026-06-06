'use client'

/**
 * Layer: Selected Room Card
 * Card ลอยบนแผนที่ แสดงรายละเอียดห้องที่เลือก
 */

import { X } from 'lucide-react'
import type { AvailableRoomMap } from '@/lib/database.types'

interface SelectedRoomCardProps {
  room: AvailableRoomMap
  onClose: () => void
}

export default function SelectedRoomCard({ room, onClose }: SelectedRoomCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-indigo-100">

      {/* ── รูปภาพ ── */}
      <div className="relative h-36 bg-indigo-50">
        {room.cover_image_url ? (
          <img src={room.cover_image_url} alt={room.condo_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏢</div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 transition-colors"
          aria-label="ปิด"
        >
          <X size={14} className="text-gray-600" />
        </button>
      </div>

      {/* ── รายละเอียด ── */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-0.5">{room.condo_name}</h3>
        <p className="text-xs text-gray-400 mb-3">
          {room.district ? `${room.district}, ` : ''}{room.province}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 flex-wrap">
            {room.room_type && (
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                {room.room_type.toUpperCase()}
              </span>
            )}
            {room.size_sqm && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {room.size_sqm} ตร.ม.
              </span>
            )}
          </div>
          <span className="text-indigo-600 font-bold text-sm">
            ฿{room.price_thb?.toLocaleString()}/เดือน
          </span>
        </div>

        <a
          href={`/rooms/${room.id}`}
          className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          ดูรายละเอียด →
        </a>
      </div>

    </div>
  )
}
