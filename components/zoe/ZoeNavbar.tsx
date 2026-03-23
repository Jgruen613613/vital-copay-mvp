'use client'
import { useState } from 'react'

export default function ZoeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/zoe" className="font-serif text-2xl tracking-wider text-amber-100">
            ZOE
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/zoe#how-it-works" className="text-stone-400 hover:text-amber-100 transition-colors text-sm tracking-wide uppercase">
              How It Works
            </a>
            <a href="/zoe#the-experience" className="text-stone-400 hover:text-amber-100 transition-colors text-sm tracking-wide uppercase">
              The Experience
            </a>
            <a href="/zoe#about" className="text-stone-400 hover:text-amber-100 transition-colors text-sm tracking-wide uppercase">
              About
            </a>
            <a
              href="/zoe/quiz"
              className="px-5 py-2 bg-amber-100 text-stone-950 text-sm font-medium tracking-wide uppercase hover:bg-amber-200 transition-colors"
            >
              Discover Your Scent
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-stone-400 hover:text-amber-100"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="/zoe#how-it-works" className="block py-2 text-stone-400 hover:text-amber-100 text-sm tracking-wide uppercase">
              How It Works
            </a>
            <a href="/zoe#the-experience" className="block py-2 text-stone-400 hover:text-amber-100 text-sm tracking-wide uppercase">
              The Experience
            </a>
            <a href="/zoe#about" className="block py-2 text-stone-400 hover:text-amber-100 text-sm tracking-wide uppercase">
              About
            </a>
            <a
              href="/zoe/quiz"
              className="block py-2 px-4 bg-amber-100 text-stone-950 text-sm font-medium tracking-wide uppercase text-center"
            >
              Discover Your Scent
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
