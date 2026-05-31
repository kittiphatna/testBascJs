'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

interface UploadedImage {
  public_url: string
  storage_path: string
}

interface ImageUploadProps {
  roomId: string
  existingImages?: UploadedImage[]
  onUpload?: (img: UploadedImage) => void
}

export default function ImageUpload({ roomId, existingImages = [], onUpload }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} ใหญ่เกิน 5MB`)
        continue
      }

      const ext = file.name.split('.').pop()
      const path = `rooms/${roomId}/${Date.now()}.${ext}`

      const { error: uploadErr } = await db.storage.from('condo-images').upload(path, file, { upsert: true })
      if (uploadErr) { setError(uploadErr.message); continue }

      const { data: urlData } = db.storage.from('condo-images').getPublicUrl(path)
      const public_url = urlData.publicUrl

      // บันทึกลง images table
      await db.from('images').insert({
        room_id: roomId,
        storage_path: path,
        public_url,
        image_type: 'room',
        sort_order: images.length,
        is_cover: images.length === 0,
        uploaded_by: 'manual',
      })

      const newImg = { public_url, storage_path: path }
      setImages((prev) => [...prev, newImg])
      onUpload?.(newImg)
    }

    setUploading(false)
  }

  async function deleteImage(img: UploadedImage) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    await db.storage.from('condo-images').remove([img.storage_path])
    await db.from('images').delete().eq('storage_path', img.storage_path)
    setImages((prev) => prev.filter((i) => i.storage_path !== img.storage_path))
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="text-sm text-emerald-600 font-medium animate-pulse">⏳ กำลังอัปโหลด...</div>
        ) : (
          <>
            <div className="text-3xl mb-2">📷</div>
            <p className="text-sm text-gray-500">คลิกหรือลากรูปมาวางที่นี่</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ขนาดไม่เกิน 5MB</p>
          </>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div key={img.storage_path} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img src={img.public_url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded-full">cover</span>
              )}
              <button
                type="button"
                onClick={() => deleteImage(img)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
