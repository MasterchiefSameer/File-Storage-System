import Link from 'next/link'
import {
  Lock,
  FileText,
  Folder,
  Share2,
  HardDrive,
  UploadCloud,
  ShieldCheck,
  ArrowRight,
  Pointer,
  Sparkles,
  Eye,
  CheckCircle2,
  Zap,
  Cloud,
  Download,
  Search,
  Globe,
  KeyRound,
  Shield
} from 'lucide-react'

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[85vh] text-center gap-16 overflow-hidden py-12 px-4">

      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center gap-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-6 z-10">

        {/* Top Feature Icon Pill Bar (Inspired by Vaultly reference image) */}
        <div className="glass px-5 py-2.5 rounded-full flex items-center justify-center gap-3 border border-white/15 shadow-[0_0_25px_rgba(0,0,0,0.3)] animate-pulse-glow">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)] hover:scale-110 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.3)] hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-110 transition-transform">
            <Folder className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-110 transition-transform">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:scale-110 transition-transform">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)] hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Main Title with Colorful Pill Badges */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.3] md:leading-[1.3] text-white">
          <span className="px-5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-block shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:scale-105 transition-transform cursor-default">
            Upload
          </span>{' '}
          ,{' '}
          <span className="px-5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-105 transition-transform cursor-default">
            Organize
          </span>{' '}
          , and{' '}
          <br className="hidden sm:inline" />
          <span className="px-5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 transition-transform cursor-default mt-2 sm:mt-0">
            Vault
          </span>{' '}
          <span className="px-6 py-1.5 rounded-full bg-sky-500/25 text-sky-300 border border-sky-400/40 inline-block shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:scale-105 transition-transform cursor-default mt-2 sm:mt-0">
            Endlessly
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mt-2 font-normal leading-relaxed">
          The lightning-fast, ultra-secure cloud vault built for your videos, documents, and media.
        </p>

        {/* Action Buttons with Hover Hand Pointer Gesture */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <Link
            href="/login"
            className="group flex items-center gap-2.5 px-8 py-4 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition-all shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:shadow-[0_0_35px_rgba(59,130,246,0.8)] scale-100 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Get Started</span>
            <Pointer className="w-5 h-5 text-blue-100 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 transform group-hover:-rotate-12" />
          </Link>

          <Link
            href="/login"
            className="group flex items-center gap-2 px-7 py-4 rounded-full glass hover:bg-white/10 text-white font-semibold transition-all border border-white/15 cursor-pointer hover:border-white/30"
          >
            <span>Login</span>
            <Pointer className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </Link>
        </div>
      </section>

      {/* Floating 3D Graphic Cards (Left & Right Sides) */}
      <div className="hidden lg:block absolute left-8 top-1/4 animate-float-slow pointer-events-none -z-0">
        <div className="glass-card p-4 rounded-2xl w-64 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">Project_Assets_v2.zip</p>
              <p className="text-[11px] text-gray-400">34.8 MB • Encrypted</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-300 mt-2 font-medium">
            <span>AES-256 Protected</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute right-8 top-1/3 animate-float-reverse pointer-events-none -z-0">
        <div className="glass-card p-4 rounded-2xl w-64 border border-white/15 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white">Shareable Vault Link</p>
                <p className="text-[10px] text-emerald-400">Public Link Active</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-3 p-2 bg-black/30 rounded-lg text-[10px] text-gray-400 font-mono flex items-center justify-between">
            <span className="truncate">securestorage.app/s/vault-892</span>
            <Share2 className="w-3 h-3 text-gray-300 shrink-0 ml-1" />
          </div>
        </div>
      </div>

      {/* Live Workspace Preview Section */}
      <section className="w-full max-w-5xl mt-6 px-2">
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col gap-6 text-left">

          {/* Header Bar inside preview */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <span className="text-xs font-medium text-gray-400 ml-2">Secure Storage Workspace</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Storage Ready
              </div>
            </div>
          </div>

          {/* Interactive UI Mock Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Drag & Drop Upload</h4>
                <p className="text-xs text-gray-400">Instant file previews & progress</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Privacy Controls</h4>
                <p className="text-xs text-gray-400">Toggle public or private sharing</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Row Level Security</h4>
                <p className="text-xs text-gray-400">Protected user data boundaries</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Highlight Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-6">
        <div className="glass-card p-8 flex flex-col gap-4 text-left border border-white/10 hover:border-blue-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">End-to-End Security</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your files are protected with state-of-the-art encryption and strictly governed by advanced Row Level Security policies.
          </p>
        </div>

        <div className="glass-card p-8 flex flex-col gap-4 text-left border border-white/10 hover:border-purple-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Lightning Fast</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Upload files up to 100MB+ in seconds. Enjoy real-time progress tracking and instant file previews right in your browser.
          </p>
        </div>

        <div className="glass-card p-8 flex flex-col gap-4 text-left border border-white/10 hover:border-emerald-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Cloud className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Easy Sharing</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Toggle files between public and private with a single click. Generate secure, shareable links instantly.
          </p>
        </div>
      </section>

    </div>
  )
}
