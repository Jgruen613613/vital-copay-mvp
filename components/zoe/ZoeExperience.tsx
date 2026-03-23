'use client'

export default function ZoeExperience() {
  const features = [
    {
      title: 'The Scent Canvas',
      subtitle: 'Your olfactive mood board',
      description:
        'Curate images, music, memories, and colors that define your aesthetic identity. The canvas becomes the creative brief — and something beautiful enough to share.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'The Memory Journal',
      subtitle: 'Scent as autobiography',
      description:
        'Each quarterly fragrance comes with a sensory prompt. Write down what the scent unlocks. Over years, build an olfactive autobiography — chapters of your life mapped to fragrance.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: 'Share Your Scent',
      subtitle: 'The olfactive social graph',
      description:
        'Discover people whose scent identity aligns with yours. Follow influencers\' olfactive canvases. Share your fragrance story. The first social network for how you smell.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Memory Capture',
      subtitle: 'Bottling a moment in time',
      description:
        'Preserve the scent of a chapter of your life — a summer, a relationship, a home. Fifteen years from now, open the bottle and be there again.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <section id="the-experience" className="py-24 bg-stone-900">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase text-center mb-4">
          Beyond Fragrance
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-amber-50 text-center mb-4">
          The Experience
        </h2>
        <p className="text-stone-400 text-center max-w-xl mx-auto mb-16">
          Zoe is not a fragrance brand. It is an olfactive identity platform —
          the first place where scent becomes social, personal, and alive.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 border border-stone-800 hover:border-amber-200/20 transition-colors group"
            >
              <div className="text-amber-200/40 group-hover:text-amber-200/70 transition-colors mb-4">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl text-amber-50 mb-1">{feature.title}</h3>
              <p className="text-amber-200/40 text-sm mb-3">{feature.subtitle}</p>
              <p className="text-stone-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
