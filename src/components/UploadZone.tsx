'use client'

import { useState, useRef } from 'react'
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// NOTE FOR FUTURE: Supabase free tier limits uploads to 50MB. 
// When migrating to a paid tier or another storage provider, change MAX_FILE_SIZE to 100 * 1024 * 1024 (100MB).
const MAX_FILE_SIZE = 50 * 1024 * 1024; // Currently 50 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const validateFile = (selectedFile: File) => {
    setError(null)
    setSuccess(false)
    
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Only Images and PDFs are allowed.')
      setFile(null)
      return false
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
      setFile(null)
      return false
    }

    setFile(selectedFile)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setProgress(10) // Initial progress

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Standard upload (Fine for files under 50MB)
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError
      
      setProgress(75)

      // 2. Save metadata to Postgres database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          filename: fileName,
          original_name: file.name,
          size: file.size,
          mime_type: file.type,
          is_public: false,
          storage_path: filePath
        })

      if (dbError) throw dbError

      setProgress(100)
      setSuccess(true)
      
      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null)
        setProgress(0)
        setSuccess(false)
        setIsUploading(false)
        // In a real app, you would trigger a refresh of the file list here
        window.location.reload(); // Simple refresh for now to update dashboard
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during upload')
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="w-full">
      <div 
        className={`w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-white/20 bg-black/20 hover:border-white/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
          accept={ALLOWED_TYPES.join(',')}
        />

        {!file && !isUploading && !success && (
          <>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Drag & Drop your file here</h3>
            <p className="text-sm text-gray-400 mb-6">or click to browse from your device</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Select File
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Max size: 50MB (Images & PDFs)
            </p>
          </>
        )}

        {file && !success && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className="w-full flex items-center p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
              <File className="w-8 h-8 text-primary mr-4" />
              <div className="flex-1 overflow-hidden text-left">
                <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              {!isUploading && (
                <button 
                  onClick={() => setFile(null)} 
                  className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {error && (
              <div className="w-full flex items-center gap-2 p-3 text-sm text-red-200 bg-red-900/30 border border-red-900/50 rounded-lg mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {isUploading ? (
              <div className="w-full flex flex-col gap-2">
                <div className="flex justify-between text-xs font-medium text-primary">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button 
                onClick={handleUpload}
                className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                Upload File
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center text-green-400 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-white">Upload Complete!</h3>
          </div>
        )}
      </div>
    </div>
  )
}
