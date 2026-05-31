import { createPublicClient } from '@/lib/supabase-public'
import Navbar from '@/components/Navbar'
import RoomFilters from '@/components/RoomFilters'
import RoomCard from '@/components/RoomCard'
import type { AvailableRoomMap } from '@/lib/database.types'
import { Suspense } from 'react'

export const revalidate = 60

interface SearchParams {
  q?: string
  type?: string
  price?: string
  lat?: string
  lng?: string
  tags?: string
}

function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function RoomResults({ searchParams }: { searchParams: SearchParams }) {
  const { q, type, price, lat, lng, tags } = searchParams

  let rooms: AvailableRoomMap[] = []

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (createPublicClient() as any).from('available_rooms_map').select('*')

    // filter ชื่อคอนโด (fuzzy)
    if (q) {
      query = query.ilike('condo_name', `%${q}%`)
    }

    // filter ประเภทห้อง
    if (type) {
      query = query.eq('room_type', type)
    }

    // filter ราคา
    if (price) {
      const [min, max] = price.split('-').map(Number)
      query = query.gte('price_thb', min).lte('price_thb', max)
    }

    // filter tags — ห้องต้องมีทุก tag ที่เลือก
    if (tags) {
      const tagList = tags.split(',').filter(Boolean)
      if (tagList.length > 0) {
        query = query.contains('tags', tagList)
      }
    }

    const { data } = await query.order('price_thb', { ascending: true }).limit(200)
    rooms = data ?? []
  } catch {
    // Supabase not configured
  }

  // sort by distance ถ้ามี lat/lng
  const userLat = lat ? parseFloat(lat) : null
  const userLng = lng ? parseFloat(lng) : null

  let roomsWithDistance: (AvailableRoomMap & { distanceKm?: number })[] = rooms

  if (userLat && userLng) {
    roomsWithDistance = rooms
      .map((r) => ({
        ...r,
        distanceKm:
          r.lat && r.lng
            ? calcDistanceKm(userLat, userLng, r.lat, r.lng)
            : undefined,
      }))
      .sort((a, b) => {
        // ห้องที่ไม่มีพิกัดไปอยู่ท้าย
        if (a.distanceKm === undefined) return 1
        if (b.distanceKm === undefined) return -1
        return a.distanceKm - b.distanceKm
      })
  }

  if (roomsWithDistance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg font-medium">ไม่พบห้องที่ตรงกับเงื่อนไข</p>
        <p className="text-sm mt-1">ลองเปลี่ยน filter หรือค้นหาใหม่</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {roomsWithDistance.map((room) => (
        <RoomCard key={room.id} room={room} distanceKm={room.distanceKm} />
      ))}
    </div>
  )
}

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  // นับจำนวนทั้งหมดสำหรับแสดงใน filter bar
  let totalCount = 0
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (createPublicClient() as any).from('available_rooms_map').select('*', { count: 'exact', head: true })
    if (params.q) query = query.ilike('condo_name', `%${params.q}%`)
    if (params.type) query = query.eq('room_type', params.type)
    if (params.price) {
      const [min, max] = params.price.split('-').map(Number)
      query = query.gte('price_thb', min).lte('price_thb', max)
    }
    if (params.tags) {
      const tagList = params.tags.split(',').filter(Boolean)
      if (tagList.length > 0) query = query.contains('tags', tagList)
    }
    const { count } = await query
    totalCount = count ?? 0
  } catch {
    //
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense>
        <RoomFilters totalCount={totalCount} />
      </Suspense>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 h-64 animate-pulse" />
              ))}
            </div>
          }
        >
          <RoomResults searchParams={params} />
        </Suspense>
      </main>
    </div>
  )
}
