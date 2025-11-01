/**
 * concept controller
 */

import { factories } from '@strapi/strapi'
import init_difficulty from '../../../../functions/init-difficulty'
import contentCall from '../../../../functions/content_call'

export default factories.createCoreController('api::concept.concept', ({ strapi }) => ({
	async getByIdOrTitle(ctx) {
		try {
			// ensure authenticated user exists (route enforces auth, but double-check)
			const user = ctx.state.user;
			if (!user) {
				return ctx.unauthorized('No token found or invalid token');
			}
			const { documentId, title } = (ctx.request.body || {}) as { documentId?: string; title?: string };
			if (!documentId && !title) {
				return ctx.badRequest('Provide either documentId or title');
			}

			let concept: any = null;
			if (documentId) {
				concept = await (strapi as any).documents('api::concept.concept').findOne({ documentId });
			} else if (title) {
				concept = await (strapi as any).documents('api::concept.concept').findFirst({
					filters: { title },
				});
			}

			if (!concept) {
				return ctx.notFound('Concept not found');
			}

			ctx.response.body = {
				documentId: concept.documentId,
				title: concept.title,
				content: concept.content,
				problemset: concept.problemset,
				fields: concept.fields,
				difficulty: concept.difficulty,
			};
		} catch (err) {
			ctx.internalServerError('Failed to fetch concept content', err);
		}
	},

	// Regenerate content for an existing concept and replace it in the system.
	// Accepts { title?: string, documentId?: string }. Uses the caller's
	// profile context (level, previouslyLearned) to guide content creation.
	async regenerate(ctx) {
		try {
			const user = ctx.state.user
			if (!user) return ctx.unauthorized('No token found or invalid token')

			const { documentId, title } = (ctx.request.body || {}) as { documentId?: string; title?: string }
			if (!documentId && !title) return ctx.badRequest('Provide either documentId or title')

			// Resolve the concept doc
			let concept: any = null
			if (documentId) {
				concept = await (strapi as any).documents('api::concept.concept').findOne({ documentId })
			} else {
				concept = await (strapi as any).documents('api::concept.concept').findFirst({ filters: { title } })
			}
			if (!concept) return ctx.notFound('Concept not found')

			// Pull user context to guide generation
			const progress = await (strapi as any).documents('api::user-progress.user-progress').findFirst({
				filters: { user_id: { id: user.id } },
			})
			const currLevel: number | null = (progress && typeof progress.current_level === 'number') ? progress.current_level : null
			const previouslyLearned: string[] = Array.isArray(progress?.previouslyLearned) ? progress.previouslyLearned : []

			const conceptTitle = concept.title || title
			// Generate fresh content
			const contentRes = await contentCall(conceptTitle, currLevel, previouslyLearned)
			const generated = JSON.parse((contentRes as any)["output_text"] || '{}')
			const newContent: string = generated.content || ''
			const newProblemset: any[] = Array.isArray(generated.problemset) ? generated.problemset : []
			const newFields: string[] = Array.isArray(generated.fields) ? generated.fields : []

			// Re-evaluate difficulty from content
			const newDifficulty = await init_difficulty(newContent)

			// Replace the existing concept document content
			const updated = await (strapi as any).documents('api::concept.concept').update({
				documentId: concept.documentId,
				data: {
					content: newContent,
					problemset: newProblemset,
					fields: newFields,
					difficulty: newDifficulty,
				},
				status: 'published',
			})

			ctx.response.body = {
				documentId: updated.documentId,
				title: updated.title,
				content: updated.content,
				problemset: updated.problemset,
				fields: updated.fields,
				difficulty: updated.difficulty,
			}
		} catch (err) {
			ctx.internalServerError('Failed to regenerate concept content', err)
		}
	},
}));
