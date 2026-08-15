'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect, useRouter } from 'next/navigation'
import FileList from '@/components/FileList'
import { useEffect, useState } from 'react'
import { Check, Edit2, Loader2, X } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  
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

  if (loading) return <div className="p-8 text-center">Loading profile...</div>
  if (!user) return null

  // Determine auth provider (Google or Email)
  const provider = user.app_metadata?.provider || 'email'
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0]

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
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

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Your Shared Files</h3>
        <div className="glass-card p-6 min-h-[400px] flex flex-col text-gray-100">
          <FileList userId={user.id} readOnly={true} />
        </div>
      </div>
    </div>
  )
}
