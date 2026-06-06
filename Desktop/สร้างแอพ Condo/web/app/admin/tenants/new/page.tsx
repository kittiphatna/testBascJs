import TenantForm from '@/components/admin/TenantForm'

export default function NewTenantPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">เพิ่มผู้เช่าใหม่</h1>
      <TenantForm />
    </div>
  )
}
