'use client'

export default function ZoeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-stone-950 overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Tagline */}
        <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase mb-8">
          The First Fragrance Made Entirely for You
        </p>

        {/* Main headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-amber-50 leading-tight mb-6">
          Your scent.
          <br />
          <span className="text-amber-200">Your story.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-stone-400 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
          Built from your memories, your music, your aesthetic identity —
          and getting more precise with every wear.
        </p>

        {/* CTA */}
        <a
          href="/zoe/quiz"
          className="inline-block px-8 py-4 bg-amber-100 text-stone-950 font-medium tracking-wide uppercase text-sm hover:bg-amber-200 transition-all hover:shadow-lg hover:shadow-amber-100/20"
        >
          Discover Your Scent
        </a>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
          <div>
            <div className="text-amber-100 text-2xl font-serif">28</div>
            <div className="text-stone-500 text-xs tracking-wide uppercase mt-1">Questions</div>
          </div>
          <div>
            <div className="text-amber-100 text-2xl font-serif">3</div>
            <div className="text-stone-500 text-xs tracking-wide uppercase mt-1">Sample Vials</div>
          </div>
          <div>
            <div className="text-amber-100 text-2xl font-serif">1</div>
            <div className="text-stone-500 text-xs tracking-wide uppercase mt-1">Perfect Match</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
