/**
 * user-progress router
 */

module.exports = {
    routes: [
        {
            method: "GET",
            path: "/get-concept",
            handler: "get-concept.getConcept",

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
        },
        {
            method: "POST",
            path: "/get-field-suggestions",
            handler: "change-field.getSuggestedFields",
        },
        {
            method: "POST",
            path : "/change-field",
            handler: "change-field.changeField",
        },
        {
            method: "GET",
            path: "/check-field",
            handler: "change-field.checkUserField",
        },
        {
            method: "GET",
            path: "/list-concepts",
            handler: "list-concepts.listConcepts",
        }
    ]
};
