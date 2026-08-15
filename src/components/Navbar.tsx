'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Pointer } from 'lucide-react'

export default function Navbar({ user, signOutAction }: { user: any, signOutAction: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        SecureStorage
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link href="/dashboard" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">
              Profile
            </Link>
            <form action={signOutAction}>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm hover:bg-white/10 transition-colors border border-white/10 cursor-pointer">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </>
        ) : (
          pathname !== '/login' && (
            <Link href="/login" className="group text-sm font-medium px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] inline-flex items-center gap-1.5 cursor-pointer">
              <span>Sign In</span>
              <Pointer className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 transform group-hover:-rotate-12 text-blue-200" />
            </Link>
          )
        )}
      </div>
    </nav>
  )
}
