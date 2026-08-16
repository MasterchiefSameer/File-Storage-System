'use client'

import { useState, useRef } from 'react'
import { UploadCloud, File, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// NOTE FOR FUTURE: Supabase free tier limits uploads to 50MB. 
// When migrating to a paid tier or another storage provider, change MAX_FILE_SIZE to 100 * 1024 * 1024 (100MB).
const MAX_FILE_SIZE = 50 * 1024 * 1024; // Currently 50 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
const MAX_FILES = 5;

export default function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
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

  const processFiles = (selectedFiles: FileList | File[]) => {
    setError(null)
    setSuccess(false)

    let validFiles: File[] = []
    let hasError = false

    const fileArray = Array.from(selectedFiles)

    if (fileArray.length > MAX_FILES) {
      setError(`You can only upload up to ${MAX_FILES} files at a time.`)
      hasError = true
    }

    // only take up to MAX_FILES
    const filesToProcess = fileArray.slice(0, MAX_FILES)

    for (const file of filesToProcess) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Invalid file type for ${file.name}. Only Images and PDFs are allowed.`)
        hasError = true
        break
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
        hasError = true
        break
      }
      validFiles.push(file)
    }

    if (!hasError) {
      setFiles(validFiles)
    } else {
      setFiles([])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    setError(null)
    setProgress(10)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let completed = 0;
      const progressIncrement = 90 / files.length;

      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

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

        completed++
        setProgress(10 + (completed * progressIncrement))
      }

      setProgress(100)
      setSuccess(true)

      setTimeout(() => {
        setFiles([])
        setProgress(0)
        setSuccess(false)
        setIsUploading(false)
        window.location.reload();
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during upload')
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className={`w-full max-w-lg p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${isDragging
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
          multiple
        />

        {files.length === 0 && !isUploading && !success && (
          <>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Drag & Drop files here</h3>
            <p className="text-sm text-gray-400 mb-6 text-center">or click to browse from your device</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
            >
              Select Files
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Max {MAX_FILES} files at once. 50MB limit per file. <br /> (Images & PDFs)
            </p>
          </>
        )}

        {files.length > 0 && !success && (
          <div className="w-full flex flex-col gap-3">
            <h3 className="font-semibold text-sm mb-2">{files.length} file(s) selected:</h3>
            <div className="max-h-[200px] overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
              {files.map((file, idx) => (
                <div key={idx} className="w-full flex items-center p-3 rounded-lg bg-white/5 border border-white/10 shrink-0">
                  <File className="w-6 h-6 text-primary mr-3 shrink-0" />
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <div className="w-full flex flex-col justify-center items-center gap-2 p-3 text-sm text-red-200 bg-red-900/30 border border-red-900/50 rounded-lg mt-2">
                <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> Error</div>
                <p className="text-center">{error}</p>
              </div>
            )}

            {isUploading ? (
              <div className="w-full flex flex-col gap-2 mt-4">
                <div className="flex justify-between text-xs font-medium text-primary">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setFiles([])}
                  className="flex-1 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                >
                  Upload {files.length} {files.length > 1 ? 'Files' : 'File'}
                </button>
              </div>
            )}
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center text-green-400 animate-in zoom-in duration-300 py-8">
            <CheckCircle2 className="w-16 h-16 mb-4" />
            <h3 className="text-xl font-bold text-white">Upload Complete!</h3>
          </div>
        )}
      </div>
    </div>
  )
}
