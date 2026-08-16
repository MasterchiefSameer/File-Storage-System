'use client'

import { useEffect, useState } from 'react'
import {
  File as FileIcon,
  Image as ImageIcon,
  Trash2, Eye, EyeOff,
  ExternalLink,
  Download,
  X,
  Link2
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getBaseUrl } from '@/utils/url'

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

export default function FileList({ userId, readOnly = false }: { userId: string, readOnly?: boolean }) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null)

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

  const copyLink = (fileId: string) => {
    const url = `${getBaseUrl()}/share/${fileId}`
    navigator.clipboard.writeText(url)
    alert('Public link copied to clipboard!')
  }

  if (loading) return <div className="animate-pulse flex flex-col gap-4">Loading files...</div>

  if (files.length === 0) return <div className="text-gray-500">No files uploaded yet.</div>

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(file => (
          <div key={file.id} className="glass p-4 rounded-xl flex flex-col gap-3 group transition-all hover:bg-white/5">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                {file.mime_type.startsWith('image/') ? <ImageIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
              </div>

              {!readOnly && (
                <button
                  onClick={() => toggleVisibility(file)}
                  className={`px-2 py-1 text-xs rounded-full border ${file.is_public ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-gray-500/50 text-gray-400 bg-gray-500/10'}`}
                  title={file.is_public ? "Public - Anyone with link can view" : "Private - Only you can view"}
                >
                  {file.is_public ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                  {file.is_public ? 'Public' : 'Private'}
                </button>
              )}
            </div>

            <div className="overflow-hidden">
              <h4 className="font-medium text-sm truncate" title={file.original_name}>{file.original_name}</h4>
              <p className="text-xs text-gray-400">{(file.size / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handlePreview(file)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors flex-1 flex justify-center items-center">
                <ExternalLink className="w-4 h-4" />
              </button>
              <button onClick={() => handleDownload(file)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors flex-1 flex justify-center items-center" title="Download">
                <Download className="w-4 h-4" />
              </button>
              {file.is_public && (
                <button onClick={() => copyLink(file.id)} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-md text-blue-400 transition-colors flex-1 flex justify-center items-center" title="Copy Public Link">
                  <Link2 className="w-4 h-4" />
                </button>
              )}
              {!readOnly && (
                <button onClick={() => handleDelete(file)} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="relative w-full h-full max-w-5xl max-h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors"
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
