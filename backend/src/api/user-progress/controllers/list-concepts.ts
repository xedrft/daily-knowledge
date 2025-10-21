import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async listConcepts(ctx) {
        try {
            await this.validateQuery(ctx);
            const user = ctx.state.user;
            
            if (!user) {
                return ctx.unauthorized("No token found or invalid token");
            }

            const userId = user.id;

            // Get user progress to mark learned concepts
            const userProgress = await strapi.documents("api::user-progress.user-progress").findFirst({
                filters: {
                    user_id: {
                        id: userId
                    }
                }
            });

            // Get learned concept titles and build a recency order map from allPastConcepts
            const learnedConcepts = new Set<string>();
            const orderMap: Record<string, number> = {};
            if (userProgress) {
                const currentFieldConcepts = Array.isArray(userProgress.currentFieldConcepts)
                    ? userProgress.currentFieldConcepts
                    : [];
                const allPastConcepts = Array.isArray(userProgress.allPastConcepts)
                    ? userProgress.allPastConcepts
                    : [];

                // Mark learned
                [...currentFieldConcepts, ...allPastConcepts].forEach(concept => {
                    if (typeof concept === 'string') {
                        learnedConcepts.add(concept);
                    } else if (concept && typeof concept === 'object' && 'title' in concept) {
                        learnedConcepts.add((concept as any).title);
                    }
                });

                // Build recency order map from allPastConcepts sequence (append-only, most recent is last)
                allPastConcepts.forEach((concept, idx) => {
                    const title = typeof concept === 'string' ? concept : (concept && typeof concept === 'object' && 'title' in concept ? (concept as any).title : undefined);
                    if (title) {
                        orderMap[title] = idx; // larger idx means more recent
                    }
                });
            }

            // Fetch all concepts from the database
            const allConcepts = await strapi.documents("api::concept.concept").findMany({
                status: 'published',
                limit: 1000, // Adjust if you have more concepts
            });

            // Map concepts to include learned status, and ONLY include learned concepts
            const conceptsWithProgress = allConcepts
                .filter(concept => learnedConcepts.has(concept.title)) // Only show learned concepts
                .map(concept => ({
                    documentId: concept.documentId,
                    title: concept.title,
                    difficulty: concept.difficulty || 7,
                    fields: Array.isArray(concept.fields) ? concept.fields : [],
                    learned: true, // All concepts here are learned
                    recentOrder: orderMap[concept.title] ?? -1
                }));

            // Sort by title
            conceptsWithProgress.sort((a, b) => a.title.localeCompare(b.title));

            ctx.response.body = {
                concepts: conceptsWithProgress,
                total: conceptsWithProgress.length
            };

        } catch (error) {
            console.error('Error listing concepts:', error);
            return ctx.badRequest("An error occurred while fetching concepts. Please try again.");
        }
    }
}));
