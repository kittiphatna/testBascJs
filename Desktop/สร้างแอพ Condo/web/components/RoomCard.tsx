import type { AvailableRoomMap } from '@/lib/database.types'

interface RoomCardProps {
  room: AvailableRoomMap
  distanceKm?: number
}

const FURNISHING_LABEL: Record<string, string> = {
  fully: 'Fully Furnished',
  partly: 'Partly Furnished',
  unfurnished: 'Unfurnished',
}

const TYPE_LABEL: Record<string, string> = {
  studio: 'Studio',
  '1bed': '1 ห้องนอน',
  '2bed': '2 ห้องนอน',
  '3bed': '3 ห้องนอน',
  penthouse: 'Penthouse',
}

export default function RoomCard({ room, distanceKm }: RoomCardProps) {
  return (
    <a
      href={`/rooms/${room.id}`}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col"
    >
      {/* รูป */}
      <div className="bg-gray-100 h-44 flex items-center justify-center text-gray-300 text-3xl overflow-hidden shrink-0">
        {room.cover_image_url ? (
          <img src={room.cover_image_url} alt={room.condo_name} className="w-full h-full object-cover" />
        ) : (
          '🏢'
        )}
      </div>

      {/* เนื้อหา */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{room.condo_name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {room.district && `${room.district}, `}{room.province}
              {distanceKm !== undefined && (
                <span className="ml-1 text-emerald-600 font-medium">· {distanceKm < 1 ? `${Math.round(distanceKm * 1000)} ม.` : `${distanceKm.toFixed(1)} กม.`}</span>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-emerald-600 font-bold text-sm">฿{room.price_thb?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">/เดือน</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <Chip>{TYPE_LABEL[room.room_type ?? ''] ?? room.room_type ?? '—'}</Chip>
          {room.size_sqm && <Chip>{room.size_sqm} ตร.ม.</Chip>}
          <Chip>{FURNISHING_LABEL[room.furnishing] ?? room.furnishing}</Chip>
        </div>

        {room.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-emerald-50 text-emerald-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {room.facilities?.length > 0 && (
          <p className="text-xs text-gray-400 truncate">
            {room.facilities.slice(0, 4).join(' · ')}
          </p>
        )}
      </div>
    </a>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{children}</span>
  )
}
