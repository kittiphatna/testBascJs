'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="text-lg font-bold text-emerald-600">
        🏢 CondoRent
      </Link>
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link
          href="/"
          className={pathname === '/' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}
        >
          แผนที่
        </Link>
        <Link
          href="/rooms"
          className={pathname.startsWith('/rooms') ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-900'}
        >
          ค้นหาห้อง
        </Link>
        <Link
          href="/admin"
          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Admin
        </Link>
      </div>
    </nav>
  )
}
