/**
 * user-progress router
 */

module.exports = {
    routes: [
        {
            method: "POST",
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
        }
    ]
};
