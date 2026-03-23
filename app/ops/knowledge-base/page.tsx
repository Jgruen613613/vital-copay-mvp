'use client';

import { useState, useMemo } from 'react';
import { getKnowledgeBase, type KnowledgeBaseEntry } from '@/lib/ops-mock-data';

const verticalColors: Record<string, string> = {
  healthcare_it: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rheumatology: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  wound_care: 'bg-red-500/20 text-red-400 border-red-500/30',
  specialty_pharma: 'bg-green-500/20 text-green-400 border-green-500/30',
  digital_health: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const categoryIcons: Record<string, string> = {
  funding: '💰',
  product_launch: '🚀',
  regulation: '⚖️',
  competitor_intel: '🔍',
  clinical_research: '🧬',
  market_trend: '📈',
  vendor_analysis: '🏢',
  patient_insight: '🩺',
};

const verticals = ['all', 'healthcare_it', 'rheumatology', 'wound_care', 'specialty_pharma', 'digital_health'];
const categories = ['all', 'funding', 'product_launch', 'regulation', 'competitor_intel', 'clinical_research', 'market_trend', 'vendor_analysis', 'patient_insight'];

export default function KnowledgeBasePage() {
  const entries = useMemo(() => getKnowledgeBase(), []);
  const [verticalFilter, setVerticalFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = useMemo(() => {
    let result = entries;
    if (verticalFilter !== 'all') result = result.filter(e => e.vertical === verticalFilter);
    if (categoryFilter !== 'all') result = result.filter(e => e.category === categoryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    return result.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [entries, verticalFilter, categoryFilter, searchQuery]);

  const stats = useMemo(() => {
    const byVertical: Record<string, number> = {};
    let unverified = 0;
    entries.forEach(e => {
      byVertical[e.vertical] = (byVertical[e.vertical] || 0) + 1;
      if (!e.verified) unverified++;
    });
    return { total: entries.length, byVertical, unverified };
  }, [entries]);

  const handleRunUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-gray-400 mt-1">Proprietary vertical intelligence — Healthcare IT, Rheumatology, Wound Care</p>
        </div>
        <button
          onClick={handleRunUpdate}
          disabled={isUpdating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isUpdating ? '⟳ Updating...' : '⟳ Run Knowledge Update'}
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-400">Total Entries</div>
        </div>
        {Object.entries(stats.byVertical).map(([v, count]) => (
          <div key={v} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-2xl font-bold text-white">{count}</div>
            <div className="text-xs text-gray-400">{v.replace(/_/g, ' ')}</div>
          </div>
        ))}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <div className="text-2xl font-bold text-yellow-400">{stats.unverified}</div>
          <div className="text-xs text-gray-400">Unverified</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Vertical:</span>
          {verticals.map(v => (
            <button
              key={v}
              onClick={() => setVerticalFilter(v)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                verticalFilter === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {v === 'all' ? 'All' : v.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Category:</span>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {c === 'all' ? 'All' : `${categoryIcons[c] || ''} ${c.replace(/_/g, ' ')}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400">
        Showing {filtered.length} of {entries.length} entries
      </div>

      {/* Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(entry => (
          <div
            key={entry.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-700 transition-colors"
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-white font-medium text-sm leading-tight">{entry.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                {entry.verified && (
                  <span className="text-green-400 text-xs" title="Verified">✓</span>
                )}
                <span className="text-xs text-gray-500">{entry.relevanceScore}/10</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs border ${verticalColors[entry.vertical] || 'bg-gray-700 text-gray-300'}`}>
                {entry.vertical.replace(/_/g, ' ')}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400">
                {categoryIcons[entry.category] || ''} {entry.category.replace(/_/g, ' ')}
              </span>
            </div>

            <p className="text-gray-400 text-xs leading-relaxed mb-2">
              {expandedId === entry.id ? entry.summary : entry.summary.slice(0, 150) + (entry.summary.length > 150 ? '...' : '')}
            </p>

            {expandedId === entry.id && entry.fullContent && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{entry.fullContent}</p>
                {entry.sourceUrl && (
                  <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs hover:underline mt-2 block">
                    Source →
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap gap-1">
                {entry.tags.slice(0, 3).map((tag: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 rounded text-[10px] bg-gray-800 text-gray-500">
                    {tag}
                  </span>
                ))}
                {entry.tags.length > 3 && (
                  <span className="text-[10px] text-gray-600">+{entry.tags.length - 3}</span>
                )}
              </div>
              <span className="text-[10px] text-gray-600">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No entries match your filters.
        </div>
      )}
    </div>
  );
}
