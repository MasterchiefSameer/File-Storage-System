'use client'

import { useEffect, useState } from 'react'
import {
  File as FileIcon,
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Download,
  X,
  Link2,
  HardDrive,
  FileText,
  Globe,
  Calendar
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getBaseUrl } from '@/utils/url'
import { toast } from 'sonner'

type FileRecord = {
  id: string
  filename: string
  original_name: string
  size: number
  mime_type: string
  is_public: boolean
  storage_path: string
  created_at: string
}

export default function FileList({
  userId,
  readOnly = false,
  showStats = true
}: {
  userId: string
  readOnly?: boolean
  showStats?: boolean
}) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null)
  const [filter, setFilter] = useState<'all' | 'image' | 'pdf' | 'public'>('all')

  const supabase = createClient()

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setFiles(data)
    setLoading(false)
  }

  const handleDelete = async (file: FileRecord) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('uploads')
      .remove([file.storage_path])

    if (!storageError) {
      // Delete from database
      await supabase.from('files').delete().eq('id', file.id)
      setFiles(files.filter(f => f.id !== file.id))
      toast.success('File deleted successfully')
    } else {
      toast.error('Failed to delete file')
    }
  }

  const toggleVisibility = async (file: FileRecord) => {
    const newStatus = !file.is_public
    const { error } = await supabase
      .from('files')
      .update({ is_public: newStatus })
      .eq('id', file.id)

    if (!error) {
      setFiles(files.map(f => f.id === file.id ? { ...f, is_public: newStatus } : f))
      toast.info(newStatus ? 'File is now Public' : 'File is now Private', {
        description: newStatus ? 'Anyone with the shareable link can view this file.' : 'Only you can view this file.',
      })
    } else {
      toast.error('Failed to update file visibility')
    }
  }

  const getSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage
      .from('uploads')
      .createSignedUrl(path, 60 * 60) // 1 hour expiry

    return data?.signedUrl
  }

  const handlePreview = async (file: FileRecord) => {
    const url = await getSignedUrl(file.storage_path)
    if (url) {
      setPreviewUrl(url)
      setPreviewType(file.mime_type.startsWith('image/') ? 'image' : 'pdf')
    }
  }

  const handleDownload = async (file: FileRecord) => {
    const url = await getSignedUrl(file.storage_path)
    if (url) {
      window.open(url, '_blank')
    }
  }

  const copyLink = (fileId: string, fileName?: string) => {
    const url = `${getBaseUrl()}/share/${fileId}`
    navigator.clipboard.writeText(url)
    toast.success('Public link copied to clipboard!', {
      description: fileName || url,
      icon: <Link2 className="w-5 h-5 text-blue-400" />,
      duration: 3500,
    })
  }

  // Calculate Dashboard Metrics
  const totalFiles = files.length
  const imageCount = files.filter(f => f.mime_type.startsWith('image/')).length
  const pdfCount = files.filter(f => f.mime_type === 'application/pdf' || f.original_name.toLowerCase().endsWith('.pdf')).length
  const otherCount = totalFiles - imageCount - pdfCount
  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0)
  const totalStorageFormatted = totalBytes < 1024 * 1024
    ? `${(totalBytes / 1024).toFixed(1)} KB`
    : `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
  const publicFilesCount = files.filter(f => f.is_public).length

  // Filter files
  const filteredFiles = files.filter(file => {
    if (filter === 'image') return file.mime_type.startsWith('image/')
    if (filter === 'pdf') return file.mime_type === 'application/pdf' || file.original_name.toLowerCase().endsWith('.pdf')
    if (filter === 'public') return file.is_public
    return true
  })

  if (loading) return <div className="animate-pulse flex flex-col gap-4">Loading files...</div>

  return (
    <div className="w-full flex flex-col gap-5">
      {/* 1. Dashboard Statistics Cards */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Total Files Card */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">Total Files</p>
              <p className="text-2xl font-bold text-white leading-tight">{totalFiles}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {imageCount} Images • {pdfCount} PDFs{otherCount > 0 ? ` • ${otherCount} Other` : ''}
              </p>
            </div>
          </div>

          {/* Storage Used Card */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="overflow-hidden w-full">
              <p className="text-[11px] uppercase tracking-wider text-purple-300 font-semibold">Storage Used</p>
              <p className="text-2xl font-bold text-white leading-tight">{totalStorageFormatted}</p>
              <div className="w-full bg-white/10 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(4, (totalBytes / (50 * 1024 * 1024)) * 100))}%` }}
                />
              </div>
              {/* <p className="text-[10px] text-gray-400 mt-1">Beta Limit: 50 MB</p> */}
            </div>
          </div>

          {/* Shared Publicly Card */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Shared Publicly</p>
              <p className="text-2xl font-bold text-white leading-tight">{publicFilesCount}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {publicFilesCount === 1 ? '1 file live via link' : `${publicFilesCount} files live via link`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Filter Tabs */}
      {files.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${filter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
          >
            All ({totalFiles})
          </button>
          <button
            onClick={() => setFilter('image')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${filter === 'image'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
          >
            Images ({imageCount})
          </button>
          <button
            onClick={() => setFilter('pdf')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${filter === 'pdf'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
          >
            PDFs ({pdfCount})
          </button>
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${filter === 'public'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
          >
            Public ({publicFilesCount})
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {files.length === 0 && (
        <div className="text-gray-500 py-12 text-center flex flex-col items-center justify-center gap-2">
          <FileIcon className="w-12 h-12 text-gray-600 mb-1" />
          <p className="text-base font-semibold text-gray-400">No files uploaded yet</p>
          <p className="text-xs text-gray-500">Upload your images or PDF documents using the dropzone on the right.</p>
        </div>
      )}

      {/* 4. Filter Empty State */}
      {files.length > 0 && filteredFiles.length === 0 && (
        <div className="text-gray-500 py-8 text-center text-sm">
          No files match the selected filter.
        </div>
      )}

      {/* 5. Files Grid */}
      {filteredFiles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <div key={file.id} className="glass p-4 rounded-xl flex flex-col gap-3 group transition-all hover:bg-white/5 border border-white/10 hover:border-white/20 shadow-md">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  {file.mime_type.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                </div>

                {!readOnly && (
                  <button
                    onClick={() => toggleVisibility(file)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-all cursor-pointer ${file.is_public
                        ? 'border-green-500/50 text-green-400 bg-green-500/10 hover:bg-green-500/20'
                        : 'border-gray-500/50 text-gray-400 bg-gray-500/10 hover:bg-gray-500/20'
                      }`}
                    title={file.is_public ? "Public - Anyone with link can view" : "Private - Only you can view"}
                  >
                    {file.is_public ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                    {file.is_public ? 'Public' : 'Private'}
                  </button>
                )}
              </div>

              <div className="overflow-hidden">
                <h4 className="font-medium text-sm truncate text-white" title={file.original_name}>{file.original_name}</h4>

                {/* File Size and Upload Date */}
                <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
                  <span className="font-medium text-gray-300">
                    {file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400" title={`Uploaded on ${new Date(file.created_at).toLocaleString()}`}>
                    <Calendar className="w-3 h-3 text-gray-500 shrink-0" />
                    <span>{new Date(file.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handlePreview(file)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors flex-1 flex justify-center items-center cursor-pointer"
                  title="Preview"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors flex-1 flex justify-center items-center cursor-pointer"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                {file.is_public && (
                  <button
                    onClick={() => copyLink(file.id, file.original_name)}
                    className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-md text-blue-400 transition-colors flex-1 flex justify-center items-center cursor-pointer"
                    title="Copy Public Link"
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleDelete(file)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-full h-full max-w-5xl max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {previewType === 'image' ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            ) : (
              <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full rounded-lg shadow-2xl bg-white" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
