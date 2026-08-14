import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FileList from '@/components/FileList'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Determine auth provider (Google or Email)
  const provider = user.app_metadata?.provider || 'email'

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold">Your Profile</h1>
      
      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-3xl font-bold text-primary">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{user.user_metadata?.full_name || user.email}</h2>
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
