/**
 * user-progress router
 */

import path from "path";

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/get-concept",
            handler: "get-concept.getConcept",
            config: {
                auth: false,
            },
        },
        {
            method: "POST",
            path: "/register",
            handler: "user-login.register",
            config: {
                auth: false,
            },
        },
        {
            method: "POST",
            path: "/signin",
            handler: "user-login.signin",
            config: {
                auth: false,
            },
        }
    ]
};
