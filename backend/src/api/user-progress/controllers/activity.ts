import { factories } from '@strapi/strapi'

function toDateKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseDateKey(s?: string): string {
  if (!s) return toDateKey(new Date())
  // Basic YYYY-MM-DD validation
  const m = /^\d{4}-\d{2}-\d{2}$/.test(s)
  return m ? s : toDateKey(new Date())
}

function computeStreakFromMap(map: Map<string, number>, upToDateKey: string): number {
  let streak = 0
  let cursor = new Date(upToDateKey + 'T00:00:00.000Z')
  while (true) {
    const key = toDateKey(cursor)
    const c = map.get(key) || 0
    if (c > 0) {
      streak += 1
      cursor.setUTCDate(cursor.getUTCDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
  async record(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized('No token found or invalid token')

    const body = ctx.request.body || {}
    const dateKey = parseDateKey(body.date)

    const progress = await (strapi as any).documents('api::user-progress.user-progress').findFirst({
      filters: { user_id: { id: user.id } },
    })
    if (!progress) return ctx.badRequest('User progress not found. Please select a field first.')

    const daily = (progress as any).dailyActivity || {}
    const todayCount = (daily[dateKey] || 0) + 1
    daily[dateKey] = todayCount

    await (strapi as any).documents('api::user-progress.user-progress').update({
      documentId: progress.documentId,
      data: { dailyActivity: daily },
      status: 'published'
    })

    const map = new Map<string, number>(Object.entries(daily as Record<string, number>))
    const firstOfDay = todayCount === 1
    const streak = computeStreakFromMap(map, dateKey)

    ctx.response.body = { date: dateKey, todayCount, firstOfDay, streak }
  },

  async getRange(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized('No token found or invalid token')

    const { from, to } = ctx.request.query as any
    const fromKey = parseDateKey(from)
    const toKey = parseDateKey(to)

    const progress = await (strapi as any).documents('api::user-progress.user-progress').findFirst({
      filters: { user_id: { id: user.id } },
    })
    const daily: Record<string, number> = (progress && (progress as any).dailyActivity) || {}

    // Build response for range
    const res: Array<{ date: string; count: number }> = []
    const start = new Date(fromKey + 'T00:00:00.000Z')
    const end = new Date(toKey + 'T00:00:00.000Z')
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = toDateKey(d)
      res.push({ date: key, count: daily[key] || 0 })
    }

    ctx.response.body = { activities: res }
  },

  async getStreak(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized('No token found or invalid token')
    const { date } = ctx.request.query as any
    const dateKey = parseDateKey(date)

    const progress = await (strapi as any).documents('api::user-progress.user-progress').findFirst({
      filters: { user_id: { id: user.id } },
    })
    const daily: Record<string, number> = (progress && (progress as any).dailyActivity) || {}
    const map = new Map<string, number>(Object.entries(daily))
    const streak = computeStreakFromMap(map, dateKey)
    ctx.response.body = { streak, date: dateKey }
  }
}))
