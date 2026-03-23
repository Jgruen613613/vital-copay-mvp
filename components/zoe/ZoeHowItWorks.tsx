export default function ZoeHowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Tell Us Who You Are',
      description:
        'Our 28-question quiz maps your scent memories, music taste, aesthetic identity, and the emotional territory your fragrance should inhabit.',
      detail: 'Not what you think you want — who you actually are.',
    },
    {
      number: '02',
      title: 'AI Generates Your Brief',
      description:
        'Your answers are translated into a precise perfumer\'s creative brief — olfactive family, specific notes, reference fragrances, and the emotional core.',
      detail: 'The bridge between your story and chemistry.',
    },
    {
      number: '03',
      title: 'A Real Perfumer Creates It',
      description:
        'An experienced indie perfumer interprets your brief and creates a genuine EDP at 15–18% concentration. Real fragrance, not a compromise.',
      detail: 'Three sample vials shipped to you. Wear each one for a week.',
    },
    {
      number: '04',
      title: 'We Refine Until It\'s You',
      description:
        'Rate your samples, tell us what works and what doesn\'t. With each iteration, your fragrance gets closer to something only you could wear.',
      detail: 'The feedback loop is the entire product.',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-stone-950">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase text-center mb-4">
          The Process
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-amber-50 text-center mb-16">
          How It Works
        </h2>

        <div className="space-y-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 sm:gap-10 items-start group"
            >
              <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center border border-stone-700 group-hover:border-amber-200/40 transition-colors">
                <span className="text-amber-200/60 font-serif text-lg">{step.number}</span>
              </div>
              <div>
                <h3 className="font-serif text-xl text-amber-50 mb-2">{step.title}</h3>
                <p className="text-stone-400 leading-relaxed mb-1">{step.description}</p>
                <p className="text-amber-200/40 text-sm italic">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
