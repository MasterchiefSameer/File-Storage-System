import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/utils/supabase/server'
import { signOut } from './login/actions'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'

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
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(18, 20, 26, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              borderRadius: '1rem',
              boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.6)',
              padding: '14px 18px',
            },
          }}
        />
      </body>
    </html>
  )
}
