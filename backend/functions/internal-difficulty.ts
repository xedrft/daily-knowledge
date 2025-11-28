// Core difficulty calculation utilities
// Keep these pure and easily adjustable.

export type DifficultyEntry = {
  conceptId: string
  value: number // computed internal difficulty [0..1]
  user?: number // raw user rated difficulty [0..1]
  timestamp: string // ISO
}

// Clamp helper
const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x))

// Compute internal difficulty for a single concept exposure
// Inputs are normalized to [0..1]
export function computeInternalDifficulty(
  conceptDifficulty: number,
  userRatedDifficulty: number,
  options?: { alpha?: number }
): number {
  const a = options?.alpha ?? 0.6 // weight toward conceptDifficulty vs user rating
  const cd = clamp(conceptDifficulty)
  const ur = clamp(userRatedDifficulty)
  // Simple convex combination plus small nonlinearity for very hard concepts
  const base = a * cd + (1 - a) * ur
  const boost = cd > 0.8 ? (cd - 0.8) * 0.2 : 0
  return clamp(base + boost)
}

// Time-decay weighting function: newer entries weigh more
// halfLifeDays: weight halves every N days
export function timeDecayWeight(daysAgo: number, halfLifeDays = 21): number {
  const lambda = Math.log(2) / halfLifeDays
  return Math.exp(-lambda * daysAgo)
}

// Aggregate internal difficulties with time decay
export function aggregateInternal(
  history: DifficultyEntry[],
  now: Date = new Date(),
  options?: { halfLifeDays?: number }
): { mean: number; weightSum: number; count: number } {
  if (!history.length) return { mean: 0, weightSum: 0, count: 0 }
  const half = options?.halfLifeDays ?? 21
  let num = 0
  let den = 0
  for (const h of history) {
    const dt = new Date(h.timestamp)
    const days = Math.max(0, (now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24))
    const w = timeDecayWeight(days, half)
    num += h.value * w
    den += w
  }
  const mean = den > 0 ? num / den : 0
  return { mean, weightSum: den, count: history.length }
}

// Blend aggregated internal difficulty with user-set difficulty using confidence
// As history grows, trust internal more.
export function blendWithUserSet(
  aggregated: { mean: number; weightSum: number; count: number },
  userSetDifficulty: number,
  options?: { maxTrust?: number; minTrust?: number; scale?: number }
): number {
  const maxTrust = options?.maxTrust ?? 0.85 // cap how much internal can dominate
  const minTrust = options?.minTrust ?? 0.20 // floor to avoid flukes
  const scale = options?.scale ?? 0.12 // maps weightSum to trust increment

  const internalTrust = clamp(minTrust + aggregated.weightSum * scale, minTrust, maxTrust)
  const internal = clamp(aggregated.mean)
  const user = clamp(userSetDifficulty)
  return clamp(internalTrust * internal + (1 - internalTrust) * user)
}
