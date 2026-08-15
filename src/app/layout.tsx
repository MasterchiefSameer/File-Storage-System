import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './login/actions'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SecureStorage | Next-Gen File Management',
  description: 'Secure, fast, and beautiful cloud storage.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Navbar user={user} signOutAction={signOut} />
          <main className="flex-1 flex flex-col items-center p-6 md:p-12 lg:p-24 w-full max-w-7xl mx-auto">
            {children}
          </main>
          <footer className="w-full text-center py-6 text-sm text-gray-500 border-t border-surface-border mt-auto">
            © {new Date().getFullYear()} SecureStorage. All rights reserved.
          </footer>
        </div>
      </body>
    </html>
  )
}
