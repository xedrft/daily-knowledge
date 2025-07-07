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

            ctx.response.body = {
                message: "Successfully registered user!",
                user: response.data.user,
                jwt : response.data.jwt
            };

            ctx.cookies.set('jwt', response.data.jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 100 // days
            });

            console.log('User registered successfully:', response.data.user);
        } catch (error) {
            console.log('An error occurred:', error.response?.data || error);
            ctx.response.body = { error: "An error occurred during registration. Please try again." };
            ctx.response.status = 400;
        }
    },


    signin: async (ctx) => {
        try {
            // identifier can be username or email
            const response = await axios.post('http://localhost:1337/api/auth/local', {
                identifier: ctx.request.body["identifier"],
                password: ctx.request.body["password"],
            });

            ctx.cookies.set('jwt', response.data.jwt, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 100 // 100 days
            });

            ctx.response.body = {
                message: "Successfully signed in!",
                user: response.data.user,
                jwt: response.data.jwt
            };

            console.log('User signed in successfully:', response.data.user);

        } catch (error) {
            console.log('An error occurred:', error.response?.data || error);
            ctx.response.body = { error: "An error occurred during sign in. Please try again." };
            ctx.response.status = 400;
        }
    }

}));