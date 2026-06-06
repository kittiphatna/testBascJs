'use client'

/**
 * Layer: Navigation
 * Navbar แบบ 3 ส่วน — เมนูซ้าย | โลโก้กลาง | เมนูขวา
 * ตาม sketch: แผนที่ | ที่พัก  [🏠]  ติดต่อ | ลงประกาศ
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, LayoutGrid, MessageCircle, PenLine } from 'lucide-react'

function NavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: React.ReactNode
  label: string
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
        active ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-500'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-8 py-3 grid grid-cols-3 items-center">

        {/* ── ซ้าย: แผนที่ | ที่พัก ── */}
        <div className="flex items-center gap-8">
          <NavLink href="/"      icon={<MapPin    size={20} />} label="แผนที่" />
          <NavLink href="/rooms" icon={<LayoutGrid size={20} />} label="ที่พัก" />
        </div>

        {/* ── กลาง: โลโก้วงกลม ── */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="flex items-center justify-center w-14 h-14 rounded-full border-2 border-indigo-400 bg-white hover:bg-indigo-50 transition-colors shadow-sm"
            aria-label="หน้าแรก"
          >
            <span className="text-2xl">🏠</span>
          </Link>
        </div>

        {/* ── ขวา: ติดต่อ | ลงประกาศ ── */}
        <div className="flex items-center justify-end gap-8">
          <NavLink href="/contact"        icon={<MessageCircle size={20} />} label="ติดต่อ" />
          <NavLink href="/admin/rooms/new" icon={<PenLine       size={20} />} label="ลงประกาศ" />
        </div>

      </div>
    </nav>
  )
}
