'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

const ROOM_TYPES = [
  { value: '', label: 'ทุกประเภท' },
  { value: 'studio', label: 'Studio' },
  { value: '1bed', label: '1 ห้องนอน' },
  { value: '2bed', label: '2 ห้องนอน' },
  { value: '3bed', label: '3 ห้องนอน' },
  { value: 'penthouse', label: 'Penthouse' },
]

const PRICE_RANGES = [
  { value: '', label: 'ทุกราคา' },
  { value: '0-10000', label: 'ต่ำกว่า 10,000' },
  { value: '10000-20000', label: '10,000 – 20,000' },
  { value: '20000-35000', label: '20,000 – 35,000' },
  { value: '35000-999999', label: 'มากกว่า 35,000' },
]

const POPULAR_TAGS = ['ห้องมุม', 'วิวดี', 'ชั้นสูง', 'ใกล้ BTS', 'ใกล้ MRT', 'ใกล้ห้าง', 'เงียบสงบ', 'ตกแต่งใหม่']

export default function RoomFilters({ totalCount }: { totalCount: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const [, startTransition] = useTransition()
  const [locating, setLocating] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const q = params.get('q') ?? ''
  const roomType = params.get('type') ?? ''
  const priceRange = params.get('price') ?? ''
  const nearLat = params.get('lat') ?? ''
  const nearLng = params.get('lng') ?? ''
  const selectedTags = params.get('tags') ? params.get('tags')!.split(',') : []

  const push = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(params.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v)
        else next.delete(k)
      })
      startTransition(() => router.push(`/rooms?${next.toString()}`))
    },
    [params, router]
  )

  function useMyLocation() {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        push({ lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() })
        setLocating(false)
      },
      () => {
        alert('ไม่สามารถเข้าถึงตำแหน่งได้ กรุณาอนุญาตการเข้าถึง Location')
        setLocating(false)
      }
    )
  }

  function clearLocation() {
    push({ lat: '', lng: '' })
  }

  function toggleTag(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    push({ tags: next.join(',') })
  }

  function addCustomTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && tagInput.trim()) {
      toggleTag(tagInput.trim())
      setTagInput('')
    }
  }

  const hasLocation = nearLat && nearLng

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-[57px] z-40">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">

        {/* ค้นหาชื่อคอนโด */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            defaultValue={q}
            onChange={(e) => push({ q: e.target.value })}
            placeholder="ค้นหาชื่อคอนโด..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* ประเภทห้อง */}
        <select
          value={roomType}
          onChange={(e) => push({ type: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {ROOM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* ราคา */}
        <select
          value={priceRange}
          onChange={(e) => push({ price: e.target.value })}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          {PRICE_RANGES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* ใกล้ฉัน */}
        {hasLocation ? (
          <button
            onClick={clearLocation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            📍 ใกล้ฉัน <span className="opacity-70">✕</span>
          </button>
        ) : (
          <button
            onClick={useMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            {locating ? '⏳' : '📍'} {locating ? 'กำลังหา...' : 'ใกล้ฉัน'}
          </button>
        )}

        {/* จำนวนผลลัพธ์ */}
        <span className="text-sm text-gray-400 ml-auto">
          พบ <strong className="text-gray-700">{totalCount}</strong> ห้อง
        </span>
      </div>

      {/* แถว Tags */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 mt-2">
        <span className="text-xs text-gray-400 shrink-0">🏷️ แท็ก:</span>
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            {tag}
          </button>
        ))}
        {/* selected tags ที่ไม่อยู่ใน popular */}
        {selectedTags
          .filter((t) => !POPULAR_TAGS.includes(t))
          .map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 rounded-full text-xs font-medium border bg-emerald-600 text-white border-emerald-600"
            >
              {tag} ✕
            </button>
          ))}
        {/* custom tag input */}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addCustomTag}
          placeholder="แท็กอื่นๆ... (Enter)"
          className="px-3 py-1 rounded-full text-xs border border-dashed border-gray-300 focus:outline-none focus:border-emerald-400 w-36"
        />
        {selectedTags.length > 0 && (
          <button
            onClick={() => push({ tags: '' })}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            ล้างแท็ก
          </button>
        )}
      </div>
    </div>
  )
}
