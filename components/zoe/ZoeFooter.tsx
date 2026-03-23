export default function ZoeFooter() {
  return (
    <footer className="py-12 bg-stone-950 border-t border-stone-800">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-serif text-xl tracking-wider text-amber-100">ZOE</span>
            <p className="text-stone-600 text-xs mt-1">The first fragrance made entirely for you.</p>
          </div>
          <div className="flex gap-8 text-stone-500 text-sm">
            <a href="/zoe#how-it-works" className="hover:text-amber-100 transition-colors">How It Works</a>
            <a href="/zoe/quiz" className="hover:text-amber-100 transition-colors">Take the Quiz</a>
            <a href="/zoe#about" className="hover:text-amber-100 transition-colors">About</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-stone-900 text-center">
          <p className="text-stone-700 text-xs">&copy; 2026 Zoe Fragrance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
