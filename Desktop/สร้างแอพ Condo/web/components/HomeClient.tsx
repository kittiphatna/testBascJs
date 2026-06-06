'use client'

/**
 * Layer: Page Orchestrator
 * รวม state ทั้งหมดและประกอบ sections เข้าด้วยกัน
 * ─────────────────────────────────────────
 *  <Navbar />
 *  <HeroSection />      ← headline + search
 *  <MapSection />       ← แผนที่ + card
 *  <ViewAllButton />    ← ปุ่มดูรายการทั้งหมด
 * ─────────────────────────────────────────
 */

import { useState, useMemo } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import Navbar           from './Navbar'
import HeroSection      from './HeroSection'
import MapSection       from './MapSection'
import type { AvailableRoomMap } from '@/lib/database.types'

interface HomeClientProps {
  rooms: AvailableRoomMap[]
}

export default function HomeClient({ rooms }: HomeClientProps) {
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedRoom, setSelectedRoom] = useState<AvailableRoomMap | null>(null)

  // กรองห้องตาม search query (ชื่อคอนโด / ทำเล)
  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rooms
    return rooms.filter(
      (r) =>
        r.condo_name?.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.province?.toLowerCase().includes(q)
    )
  }, [rooms, searchQuery])

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── 1. Navbar ── */}
      <Navbar />

      {/* ── 2. Hero: ชื่อ + search ── */}
      <HeroSection onSearch={setSearchQuery} />

      {/* ── 3. Map + card ── */}
      <MapSection
        rooms={filteredRooms}
        selectedRoom={selectedRoom}
        onRoomSelect={setSelectedRoom}
      />

      {/* ── 4. ปุ่มดูรายการทั้งหมด ── */}
      <div className="flex justify-center py-10">
        <Link
          href="/rooms"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-sm font-semibold transition-colors shadow-md"
        >
          ดูรายการทั้งหมด
          <ArrowRight size={16} />
        </Link>
      </div>

    </div>
  )
}
