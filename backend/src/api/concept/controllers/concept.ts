/**
 * concept controller
 */

import { factories } from '@strapi/strapi'

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
}));
