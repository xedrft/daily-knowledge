/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    register: async (ctx) => {
        try {
            const response = await axios.post('http://localhost:1337/api/auth/local/register', {
                username: ctx.request.body["username"],
                email: ctx.request.body["email"],
                password: ctx.request.body["password"],
            });

            const user = response.data.user;
            const jwt = response.data.jwt;

            // Initialize user progress record
            let progressInitError: string | null = null;
            try {
                await strapi.documents('api::user-progress.user-progress').create({
                    data: {
                        user_id: user.id,
                        currentField: 'None', // initial placeholder; can be changed later
                        pastFields: [],
                        currentFieldConcepts: [],
                        allPastConcepts: [],
                        current_level: 7 // midpoint (approx 12th grade) — adjust as needed
                    },
                    status: 'published'
                });
            } catch (e) {
                progressInitError = 'User created but progress initialization failed.';
                console.error('Progress init error:', e);
            }

            ctx.response.body = {
                message: "Successfully registered user!",
                user,
                jwt,
                ...(progressInitError ? { warning: progressInitError } : {})
            };

            console.log('User registered successfully:', user);
        } catch (error) {
            console.log('An error occurred:', error.response?.data || error);
            
            // Pass through the actual error message from Strapi auth
            const errorData = error.response?.data;
            const errorMessage = errorData?.error?.message || errorData?.message || "An error occurred during registration. Please try again.";
            
            ctx.response.body = { error: errorMessage };
            ctx.response.status = error.response?.status || 400;
        }
    },


    signin: async (ctx) => {
        try {
            // identifier can be username or email
            const response = await axios.post('http://localhost:1337/api/auth/local', {
                identifier: ctx.request.body["identifier"],
                password: ctx.request.body["password"],
            });


            ctx.response.body = {
                message: "Successfully signed in!",
                user: response.data.user,
                jwt: response.data.jwt
            };

            console.log('User signed in successfully:', response.data.user);

        } catch (error) {
            console.log('An error occurred:', error.response?.data || error);
            
            // Pass through the actual error message from Strapi auth
            const errorData = error.response?.data;
            const errorMessage = errorData?.error?.message || errorData?.message || "An error occurred during sign in. Please try again.";
            
            ctx.response.body = { error: errorMessage };
            ctx.response.status = error.response?.status || 400;
        }
    }

}));