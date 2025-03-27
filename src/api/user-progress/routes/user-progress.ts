/**
 * user-progress router
 */

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/get-concept",
            handler: "user-progress.getConcept",
            config: {
                auth: false,
            },
        },
    ]
};
