'use client'
import { useState } from 'react'

export default function ZoeWaitlist() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    try {
      const res = await fetch('/zoe/api/waitlist-zoe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to sign up')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <section className="py-24 bg-stone-900">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase mb-4">
          Coming Soon
        </p>
        <h2 className="font-serif text-3xl text-amber-50 mb-4">
          The Quarterly Subscription
        </h2>
        <p className="text-stone-400 mb-8 leading-relaxed">
          Every quarter, a new 10ml fragrance that evolves with your life.
          Each one more accurate than the last. Join the waitlist for early access.
        </p>

        {submitted ? (
          <div className="p-6 border border-amber-200/20">
            <p className="text-amber-100 font-serif text-lg">You&apos;re on the list.</p>
            <p className="text-stone-500 text-sm mt-2">We&apos;ll be in touch when subscriptions open.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-stone-950 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-100 text-stone-950 font-medium tracking-wide uppercase text-sm hover:bg-amber-200 transition-colors"
            >
              Join Waitlist
            </button>
          </form>
        )}
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </div>
    </section>
  )
}
