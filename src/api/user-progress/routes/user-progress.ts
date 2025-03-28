/**
 * user-progress router
 */

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/get-concept",
            handler: "user-progress.getConcept",
            config: {
                auth: false,
            },
        },
    ]
};
