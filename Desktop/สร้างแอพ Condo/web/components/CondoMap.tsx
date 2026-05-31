'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { AvailableRoomMap } from '@/lib/database.types'

interface CondoMapProps {
  rooms: AvailableRoomMap[]
}

interface CondoGroup {
  condo_id: string
  condo_name: string
  lat: number
  lng: number
  district: string | null
  rooms: AvailableRoomMap[]
  minPrice: number
  availableCount: number
}

export default function CondoMap({ rooms }: CondoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [selectedCondo, setSelectedCondo] = useState<CondoGroup | null>(null)

  // group rooms by condo
  const condoGroups = rooms.reduce<Record<string, CondoGroup>>((acc, room) => {
    if (!room.lat || !room.lng) return acc
    if (!acc[room.condo_id]) {
      acc[room.condo_id] = {
        condo_id: room.condo_id,
        condo_name: room.condo_name,
        lat: room.lat,
        lng: room.lng,
        district: room.district,
        rooms: [],
        minPrice: Infinity,
        availableCount: 0,
      }
    }
    acc[room.condo_id].rooms.push(room)
    acc[room.condo_id].availableCount++
    if (room.price_thb && room.price_thb < acc[room.condo_id].minPrice) {
      acc[room.condo_id].minPrice = room.price_thb
    }
    return acc
  }, {})

  const groups = Object.values(condoGroups)

  useEffect(() => {
    if (!mapContainer.current) return
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [100.5018, 13.7563],
      zoom: 11,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      groups.forEach((group) => {
        const el = document.createElement('div')
        el.style.cssText = 'cursor:pointer'

        const bg = '#059669'

        el.innerHTML = `
          <div style="
            background:${bg};
            color:white;
            font-size:12px;
            font-weight:700;
            padding:6px 12px;
            border-radius:999px;
            box-shadow:0 4px 12px rgba(0,0,0,0.25);
            white-space:nowrap;
            display:flex;
            align-items:center;
            gap:4px;
            transition:transform 0.15s;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            🏢 ${group.availableCount} ห้องว่าง
          </div>
          <div style="
            width:0;height:0;
            border-left:7px solid transparent;
            border-right:7px solid transparent;
            border-top:8px solid ${bg};
            margin: 0 auto;
          "></div>
        `
        el.addEventListener('click', () => setSelectedCondo(group))

        new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([group.lng, group.lat])
          .addTo(map.current!)
      })
    })

    return () => map.current?.remove()
  }, [groups.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Popup panel */}
      {selectedCondo && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-5 w-80 z-10">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-gray-900">{selectedCondo.condo_name}</h3>
              <p className="text-sm text-gray-500">{selectedCondo.district}</p>
            </div>
            <button
              onClick={() => setSelectedCondo(null)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-2 py-1 rounded-full">
              {selectedCondo.availableCount} ห้องว่าง
            </span>
            <span className="text-emerald-600 font-bold">
              เริ่ม {selectedCondo.minPrice === Infinity ? '—' : `฿${selectedCondo.minPrice.toLocaleString()}`}/เดือน
            </span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedCondo.rooms.map((r) => (
              <a
                key={r.id}
                href={`/rooms/${r.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border border-gray-100"
              >
                <div className="text-sm">
                  <span className="font-medium">{r.room_type?.toUpperCase() || '—'}</span>
                  <span className="text-gray-500 ml-2">{r.size_sqm} ตร.ม.</span>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  ฿{r.price_thb?.toLocaleString()}
                </span>
              </a>
            ))}
          </div>
          <a
            href={`/rooms?condo=${selectedCondo.condo_id}`}
            className="mt-3 block text-center bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            ดูทั้งหมด →
          </a>
        </div>
      )}

      {/* No token warning */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500 text-sm">กรุณาตั้งค่า NEXT_PUBLIC_MAPBOX_TOKEN ใน .env.local</p>
        </div>
      )}
    </div>
  )
}
