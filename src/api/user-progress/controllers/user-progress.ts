/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async getConcept(ctx){
        try {
            await this.validateQuery(ctx);
            const userId = ctx.request.body["userId"];
            const pastConcepts = await strapi.documents("api::user-progress.user-progress").findMany({
                filters : {
                    user_id : {
                        id : userId
                    }
                },
                populate : { concepts: true }
            });
            ctx.response.body = pastConcepts;
            console.log(userId);
            console.log(pastConcepts);


        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
