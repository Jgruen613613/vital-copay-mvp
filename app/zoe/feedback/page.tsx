'use client'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ZoeNavbar from '@/components/zoe/ZoeNavbar'

function FeedbackForm() {
  const searchParams = useSearchParams()
  const submissionId = searchParams.get('id')

  const [ratings, setRatings] = useState({
    formula_01: { overall: 5, longevity: 5, howMe: 5, notes: '' },
    formula_02: { overall: 5, longevity: 5, howMe: 5, notes: '' },
    formula_03: { overall: 5, longevity: 5, howMe: 5, notes: '' },
  })
  const [adjustmentRequest, setAdjustmentRequest] = useState('')
  const [preferredFormula, setPreferredFormula] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function updateRating(formula: keyof typeof ratings, field: string, value: string | number) {
    setRatings(prev => ({
      ...prev,
      [formula]: { ...prev[formula], [field]: value },
    }))
  }

  async function handleSubmit() {
    if (!submissionId) {
      setError('Missing submission ID. Please use the link from your email.')
      return
    }

    try {
      const res = await fetch('/zoe/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submission_id: parseInt(submissionId),
          formula_01_ratings: ratings.formula_01,
          formula_02_ratings: ratings.formula_02,
          formula_03_ratings: ratings.formula_03,
          adjustment_request: adjustmentRequest || null,
          wants_full_bottle: preferredFormula !== null,
          preferred_formula: preferredFormula,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto text-center">
        <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase mb-4">Thank You</p>
        <h1 className="font-serif text-4xl text-amber-50 mb-4">Your feedback is invaluable.</h1>
        <p className="text-stone-400 mb-8">
          Your perfumer will use this to create the next iteration — getting closer to something that is entirely, uniquely you.
        </p>
        {preferredFormula && (
          <div className="p-6 border border-amber-200/20">
            <p className="text-amber-100 font-serif text-lg">
              You selected Formula {preferredFormula.toString().padStart(2, '0')} as your favorite.
            </p>
            <p className="text-stone-500 text-sm mt-2">
              We&apos;ll be in touch about your full bottle.
            </p>
          </div>
        )}
      </div>
    )
  }

  const formulaNames = [
    { key: 'formula_01' as const, name: 'Formula 01', subtitle: 'Fresh / Green / Aquatic' },
    { key: 'formula_02' as const, name: 'Formula 02', subtitle: 'Warm / Woody / Oriental' },
    { key: 'formula_03' as const, name: 'Formula 03', subtitle: 'Clean / Floral / Musk' },
  ]

  return (
    <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
      <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase text-center mb-4">
        Your Samples
      </p>
      <h1 className="font-serif text-3xl text-amber-50 text-center mb-3">
        How Did They Feel?
      </h1>
      <p className="text-stone-400 text-center text-sm mb-12">
        Rate each formula honestly. There are no wrong answers — only data that makes the next version better.
      </p>

      <div className="space-y-10">
        {formulaNames.map((formula, idx) => (
          <div key={formula.key} className="p-6 border border-stone-800">
            <h3 className="font-serif text-xl text-amber-100 mb-1">{formula.name}</h3>
            <p className="text-stone-600 text-xs mb-6">{formula.subtitle}</p>

            {[
              { field: 'overall', label: 'Overall Match' },
              { field: 'longevity', label: 'Longevity' },
              { field: 'howMe', label: 'How "Me" It Feels' },
            ].map(({ field, label }) => (
              <div key={field} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-400">{label}</span>
                  <span className="text-amber-200/60">
                    {ratings[formula.key][field as keyof typeof ratings.formula_01]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={ratings[formula.key][field as keyof typeof ratings.formula_01] as number}
                  onChange={e => updateRating(formula.key, field, parseInt(e.target.value))}
                  className="w-full accent-amber-200"
                />
              </div>
            ))}

            <textarea
              value={ratings[formula.key].notes}
              onChange={e => updateRating(formula.key, 'notes', e.target.value)}
              placeholder="Any notes about this formula..."
              rows={2}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 text-sm focus:outline-none focus:border-amber-200/40 resize-none"
            />

            <button
              onClick={() => setPreferredFormula(idx + 1)}
              className={`mt-3 px-4 py-2 text-xs tracking-wide uppercase border transition-colors ${
                preferredFormula === idx + 1
                  ? 'border-amber-200/40 bg-amber-200/10 text-amber-100'
                  : 'border-stone-700 text-stone-500 hover:border-stone-500'
              }`}
            >
              {preferredFormula === idx + 1 ? 'Selected as Favorite' : 'This Is My Favorite'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <label className="block text-stone-500 text-xs tracking-wide uppercase mb-2">
          What would make your ideal formula more &ldquo;you&rdquo;?
        </label>
        <textarea
          value={adjustmentRequest}
          onChange={e => setAdjustmentRequest(e.target.value)}
          rows={3}
          placeholder="e.g., More warmth in the drydown, less sweetness, something that lasts longer..."
          className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 text-sm focus:outline-none focus:border-amber-200/40 resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full mt-8 py-4 bg-amber-100 text-stone-950 font-medium tracking-wide uppercase text-sm hover:bg-amber-200 transition-colors"
      >
        Submit Feedback
      </button>
    </div>
  )
}

export default function ZoeFeedbackPage() {
  return (
    <div className="min-h-screen bg-stone-950">
      <ZoeNavbar />
      <Suspense fallback={<div className="pt-24 text-center text-stone-500">Loading...</div>}>
        <FeedbackForm />
      </Suspense>
    </div>
  )
}
