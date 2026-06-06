'use client'

/**
 * Layer: Hero Section
 * พื้นที่ชื่อเว็บ + ช่องค้นหา
 * ตาม sketch: ชื่อ 2 บรรทัด + search bar + ปุ่มค้นหา
 */

import { useState } from 'react'
import { Search } from 'lucide-react'

interface HeroSectionProps {
  onSearch: (query: string) => void
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <section className="bg-indigo-50 py-14 px-6">
      <div className="max-w-3xl mx-auto text-center">

        {/* ── Headline ── */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug mb-2">
          ที่พัก<span className="text-indigo-600">ตอบโจทย์</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          ทั้ง<span className="text-indigo-500 font-semibold">นักศึกษา</span>{' '}
          และ{' '}
          <span className="text-indigo-500 font-semibold">คนทำงาน</span>{' '}
          ในกรุงเทพ
        </p>

        {/* ── Search bar ── */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาโดยชื่อคอนโด หรือ ทำเล..."
            className="flex-1 px-4 py-3 rounded-xl border border-indigo-300 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Search size={16} />
            ค้นหา
          </button>
        </form>

      </div>
    </section>
  )
}
