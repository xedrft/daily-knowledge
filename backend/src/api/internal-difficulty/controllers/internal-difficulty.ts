import { computeInternalDifficulty, aggregateInternal, blendWithUserSet, DifficultyEntry } from '../../../../functions/internal-difficulty'

export default {
  async record(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized()
    const { conceptId, conceptDifficulty, userRatedDifficulty } = ctx.request.body || {}
    if (!conceptId || typeof conceptDifficulty !== 'number' || typeof userRatedDifficulty !== 'number') {
      ctx.badRequest('Missing fields')
      return
    }

    const internal = computeInternalDifficulty(conceptDifficulty, userRatedDifficulty)
    const entry: DifficultyEntry = { conceptId, value: internal, user: userRatedDifficulty, timestamp: new Date().toISOString() }

    // Find user's progress record
    const progressRecords = await strapi.entityService.findMany('api::user-progress.user-progress', {
      filters: { user_id: user.id },
      limit: 1
    })
    if (!progressRecords || progressRecords.length === 0) {
      ctx.notFound('User progress not found')
      return
    }
    const progress = progressRecords[0]
    const history: DifficultyEntry[] = (progress as any).internalDifficulties || []
    const idx = history.findIndex(h => h.conceptId === conceptId)
    if (idx >= 0) {
      // Overwrite existing rating (allow redo without duplicating)
      history[idx] = entry
    } else {
      history.push(entry)
    }

    await strapi.entityService.update('api::user-progress.user-progress', progress.id, {
      data: { internalDifficulties: history }
    })

    ctx.body = { ok: true, internal: entry.value, updated: idx >= 0 }
  },

  async aggregate(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized()
    
    // Find user's progress record
    const progressRecords = await strapi.entityService.findMany('api::user-progress.user-progress', {
      filters: { user_id: user.id },
      limit: 1
    })
    if (!progressRecords || progressRecords.length === 0) {
      ctx.notFound('User progress not found')
      return
    }
    const progress = progressRecords[0] as any
    const userSetDifficulty = typeof progress.current_level === 'number' ? progress.current_level / 15 : 0.5
    const history: DifficultyEntry[] = progress.internalDifficulties || []
    const agg = aggregateInternal(history)
    // Do not display blended difficulty publicly per request; only return aggregate
    ctx.body = { ok: true, aggregated: agg }
  },

  async getForConcept(ctx) {
    const user = ctx.state.user
    if (!user) return ctx.unauthorized()
    const conceptId = ctx.params?.conceptId || ctx.query?.conceptId
    if (!conceptId) {
      ctx.badRequest('Missing conceptId')
      return
    }

    const progressRecords = await strapi.entityService.findMany('api::user-progress.user-progress', {
      filters: { user_id: user.id },
      limit: 1
    })
    if (!progressRecords || progressRecords.length === 0) {
      ctx.notFound('User progress not found')
      return
    }
    const progress = progressRecords[0] as any
    const history: DifficultyEntry[] = progress.internalDifficulties || []
    const found = history.find(h => h.conceptId === conceptId)
    ctx.body = {
      ok: true,
      exists: !!found,
      rating: found && typeof (found as any).user === 'number' ? (found as any).user : null,
      timestamp: found ? found.timestamp : null
    }
  }
}
