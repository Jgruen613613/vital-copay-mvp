'use client'
import { useState, useEffect, useCallback } from 'react'

interface Submission {
  id: number
  name: string
  email: string
  fragrance_name: string | null
  brief_status: string
  generated_brief: string | null
  perfumer_notes: string | null
  created_at: string
  answers: Record<string, unknown>
}

const statusColors: Record<string, string> = {
  pending: 'bg-stone-700 text-stone-300',
  generating: 'bg-blue-900 text-blue-200',
  ready: 'bg-amber-900 text-amber-200',
  assigned: 'bg-purple-900 text-purple-200',
  formula_ready: 'bg-green-900 text-green-200',
  shipped: 'bg-emerald-900 text-emerald-200',
}

const validStatuses = ['pending', 'generating', 'ready', 'assigned', 'formula_ready', 'shipped']

export default function ZoeAdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/zoe/api/quiz')
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data)
      }
    } catch {
      // silent fail
    }
  }, [])

  useEffect(() => {
    if (authenticated) fetchSubmissions()
  }, [authenticated, fetchSubmissions])

  async function updateStatus(id: number, status: string, notes?: string) {
    try {
      await fetch('/zoe/api/quiz', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, brief_status: status, perfumer_notes: notes }),
      })
      fetchSubmissions()
    } catch {
      // silent fail
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <h1 className="font-serif text-2xl text-amber-50 text-center mb-6">Perfumer Dashboard</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && password === 'zoe2026') setAuthenticated(true)
            }}
            placeholder="Password"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-700 text-amber-50 placeholder:text-stone-600 focus:outline-none focus:border-amber-200/40 mb-4"
          />
          <button
            onClick={() => { if (password === 'zoe2026') setAuthenticated(true) }}
            className="w-full py-3 bg-amber-100 text-stone-950 font-medium text-sm tracking-wide uppercase"
          >
            Enter
          </button>
        </div>
      </div>
    )
  }

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.brief_status === filter)

  return (
    <div className="min-h-screen bg-stone-950 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-2xl text-amber-50">Perfumer Dashboard</h1>
          <div className="flex gap-2">
            {['all', ...validStatuses].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1 text-xs tracking-wide uppercase border transition-colors ${
                  filter === s
                    ? 'border-amber-200/40 text-amber-100'
                    : 'border-stone-700 text-stone-500 hover:border-stone-500'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-stone-600 text-center py-12">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(sub => (
              <div key={sub.id} className="border border-stone-800">
                <button
                  onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-stone-600 text-sm">#{sub.id}</span>
                    <span className="text-amber-50">{sub.name}</span>
                    <span className="text-stone-600 text-sm">{sub.fragrance_name || '(unnamed)'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${statusColors[sub.brief_status] || 'bg-stone-700 text-stone-300'}`}>
                      {sub.brief_status.replace('_', ' ')}
                    </span>
                    <span className="text-stone-600 text-xs">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>

                {expandedId === sub.id && (
                  <div className="p-6 border-t border-stone-800 space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-stone-500">Email:</span>
                        <span className="text-amber-50 ml-2">{sub.email}</span>
                      </div>
                      <div>
                        <span className="text-stone-500">Created:</span>
                        <span className="text-amber-50 ml-2">{new Date(sub.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {sub.generated_brief && (
                      <div>
                        <h4 className="text-stone-500 text-xs uppercase tracking-wide mb-2">Generated Brief</h4>
                        <pre className="whitespace-pre-wrap text-stone-400 text-sm bg-stone-900 p-4 border border-stone-800 font-sans">
                          {sub.generated_brief}
                        </pre>
                      </div>
                    )}

                    <div>
                      <h4 className="text-stone-500 text-xs uppercase tracking-wide mb-2">Update Status</h4>
                      <div className="flex gap-2 flex-wrap">
                        {validStatuses.map(s => (
                          <button
                            key={s}
                            onClick={() => updateStatus(sub.id, s)}
                            className={`px-3 py-1 text-xs border transition-colors ${
                              sub.brief_status === s
                                ? 'border-amber-200/40 bg-amber-200/10 text-amber-100'
                                : 'border-stone-700 text-stone-500 hover:border-stone-500'
                            }`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-stone-500 text-xs uppercase tracking-wide mb-2">Perfumer Notes</h4>
                      <textarea
                        defaultValue={sub.perfumer_notes || ''}
                        onBlur={e => updateStatus(sub.id, sub.brief_status, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-700 text-amber-50 text-sm focus:outline-none focus:border-amber-200/40 resize-none"
                        placeholder="Notes about the formula, adjustments, ingredient choices..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
