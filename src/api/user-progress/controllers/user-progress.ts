/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    async getConcept(ctx){
        try {
            await this.validateQuery(ctx);
            ctx.response.body = "Test";
            
        }
        catch(err) {
            ctx.internalServerError("An error occurred", err);
        }
    }
}));
