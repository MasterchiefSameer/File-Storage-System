import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, Cloud } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[80vh] text-center gap-12">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center gap-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-12">
        <div className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
          Introducing SecureStorage 2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Your Files, <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Secured in the Cloud.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mt-4">
          The ultimate platform for uploading, managing, and sharing your most important files.
          Experience blazing fast speeds and military-grade security.
        </p>
        <div className="flex items-center gap-4 mt-8">
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-all shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] scale-100 hover:scale-105 active:scale-95">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-full glass hover:bg-white/10 text-white font-semibold transition-all">
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-24">
        <div className="glass-card p-8 flex flex-col gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">End-to-End Security</h3>
          <p className="text-gray-400 text-sm">
            Your files are protected with state-of-the-art encryption and strictly governed by advanced Row Level Security policies.
          </p>
        </div>
        <div className="glass-card p-8 flex flex-col gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Lightning Fast</h3>
          <p className="text-gray-400 text-sm">
            Upload files up to 100MB+ in seconds. Enjoy real-time progress tracking and instant file previews right in your browser.
          </p>
        </div>
        <div className="glass-card p-8 flex flex-col gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Cloud className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">Easy Sharing</h3>
          <p className="text-gray-400 text-sm">
            Toggle files between public and private with a single click. Generate secure, shareable links instantly.
          </p>
        </div>
      </section>

    </div>
  )
}
