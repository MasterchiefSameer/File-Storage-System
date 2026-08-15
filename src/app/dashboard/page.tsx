import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { signOut } from '../login/actions'
import UploadZone from '@/components/UploadZone'
import FileList from '@/components/FileList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage and upload your files</p>
        </div>
        <form action={signOut}>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg glass text-sm hover:bg-white/10 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col text-gray-100">
          <h2 className="text-xl font-semibold mb-6">Your Files</h2>
          <FileList userId={user.id} />
        </div>
        <div className="glass-card p-6 min-h-[400px] flex flex-col items-center justify-center text-gray-500 border-dashed border-2 border-white/20">
          <UploadZone />
        </div>
      </div>
    </div>
  )
}
