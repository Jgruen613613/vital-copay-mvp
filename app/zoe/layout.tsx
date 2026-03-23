import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Zoe — The First Fragrance Made Entirely for You',
  description: 'Built from your memories, your music, your aesthetic identity. AI-personalized bespoke fragrance crafted by a real perfumer.',
}

export default function ZoeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-stone-950 text-stone-300 min-h-screen">
      {children}
    </div>
  )
}
