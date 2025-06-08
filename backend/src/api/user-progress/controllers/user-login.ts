/**
 * user-progress controller
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';

export default factories.createCoreController('api::user-progress.user-progress', ({ strapi }) => ({
    register(ctx){
        axios
            .post('http://localhost:1337/api/auth/local/register', {
                username: ctx.request.body["username"],
                email: ctx.request.body["email"],
                password: ctx.request.body["password"],
            })
            .then(response => {
                // Handle success.
                console.log('Well done!');
                console.log('User profile', response.data.user);
                console.log('User token', response.data.jwt);
                ctx.response.body = "Successfully registered user!";
            })
            .catch(error => {
                // Handle error.
                console.log('An error occurred:', error.response);
                ctx.response.body = "An error occurred during registration. Please try again.";
            });

        
    }
}));