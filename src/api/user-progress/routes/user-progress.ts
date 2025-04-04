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
    ]
};
