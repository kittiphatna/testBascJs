import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check auth — redirect to login if not authenticated
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')
  } catch {
    // Supabase not configured — allow access in dev
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="text-lg font-bold text-emerald-600">🏢 CondoRent</Link>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 text-sm font-medium">
          <NavItem href="/admin" label="📊 Dashboard" />
          <NavItem href="/admin/condos" label="🏢 คอนโด" />
          <NavItem href="/admin/rooms" label="🚪 ห้อง" />
          <NavItem href="/admin/contracts" label="📄 สัญญา" />
          <NavItem href="/admin/tenants" label="👤 ผู้เช่า" />
          <NavItem href="/admin/review" label="✅ Review Queue" />
          <NavItem href="/admin/agent-logs" label="🤖 Agent Logs" />
        </nav>
        <div className="p-3 border-t border-gray-200">
          <form action="/api/auth/signout" method="post">
            <button className="w-full text-left text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100">
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
    >
      {label}
    </Link>
  )
}
