import { NextResponse } from 'next/server';

interface SimulationParams {
  agency_clients_mean: number;
  agency_clients_stddev: number;
  avg_rate_mean: number;
  avg_rate_stddev: number;
  churn_rate_mean: number;
  churn_rate_stddev: number;
  licensing_interested_mean: number;
  licensing_interested_stddev: number;
  licensing_close_rate_mean: number;
  licensing_close_rate_stddev: number;
  num_simulations: number;
}

function normalRandom(mean: number, stddev: number, min: number, max: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const value = mean + z * stddev;
  return Math.max(min, Math.min(max, value));
}

function runSimulation(params: SimulationParams) {
  const results: number[] = [];
  const agencyTotals: number[] = [];
  const licensingTotals: number[] = [];

  for (let i = 0; i < params.num_simulations; i++) {
    const clientsClosed = Math.round(normalRandom(params.agency_clients_mean, params.agency_clients_stddev, 3, 25));
    const avgRate = normalRandom(params.avg_rate_mean, params.avg_rate_stddev, 3000, 15000);
    const churnRate = normalRandom(params.churn_rate_mean, params.churn_rate_stddev, 0, 40) / 100;
    const licensingInterested = Math.round(normalRandom(params.licensing_interested_mean, params.licensing_interested_stddev, 10, 100));
    const licensingCloseRate = normalRandom(params.licensing_close_rate_mean, params.licensing_close_rate_stddev, 5, 60) / 100;

    // Phase 1
    const agencyPhase1 = clientsClosed * avgRate * 0.7;

    // Phase 2
    const clientsPhase2 = Math.round(clientsClosed * 1.8);
    const lostP2 = Math.floor(clientsClosed * churnRate);
    const activeP2 = clientsClosed + clientsPhase2 - lostP2;
    const agencyPhase2 = activeP2 * avgRate * 1.25;

    // Phase 3
    const clientsPhase3 = Math.round(activeP2 * 0.3);
    const lostP3 = Math.floor(activeP2 * churnRate);
    const activeP3 = activeP2 + clientsPhase3 - lostP3;
    const agencyPhase3 = activeP3 * avgRate * 1.0;

    const totalAgency = agencyPhase1 + agencyPhase2 + agencyPhase3;

    // Licensing event
    const operatorInterested = Math.round(licensingInterested * 0.4);
    const builderInterested = Math.round(licensingInterested * 0.35);
    const partnerInterested = Math.round(licensingInterested * 0.25);

    const operatorClosed = Math.round(operatorInterested * licensingCloseRate * 0.8);
    const builderClosed = Math.round(builderInterested * licensingCloseRate * 0.5);
    const partnerClosed = Math.round(partnerInterested * licensingCloseRate * 0.2);

    const totalLicensing = operatorClosed * 8500 + builderClosed * 22500 + partnerClosed * 45000;

    const total = totalAgency + totalLicensing;
    results.push(total);
    agencyTotals.push(totalAgency);
    licensingTotals.push(totalLicensing);
  }

  results.sort((a, b) => a - b);
  agencyTotals.sort((a, b) => a - b);
  licensingTotals.sort((a, b) => a - b);

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const p10 = results[Math.floor(results.length * 0.1)];
  const p25 = results[Math.floor(results.length * 0.25)];
  const p75 = results[Math.floor(results.length * 0.75)];
  const p90 = results[Math.floor(results.length * 0.9)];

  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const stdDev = Math.sqrt(variance);

  const probabilities = {
    above_500k: results.filter(r => r >= 500000).length / results.length,
    above_750k: results.filter(r => r >= 750000).length / results.length,
    above_1m: results.filter(r => r >= 1000000).length / results.length,
    above_1_25m: results.filter(r => r >= 1250000).length / results.length,
    above_1_5m: results.filter(r => r >= 1500000).length / results.length,
  };

  // Histogram buckets (50K each)
  const bucketSize = 50000;
  const histogram: { range: string; count: number; pct: number }[] = [];
  const minBucket = Math.floor(results[0] / bucketSize) * bucketSize;
  const maxBucket = Math.ceil(results[results.length - 1] / bucketSize) * bucketSize;

  for (let b = minBucket; b < maxBucket; b += bucketSize) {
    const count = results.filter(r => r >= b && r < b + bucketSize).length;
    histogram.push({
      range: `$${(b / 1000).toFixed(0)}K-$${((b + bucketSize) / 1000).toFixed(0)}K`,
      count,
      pct: count / results.length * 100,
    });
  }

  return {
    metrics: { mean, median, p10, p25, p75, p90, stdDev, min: results[0], max: results[results.length - 1] },
    probabilities,
    histogram,
    agencyMedian: agencyTotals[Math.floor(agencyTotals.length / 2)],
    licensingMedian: licensingTotals[Math.floor(licensingTotals.length / 2)],
  };
}

export async function POST(request: Request) {
  const body = await request.json();

  const params: SimulationParams = {
    agency_clients_mean: body.agency_clients_mean ?? 12,
    agency_clients_stddev: body.agency_clients_stddev ?? 4,
    avg_rate_mean: body.avg_rate_mean ?? 7000,
    avg_rate_stddev: body.avg_rate_stddev ?? 2000,
    churn_rate_mean: body.churn_rate_mean ?? 15,
    churn_rate_stddev: body.churn_rate_stddev ?? 8,
    licensing_interested_mean: body.licensing_interested_mean ?? 50,
    licensing_interested_stddev: body.licensing_interested_stddev ?? 15,
    licensing_close_rate_mean: body.licensing_close_rate_mean ?? 25,
    licensing_close_rate_stddev: body.licensing_close_rate_stddev ?? 10,
    num_simulations: Math.min(body.num_simulations ?? 10000, 50000),
  };

  const result = runSimulation(params);
  return NextResponse.json(result);
}
