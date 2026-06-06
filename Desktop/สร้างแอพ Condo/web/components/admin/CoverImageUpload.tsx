'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface CoverImageUploadProps {
  currentUrl?: string | null
  onUpload: (url: string) => void
}

export default function CoverImageUpload({ currentUrl, onUpload }: CoverImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { setError('ไฟล์ใหญ่เกิน 5MB'); return }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `condos/cover_${Date.now()}.${ext}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    const { error: uploadErr } = await db.storage.from('condo-images').upload(path, file, { upsert: true })
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }

    const { data } = db.storage.from('condo-images').getPublicUrl(path)
    setPreview(data.publicUrl)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors"
        style={{ height: 160 }}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

        {preview ? (
          <>
            <img src={preview} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">📷 เปลี่ยนรูป</span>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            {uploading ? (
              <span className="text-emerald-600 text-sm animate-pulse">⏳ กำลังอัปโหลด...</span>
            ) : (
              <>
                <span className="text-3xl">🖼️</span>
                <span className="text-sm">คลิกหรือลากรูป Cover มาวาง</span>
                <span className="text-xs">PNG, JPG ไม่เกิน 5MB</span>
              </>
            )}
          </div>
        )}

        {uploading && preview && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm animate-pulse">⏳ กำลังอัปโหลด...</span>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
