import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Download, FileIcon, ImageIcon } from 'lucide-react'

export default async function SharedFilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const fileId = params.id
  
  const supabase = await createClient()

  // 1. Fetch file metadata
  const { data: file, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single()

  // If file doesn't exist or is not public, return 404
  if (error || !file || !file.is_public) {
    notFound()
  }

  // 2. Get a signed URL to allow downloading the actual file
  const { data: signedUrlData } = await supabase.storage
    .from('uploads')
    .createSignedUrl(file.storage_path, 60 * 60) // 1 hour expiry

  const downloadUrl = signedUrlData?.signedUrl

  const isImage = file.mime_type.startsWith('image/')
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="glass-card w-full max-w-2xl p-8 flex flex-col items-center text-center gap-6">
        
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
          {isImage ? <ImageIcon className="w-10 h-10" /> : <FileIcon className="w-10 h-10" />}
        </div>
        
        <div>
          <h1 className="text-2xl font-bold mb-2 break-all">{file.original_name}</h1>
          <p className="text-gray-400">
            Shared securely via SecureStorage • {sizeMB} MB
          </p>
        </div>

        {downloadUrl ? (
          <div className="flex gap-4 w-full mt-4">
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-all shadow-lg flex justify-center items-center gap-2"
            >
              <Download className="w-5 h-5" /> Download File
            </a>
          </div>
        ) : (
          <div className="p-4 bg-red-500/20 text-red-400 rounded-lg w-full">
            Could not generate download link. Please try again later.
          </div>
        )}

      </div>
    </div>
  )
}
