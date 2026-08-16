'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import FileList from '@/components/FileList'
import { useEffect, useState } from 'react'
import { 
  Check, 
  Edit2, 
  Loader2, 
  X, 
  AlertTriangle, 
  Trash2, 
  Download, 
  Archive, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react'
import { deleteAccount } from '@/app/login/actions'
import JSZip from 'jszip'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  // Account Deletion & Backup States
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState('')
  const [hasDownloaded, setHasDownloaded] = useState(false)
  const [confirmInput, setConfirmInput] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      setNewName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      setLoading(false)
    }
    fetchUser()
  }, [router, supabase.auth])

  const handleSave = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { data, error } = await supabase.auth.updateUser({
      data: { full_name: newName.trim() }
    })
    
    if (!error && data.user) {
      setUser(data.user)
      setIsEditing(false)
    }
    setSaving(false)
  }

  // Backup files download before deletion
  const handleDownloadAll = async () => {
    if (!user) return
    setDownloadingZip(true)
    setDownloadProgress('Fetching file catalog...')

    try {
      // 1. Fetch user's file list from database
      const { data: files, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      if (!files || files.length === 0) {
        alert('You do not have any uploaded files to download.')
        setDownloadingZip(false)
        setDownloadProgress('')
        return
      }

      const zip = new JSZip()
      let count = 0

      // 2. Download each blob from Supabase storage and add to zip
      for (const file of files) {
        setDownloadProgress(`Downloading (${count + 1}/${files.length}): ${file.original_name}`)
        
        const { data: blob, error: downloadErr } = await supabase.storage
          .from('uploads')
          .download(file.storage_path)

        if (downloadErr) {
          console.error(`Failed to download ${file.original_name}:`, downloadErr)
        } else if (blob) {
          zip.file(file.original_name, blob)
        }
        count++
      }

      setDownloadProgress('Creating ZIP archive...')
      const zipContent = await zip.generateAsync({ type: 'blob' })

      // 3. Trigger browser file save
      const url = URL.createObjectURL(zipContent)
      const a = document.createElement('a')
      a.href = url
      a.download = `vault_backup_${new Date().toISOString().slice(0, 10)}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setHasDownloaded(true)
      setDownloadProgress('Backup downloaded successfully!')
    } catch (err: any) {
      console.error('Error creating backup zip:', err)
      alert('Failed to generate file backup: ' + (err.message || 'Unknown error'))
    } finally {
      setDownloadingZip(false)
    }
  }

  // Execute account & storage deletion
  const handleConfirmDelete = async () => {
    if (confirmInput.trim() !== 'DELETE') return
    setDeletingAccount(true)

    try {
      await deleteAccount()
    } catch (err: any) {
      console.error('Account deletion error:', err)
      alert('Failed to delete account: ' + (err.message || 'Unknown error'))
      setDeletingAccount(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading profile...</div>
  if (!user) return null

  // Determine auth provider (Google or Email)
  const provider = user.app_metadata?.provider || 'email'
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      {/* Profile Info Card */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-4 h-10">
            {isEditing ? (
              <div className="flex items-center gap-2 w-full max-w-xs">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-primary w-full"
                  autoFocus
                />
                <button onClick={handleSave} disabled={saving} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => {setIsEditing(false); setNewName(displayName)}} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold">{displayName}</h2>
                <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-400">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 text-xs font-medium bg-white/10 rounded-full border border-white/20 uppercase tracking-wider">
              {provider} LOGIN
            </span>
          </div>
        </div>
      </div>

      {/* User Files List */}
      <div className="mt-4">
        <h3 className="text-xl font-bold mb-4">Your Shared Files</h3>
        <div className="glass-card p-6 min-h-[300px] flex flex-col text-gray-100">
          <FileList userId={user.id} readOnly={true} showStats={false} />
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="glass-card p-6 border border-red-500/30 bg-red-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-200">Danger Zone</h3>
            <p className="text-sm text-gray-400">Permanently delete your account, database records, and all stored files.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowDeleteModal(true)
            setConfirmInput('')
          }}
          className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-xl p-6 sm:p-8 flex flex-col gap-6 border border-red-500/40 shadow-2xl relative">
            
            {/* Warning Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-red-400">
                <ShieldAlert className="w-7 h-7 text-red-500 shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-white">Delete Account & Data</h2>
                  <p className="text-xs text-red-300">Warning: This action CANNOT be undone!</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Message Box */}
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 text-xs sm:text-sm leading-relaxed flex flex-col gap-1.5">
              <p className="font-semibold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Permanent Deletion Notice:
              </p>
              <p>
                Deleting your account will permanently wipe your profile, database records, and remove all uploaded documents, images, and videos from storage.
              </p>
            </div>

            {/* Backup Download Section (User gets a chance to download files first) */}
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 text-sm font-medium">
                  <Download className="w-4 h-4" /> Download your files before deletion
                </div>
                {hasDownloaded && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Backup Saved
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Save a full ZIP archive containing all your stored documents, images, and videos to your computer before wiping your account.
              </p>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={downloadingZip}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                {downloadingZip ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{downloadProgress || 'Preparing ZIP backup...'}</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    <span>{hasDownloaded ? 'Download Backup Again (.zip)' : 'Download All My Files (.zip)'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Confirmation Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-300 font-medium">
                To confirm deletion, type <span className="font-bold text-red-400">DELETE</span> in the box below:
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="bg-black/40 border border-white/10 focus:border-red-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={confirmInput.trim() !== 'DELETE' || deletingAccount}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:hover:bg-red-600 text-white text-sm font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {deletingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Permanently Delete Account
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
