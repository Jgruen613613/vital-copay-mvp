'use client';

import { useState, useCallback, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Variable {
  key: string;
  label: string;
  mean: number;
  stddev: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

interface SimResults {
  outcomes: number[];
  mean: number;
  median: number;
  stddev: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  probabilities: { threshold: number; prob: number }[];
  histogram: { bucket: string; count: number; lower: number }[];
  agencyMedian: number;
  licensingMedian: number;
  elapsed: number;
}

interface SensitivityRow {
  label: string;
  baseProbM: number;
  lowProbM: number;
  highProbM: number;
}

// ---------------------------------------------------------------------------
// Variable definitions
// ---------------------------------------------------------------------------

const DEFAULT_VARS: Variable[] = [
  {
    key: 'clients_closed',
    label: 'Agency Clients Closed (Days 1-21)',
    mean: 12,
    stddev: 4,
    min: 3,
    max: 25,
    step: 1,
    format: (v) => `${Math.round(v)} clients`,
  },
  {
    key: 'avg_rate',
    label: 'Average Monthly Rate',
    mean: 7000,
    stddev: 2000,
    min: 3000,
    max: 15000,
    step: 250,
    format: (v) => `$${v.toLocaleString()}`,
  },
  {
    key: 'churn_rate',
    label: 'Client Churn Rate (monthly %)',
    mean: 15,
    stddev: 8,
    min: 0,
    max: 40,
    step: 1,
    format: (v) => `${v}%`,
  },
  {
    key: 'saas_users',
    label: 'SaaS Users (Day 90) — bundled',
    mean: 0,
    stddev: 0,
    min: 0,
    max: 0,
    step: 0,
    format: () => '0 (bundled)',
  },
  {
    key: 'licensing_prospects',
    label: 'Licensing Prospects Interested (of 200)',
    mean: 50,
    stddev: 15,
    min: 10,
    max: 100,
    step: 1,
    format: (v) => `${Math.round(v)} prospects`,
  },
  {
    key: 'licensing_close_rate',
    label: 'Licensing Close Rate (%)',
    mean: 25,
    stddev: 10,
    min: 5,
    max: 60,
    step: 1,
    format: (v) => `${v}%`,
  },
];

const PRESETS: { label: string; values: Record<string, Partial<Variable>> }[] = [
  {
    label: 'Conservative',
    values: {
      clients_closed: { mean: 8, stddev: 3 },
      avg_rate: { mean: 5500, stddev: 1500 },
      churn_rate: { mean: 22, stddev: 6 },
      licensing_prospects: { mean: 30, stddev: 10 },
      licensing_close_rate: { mean: 15, stddev: 8 },
    },
  },
  {
    label: 'Base Case',
    values: {},
  },
  {
    label: 'Optimistic',
    values: {
      clients_closed: { mean: 18, stddev: 4 },
      avg_rate: { mean: 9000, stddev: 2000 },
      churn_rate: { mean: 8, stddev: 4 },
      licensing_prospects: { mean: 70, stddev: 12 },
      licensing_close_rate: { mean: 35, stddev: 8 },
    },
  },
  {
    label: 'Agency Only',
    values: {
      licensing_prospects: { mean: 0, stddev: 0, min: 0, max: 0 },
      licensing_close_rate: { mean: 0, stddev: 0, min: 0, max: 0 },
    },
  },
  {
    label: 'Licensing Heavy',
    values: {
      clients_closed: { mean: 6, stddev: 3 },
      avg_rate: { mean: 5000, stddev: 1500 },
      licensing_prospects: { mean: 80, stddev: 12 },
      licensing_close_rate: { mean: 40, stddev: 10 },
    },
  },
];

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

function boxMuller(): [number, number] {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u1));
  const z0 = mag * Math.cos(2.0 * Math.PI * u2);
  const z1 = mag * Math.sin(2.0 * Math.PI * u2);
  return [z0, z1];
}

let _spare: number | null = null;

function sampleNormal(mean: number, stddev: number, min: number, max: number): number {
  if (stddev === 0) return mean;
  let val: number;
  // Retry truncation
  for (let i = 0; i < 100; i++) {
    let z: number;
    if (_spare !== null) {
      z = _spare;
      _spare = null;
    } else {
      const [z0, z1] = boxMuller();
      z = z0;
      _spare = z1;
    }
    val = mean + z * stddev;
    if (val >= min && val <= max) return val;
  }
  return Math.max(min, Math.min(max, mean));
}

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function fmt(n: number): string {
  if (n >= 1_000_000) {
    return '$' + (n / 1_000_000).toFixed(2) + 'M';
  }
  return '$' + Math.round(n).toLocaleString();
}

// ---------------------------------------------------------------------------
// Simulation engine
// ---------------------------------------------------------------------------

function runOnce(vars: Record<string, Variable>): { total: number; agency: number; licensing: number } {
  const v = (key: string) => {
    const def = vars[key];
    return sampleNormal(def.mean, def.stddev, def.min, def.max);
  };

  const clients_closed = Math.round(v('clients_closed'));
  const avg_rate = v('avg_rate');
  const churn_rate = v('churn_rate') / 100;
  const licensing_prospects = Math.round(v('licensing_prospects'));
  const licensing_close = v('licensing_close_rate') / 100;

  // Phase 1
  const agency_phase1 = clients_closed * avg_rate * 0.7;

  // Phase 2
  const clients_phase2 = Math.round(clients_closed * 1.8);
  const lost = Math.floor(clients_closed * churn_rate);
  const active_p2 = Math.max(0, clients_closed + clients_phase2 - lost);
  const agency_phase2 = active_p2 * avg_rate * 1.25;

  // Phase 3
  const clients_phase3 = Math.round(active_p2 * 0.3);
  const lost_p3 = Math.floor(active_p2 * churn_rate);
  const active_p3 = Math.max(0, active_p2 + clients_phase3 - lost_p3);
  const agency_phase3 = active_p3 * avg_rate * 1.0;

  const agency = agency_phase1 + agency_phase2 + agency_phase3;

  // Licensing
  const operator_count = Math.round(licensing_prospects * 0.4);
  const builder_count = Math.round(licensing_prospects * 0.35);
  const partner_count = Math.round(licensing_prospects * 0.25);

  const operator_closed = Math.round(operator_count * licensing_close * 0.8);
  const builder_closed = Math.round(builder_count * licensing_close * 0.5);
  const partner_closed = Math.round(partner_count * licensing_close * 0.2);

  const licensing = operator_closed * 8500 + builder_closed * 22500 + partner_closed * 45000;

  return { total: agency + licensing, agency, licensing };
}

function runSim(
  vars: Record<string, Variable>,
  n: number
): SimResults {
  const t0 = performance.now();
  const totals: number[] = [];
  const agencies: number[] = [];
  const licensings: number[] = [];

  _spare = null;
  for (let i = 0; i < n; i++) {
    const r = runOnce(vars);
    totals.push(r.total);
    agencies.push(r.agency);
    licensings.push(r.licensing);
  }

  totals.sort((a, b) => a - b);
  agencies.sort((a, b) => a - b);
  licensings.sort((a, b) => a - b);

  const mean = totals.reduce((s, v) => s + v, 0) / n;
  const median = percentile(totals, 50);
  const variance = totals.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stddev = Math.sqrt(variance);

  const thresholds = [500_000, 750_000, 1_000_000, 1_250_000, 1_500_000];
  const probabilities = thresholds.map((t) => ({
    threshold: t,
    prob: totals.filter((v) => v >= t).length / n,
  }));

  // Histogram in $50K buckets
  const bucketSize = 50_000;
  const minBucket = Math.floor(totals[0] / bucketSize) * bucketSize;
  const maxBucket = Math.ceil(totals[totals.length - 1] / bucketSize) * bucketSize;
  const buckets: { bucket: string; count: number; lower: number }[] = [];
  for (let b = minBucket; b < maxBucket; b += bucketSize) {
    const count = totals.filter((v) => v >= b && v < b + bucketSize).length;
    buckets.push({
      bucket: `${fmt(b)}`,
      count,
      lower: b,
    });
  }

  const elapsed = performance.now() - t0;

  return {
    outcomes: totals,
    mean,
    median,
    stddev,
    p10: percentile(totals, 10),
    p25: percentile(totals, 25),
    p75: percentile(totals, 75),
    p90: percentile(totals, 90),
    probabilities,
    histogram: buckets,
    agencyMedian: percentile(agencies, 50),
    licensingMedian: percentile(licensings, 50),
    elapsed,
  };
}

// ---------------------------------------------------------------------------
// Sensitivity
// ---------------------------------------------------------------------------

function computeSensitivity(vars: Record<string, Variable>): SensitivityRow[] {
  const n = 3000;
  const baseProbM =
    runSim(vars, n).probabilities.find((p) => p.threshold === 1_000_000)?.prob ?? 0;

  const keys = ['clients_closed', 'avg_rate', 'churn_rate', 'licensing_prospects', 'licensing_close_rate'];
  return keys.map((key) => {
    const def = vars[key];
    if (def.stddev === 0) {
      return { label: def.label, baseProbM, lowProbM: baseProbM, highProbM: baseProbM };
    }

    const lowVars = { ...vars, [key]: { ...def, mean: Math.max(def.min, def.mean - def.stddev) } };
    const highVars = { ...vars, [key]: { ...def, mean: Math.min(def.max, def.mean + def.stddev) } };

    const lowProbM =
      runSim(lowVars, n).probabilities.find((p) => p.threshold === 1_000_000)?.prob ?? 0;
    const highProbM =
      runSim(highVars, n).probabilities.find((p) => p.threshold === 1_000_000)?.prob ?? 0;

    return { label: def.label, baseProbM, lowProbM, highProbM };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MonteCarloPage() {
  const [vars, setVars] = useState<Record<string, Variable>>(() => {
    const map: Record<string, Variable> = {};
    DEFAULT_VARS.forEach((v) => (map[v.key] = { ...v }));
    return map;
  });

  const [results, setResults] = useState<SimResults | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityRow[] | null>(null);
  const [running, setRunning] = useState(false);
  const [simCount] = useState(10_000);
  const tickRef = useRef(0);

  const updateVar = useCallback(
    (key: string, field: 'mean' | 'stddev', value: number) => {
      setVars((prev) => ({
        ...prev,
        [key]: { ...prev[key], [field]: value },
      }));
    },
    []
  );

  const resetVar = useCallback((key: string) => {
    const orig = DEFAULT_VARS.find((v) => v.key === key);
    if (orig) setVars((prev) => ({ ...prev, [key]: { ...orig } }));
  }, []);

  const resetAll = useCallback(() => {
    const map: Record<string, Variable> = {};
    DEFAULT_VARS.forEach((v) => (map[v.key] = { ...v }));
    setVars(map);
    setResults(null);
    setSensitivity(null);
  }, []);

  const applyPreset = useCallback((idx: number) => {
    const preset = PRESETS[idx];
    const map: Record<string, Variable> = {};
    DEFAULT_VARS.forEach((v) => {
      const overrides = preset.values[v.key];
      map[v.key] = overrides ? { ...v, ...overrides } : { ...v };
    });
    setVars(map);
    setResults(null);
    setSensitivity(null);
  }, []);

  const runSimulation = useCallback(() => {
    setRunning(true);
    tickRef.current++;
    const tick = tickRef.current;

    // Use setTimeout to let UI update before blocking computation
    setTimeout(() => {
      if (tick !== tickRef.current) return;
      const r = runSim(vars, simCount);
      const s = computeSensitivity(vars);
      setResults(r);
      setSensitivity(s);
      setRunning(false);
    }, 50);
  }, [vars, simCount]);

  const maxHistCount = results ? Math.max(...results.histogram.map((b) => b.count)) : 1;

  const histColor = (lower: number): string => {
    if (lower < 500_000) return 'from-red-600 to-red-400';
    if (lower < 750_000) return 'from-amber-600 to-amber-400';
    if (lower < 1_000_000) return 'from-green-600 to-green-400';
    return 'from-blue-600 to-blue-400';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-lg font-semibold tracking-tight">Monte Carlo Simulation</h1>
            <span className="text-xs text-gray-500 font-mono">90-DAY EXECUTION MODEL</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{simCount.toLocaleString()} iterations</span>
            {results && <span>{results.elapsed.toFixed(0)}ms</span>}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:border-gray-600 transition-colors"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={resetAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 bg-gray-900 hover:bg-red-900/40 hover:border-red-700 transition-colors text-gray-400 hover:text-red-400"
          >
            Reset All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---- LEFT: Input Controls ---- */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            {DEFAULT_VARS.map((def) => {
              const v = vars[def.key];
              const isDisabled = def.key === 'saas_users';
              return (
                <div
                  key={def.key}
                  className={`bg-gray-900 rounded-xl border border-gray-800 p-4 ${isDisabled ? 'opacity-40' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <label className="text-xs font-medium text-gray-300 leading-tight pr-2">
                      {v.label}
                    </label>
                    {!isDisabled && (
                      <button
                        onClick={() => resetVar(def.key)}
                        className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors shrink-0"
                        title="Reset to default"
                      >
                        RST
                      </button>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2 font-mono">
                    {v.format(v.mean)}
                  </div>
                  {!isDisabled && (
                    <>
                      <input
                        type="range"
                        min={v.min}
                        max={v.max}
                        step={v.step}
                        value={v.mean}
                        onChange={(e) => updateVar(def.key, 'mean', parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:shadow-lg"
                      />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                        <span>{v.format(v.min)}</span>
                        <span className="text-gray-500">
                          &sigma;={def.key === 'avg_rate' ? `$${v.stddev.toLocaleString()}` : v.stddev}
                        </span>
                        <span>{v.format(v.max)}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            <button
              onClick={runSimulation}
              disabled={running}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 transition-all active:scale-[0.98]"
            >
              {running ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Simulating...
                </span>
              ) : (
                `Run ${simCount.toLocaleString()} Simulations`
              )}
            </button>
          </div>

          {/* ---- RIGHT: Results ---- */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {!results && !running && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4 opacity-20">&#x1D4DC;</div>
                <p className="text-gray-400 text-sm mb-1">Configure variables and run the simulation</p>
                <p className="text-gray-600 text-xs">
                  10,000 iterations of the 90-day execution model
                </p>
              </div>
            )}

            {running && !results && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-16 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-sm">Running {simCount.toLocaleString()} iterations...</p>
              </div>
            )}

            {results && (
              <>
                {/* Key Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: 'Mean', value: fmt(results.mean) },
                    { label: 'Median', value: fmt(results.median) },
                    { label: 'P10', value: fmt(results.p10) },
                    { label: 'P25', value: fmt(results.p25) },
                    { label: 'P75', value: fmt(results.p75) },
                    { label: 'P90', value: fmt(results.p90) },
                    { label: 'Std Dev', value: fmt(results.stddev) },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-gray-900 rounded-xl border border-gray-800 p-3 text-center"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                        {m.label}
                      </div>
                      <div className="text-sm font-semibold font-mono">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Probability Table */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                    Probability of Hitting Revenue Targets
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {results.probabilities.map((p) => {
                      const pct = (p.prob * 100).toFixed(1);
                      const color =
                        p.prob >= 0.7
                          ? 'text-green-400'
                          : p.prob >= 0.4
                            ? 'text-amber-400'
                            : 'text-red-400';
                      return (
                        <div key={p.threshold} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            P({fmt(p.threshold)}+)
                          </div>
                          <div className={`text-xl font-bold font-mono ${color}`}>{pct}%</div>
                          <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                p.prob >= 0.7
                                  ? 'bg-green-500'
                                  : p.prob >= 0.4
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(2, p.prob * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Histogram */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                  <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                    Outcome Distribution ($50K buckets)
                  </h3>
                  <div className="relative">
                    {/* $1M target line */}
                    {(() => {
                      const minB = results.histogram[0]?.lower ?? 0;
                      const maxB =
                        (results.histogram[results.histogram.length - 1]?.lower ?? 0) + 50_000;
                      const range = maxB - minB;
                      const pos = range > 0 ? ((1_000_000 - minB) / range) * 100 : 0;
                      if (pos < 0 || pos > 100) return null;
                      return (
                        <div
                          className="absolute top-0 bottom-6 w-px bg-blue-500 z-10 pointer-events-none"
                          style={{ left: `${pos}%` }}
                        >
                          <div className="absolute -top-0 left-1 text-[9px] text-blue-400 font-mono whitespace-nowrap">
                            $1M TARGET
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-end gap-[1px] h-48 sm:h-64">
                      {results.histogram.map((b, i) => {
                        const pct = maxHistCount > 0 ? (b.count / maxHistCount) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 flex flex-col justify-end group relative"
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-[9px] text-gray-300 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 font-mono">
                              {b.bucket}: {b.count}
                            </div>
                            <div
                              className={`w-full rounded-t-sm bg-gradient-to-t ${histColor(b.lower)} transition-all hover:opacity-80`}
                              style={{ height: `${Math.max(1, pct)}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-600 mt-2 font-mono">
                      <span>{results.histogram[0]?.bucket}</span>
                      <span className="flex gap-4">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-red-500" />&lt;$500K
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-amber-500" />$500K-$750K
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-green-500" />$750K-$1M
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm bg-blue-500" />&gt;$1M
                        </span>
                      </span>
                      <span>{results.histogram[results.histogram.length - 1]?.bucket}</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Breakdown + Sensitivity side by side */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Revenue Breakdown */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                      Revenue Breakdown (at Median)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300">Agency Revenue</span>
                          <span className="font-mono font-semibold text-green-400">
                            {fmt(results.agencyMedian)}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full"
                            style={{
                              width: `${
                                (results.agencyMedian /
                                  (results.agencyMedian + results.licensingMedian || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-gray-300">Licensing Revenue</span>
                          <span className="font-mono font-semibold text-blue-400">
                            {fmt(results.licensingMedian)}
                          </span>
                        </div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                            style={{
                              width: `${
                                (results.licensingMedian /
                                  (results.agencyMedian + results.licensingMedian || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-800 flex justify-between text-sm">
                        <span className="text-gray-300 font-medium">Total (Median)</span>
                        <span className="font-mono font-bold text-white">
                          {fmt(results.agencyMedian + results.licensingMedian)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1 bg-gray-800/50 rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Agency Share</div>
                          <div className="text-sm font-mono font-semibold text-green-400">
                            {(
                              (results.agencyMedian /
                                (results.agencyMedian + results.licensingMedian || 1)) *
                              100
                            ).toFixed(0)}
                            %
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-800/50 rounded-lg p-2.5 text-center">
                          <div className="text-[10px] text-gray-500 uppercase">Licensing Share</div>
                          <div className="text-sm font-mono font-semibold text-blue-400">
                            {(
                              (results.licensingMedian /
                                (results.agencyMedian + results.licensingMedian || 1)) *
                              100
                            ).toFixed(0)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sensitivity Analysis */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4">
                      Sensitivity Analysis &mdash; P($1M+) Impact
                    </h3>
                    {sensitivity ? (
                      <div className="space-y-3.5">
                        {sensitivity.map((row) => {
                          const center = 50;
                          const scale = 100;
                          const lowX = row.lowProbM * scale;
                          const highX = row.highProbM * scale;
                          const baseX = row.baseProbM * scale;
                          const barLeft = Math.min(lowX, highX);
                          const barRight = Math.max(lowX, highX);
                          const barWidth = barRight - barLeft;

                          return (
                            <div key={row.label}>
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="text-gray-400 truncate pr-2">{row.label}</span>
                                <span className="text-gray-500 font-mono shrink-0">
                                  {(row.lowProbM * 100).toFixed(0)}% &mdash;{' '}
                                  {(row.highProbM * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="relative h-5 bg-gray-800 rounded-full overflow-hidden">
                                {/* Range bar */}
                                <div
                                  className="absolute top-0.5 bottom-0.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500 opacity-70"
                                  style={{
                                    left: `${barLeft}%`,
                                    width: `${Math.max(1, barWidth)}%`,
                                  }}
                                />
                                {/* Base marker */}
                                <div
                                  className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                                  style={{ left: `${baseX}%` }}
                                />
                                {/* Center 50% line */}
                                <div
                                  className="absolute top-0 bottom-0 w-px bg-gray-600 opacity-50"
                                  style={{ left: `${center}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <div className="flex justify-between text-[9px] text-gray-600 mt-1 font-mono">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">Run simulation to see results</div>
                    )}
                  </div>
                </div>

                {/* Footer stats */}
                <div className="text-center text-[10px] text-gray-600 font-mono py-2">
                  {simCount.toLocaleString()} iterations completed in {results.elapsed.toFixed(0)}ms
                  &middot; Box-Muller transform &middot; Truncated normal distributions
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
