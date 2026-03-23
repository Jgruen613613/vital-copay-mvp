'use client'
import { useState } from 'react'
import { quizQuestions, quizBlocks } from '@/lib/zoe-quiz-data'
import ZoeNavbar from '@/components/zoe/ZoeNavbar'

export default function ZoeQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string | string[] | number>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [fragranceName, setFragranceName] = useState('')
  const [moodBoardNotes, setMoodBoardNotes] = useState<string[]>(['', '', '', '', '', '', '', '', ''])
  const [showMoodBoard, setShowMoodBoard] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [brief, setBrief] = useState<string | null>(null)
  const [error, setError] = useState('')

  const question = quizQuestions[currentQuestion]
  const totalQuestions = quizQuestions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100
  const currentBlock = quizBlocks.find(b => b.number === question?.blockNumber)

  // Show mood board after question 18
  const shouldShowMoodBoard = currentQuestion === 18 && !showMoodBoard

  function setAnswer(value: string | string[] | number) {
    setAnswers(prev => ({ ...prev, [question.id]: value }))
  }

  function toggleMultiSelect(option: string) {
    const current = (answers[question.id] as string[]) || []
    if (current.includes(option)) {
      setAnswer(current.filter(o => o !== option))
    } else {
      setAnswer([...current, option])
    }
  }

  function goNext() {
    if (shouldShowMoodBoard) {
      setShowMoodBoard(true)
      return
    }
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  function goBack() {
    if (showMoodBoard) {
      setShowMoodBoard(false)
      return
    }
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      setError('Please enter your name and a valid email.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Submit quiz
      const res = await fetch('/zoe/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          fragrance_name: fragranceName || answers[27] || null,
          answers,
          mood_board_notes: moodBoardNotes.filter(n => n.trim()),
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')
      const data = await res.json()

      // Generate brief
      const briefRes = await fetch('/zoe/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_id: data.id, answers, mood_board_notes: moodBoardNotes.filter(n => n.trim()) }),
      })

      if (briefRes.ok) {
        const briefData = await briefRes.json()
        setBrief(briefData.brief)
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Final submission screen
  if (currentQuestion >= totalQuestions - 1 && answers[28]) {
    if (submitted) {
      return (
        <div className="min-h-screen bg-stone-950">
          <ZoeNavbar />
          <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase mb-4">Your Brief Is Ready</p>
              <h1 className="font-serif text-4xl text-amber-50 mb-4">
                {fragranceName || answers[27] || 'Your Fragrance'}
              </h1>
              <p className="text-stone-400">
                Your perfumer&apos;s creative brief has been generated. Here&apos;s what they&apos;ll work from:
              </p>
            </div>

            {brief && (
              <div className="p-8 border border-stone-800 bg-stone-900/50 mb-8">
                <h3 className="font-serif text-lg text-amber-100 mb-4">Creative Brief</h3>
                <pre className="whitespace-pre-wrap text-stone-400 text-sm leading-relaxed font-sans">
                  {brief}
                </pre>
              </div>
            )}

            <div className="p-6 border border-amber-200/20 text-center">
              <p className="text-amber-100 font-serif text-lg mb-2">What happens next</p>
              <p className="text-stone-400 text-sm">
                Your brief has been sent to our perfumer. You&apos;ll receive three 2ml sample vials
                within 2–3 weeks. Wear each one for a full day before rating it.
              </p>
            </div>
          </div>
        </div>
      )
    }

    // Contact info collection
    return (
      <div className="min-h-screen bg-stone-950">
        <ZoeNavbar />
        <div className="pt-24 pb-16 px-6 max-w-lg mx-auto">
          <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase text-center mb-4">
            Almost There
          </p>
          <h2 className="font-serif text-3xl text-amber-50 text-center mb-8">
            Where should we send your samples?
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-stone-500 text-xs tracking-wide uppercase mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40"
                placeholder="First name is fine"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-xs tracking-wide uppercase mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-stone-500 text-xs tracking-wide uppercase mb-2">
                Fragrance Name (optional)
              </label>
              <input
                type="text"
                value={fragranceName}
                onChange={e => setFragranceName(e.target.value)}
                className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40"
                placeholder="What will you call this scent?"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 bg-amber-100 text-stone-950 font-medium tracking-wide uppercase text-sm hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating your brief...' : 'Generate My Fragrance Brief'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mood board interstitial
  if (showMoodBoard) {
    return (
      <div className="min-h-screen bg-stone-950">
        <ZoeNavbar />
        <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
          <p className="text-amber-200/60 text-xs tracking-[0.3em] uppercase text-center mb-4">
            Optional
          </p>
          <h2 className="font-serif text-3xl text-amber-50 text-center mb-3">
            Your Scent Canvas
          </h2>
          <p className="text-stone-400 text-center mb-10 text-sm">
            Describe up to 9 images, places, or memories that capture the world your fragrance should inhabit.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-10">
            {moodBoardNotes.map((note, i) => (
              <div key={i} className="aspect-square border border-stone-800 hover:border-amber-200/20 transition-colors">
                <textarea
                  value={note}
                  onChange={e => {
                    const updated = [...moodBoardNotes]
                    updated[i] = e.target.value
                    setMoodBoardNotes(updated)
                  }}
                  className="w-full h-full p-3 bg-transparent text-amber-50 text-xs placeholder:text-stone-700 resize-none focus:outline-none"
                  placeholder={`Tile ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={goBack}
              className="flex-1 py-3 border border-stone-700 text-stone-400 text-sm tracking-wide uppercase hover:border-stone-500 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                setShowMoodBoard(false)
                setCurrentQuestion(18)
              }}
              className="flex-1 py-3 bg-amber-100 text-stone-950 font-medium text-sm tracking-wide uppercase hover:bg-amber-200 transition-colors"
            >
              {moodBoardNotes.some(n => n.trim()) ? 'Continue' : 'Skip'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main quiz flow
  return (
    <div className="min-h-screen bg-stone-950">
      <ZoeNavbar />

      {/* Progress bar */}
      <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-stone-900">
        <div
          className="h-full bg-amber-200/60 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pt-28 pb-16 px-6 max-w-lg mx-auto">
        {/* Block indicator */}
        <div className="mb-10">
          <p className="text-amber-200/40 text-xs tracking-[0.2em] uppercase mb-1">
            {currentBlock?.name}
          </p>
          <p className="text-stone-600 text-xs">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>
        </div>

        {/* Question */}
        <h2 className="font-serif text-2xl text-amber-50 mb-8 leading-relaxed">
          {question.question}
        </h2>

        {/* Answer input */}
        <div className="mb-10">
          {question.type === 'textarea' && (
            <textarea
              value={(answers[question.id] as string) || ''}
              onChange={e => setAnswer(e.target.value)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40 resize-none"
            />
          )}

          {question.type === 'text' && (
            <input
              type="text"
              value={(answers[question.id] as string) || ''}
              onChange={e => setAnswer(e.target.value)}
              placeholder={question.placeholder}
              className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40"
            />
          )}

          {question.type === 'select' && question.options && (
            <div className="space-y-2">
              {question.options.map(option => (
                <button
                  key={option}
                  onClick={() => setAnswer(option)}
                  className={`w-full text-left px-4 py-3 border transition-colors ${
                    answers[question.id] === option
                      ? 'border-amber-200/40 bg-amber-200/5 text-amber-100'
                      : 'border-stone-700 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'multiselect' && question.options && (
            <div className="flex flex-wrap gap-2">
              {question.options.map(option => {
                const selected = ((answers[question.id] as string[]) || []).includes(option)
                return (
                  <button
                    key={option}
                    onClick={() => toggleMultiSelect(option)}
                    className={`px-4 py-2 border text-sm transition-colors ${
                      selected
                        ? 'border-amber-200/40 bg-amber-200/5 text-amber-100'
                        : 'border-stone-700 text-stone-400 hover:border-stone-500'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          )}

          {question.type === 'slider' && (
            <div>
              <input
                type="range"
                min={question.min}
                max={question.max}
                value={(answers[question.id] as number) || 5}
                onChange={e => setAnswer(parseInt(e.target.value))}
                className="w-full accent-amber-200"
              />
              <div className="flex justify-between text-stone-600 text-xs mt-2">
                <span>{question.minLabel}</span>
                <span className="text-amber-200/60 text-sm">{(answers[question.id] as number) || 5}</span>
                <span>{question.maxLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentQuestion > 0 && (
            <button
              onClick={goBack}
              className="flex-1 py-3 border border-stone-700 text-stone-400 text-sm tracking-wide uppercase hover:border-stone-500 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={goNext}
            className="flex-1 py-3 bg-amber-100 text-stone-950 font-medium text-sm tracking-wide uppercase hover:bg-amber-200 transition-colors"
          >
            {currentQuestion === totalQuestions - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
