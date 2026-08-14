import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'SecureStorage | Next-Gen File Management',
  description: 'Secure, fast, and beautiful cloud storage.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex flex-col min-h-screen">
          <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              SecureStorage
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm font-medium hover:text-white text-gray-300 transition-colors">
                Profile
              </Link>
              <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                Sign In
              </Link>
            </div>
          </nav>
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
