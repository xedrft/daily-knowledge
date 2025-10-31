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
        ,
        {
            method: "POST",
            path: "/initialize-profile",
            handler: "change-field.initializeProfile",
        },
        {
            method: "POST",
            path: "/update-level",
            handler: "change-field.updateLevel",
        },
        {
            method: "POST",
            path: "/update-previously-learned",
            handler: "change-field.updatePreviouslyLearned",
        },
        // Activity & streak endpoints
        {
            method: "POST",
            path: "/record-activity",
            handler: "activity.record",
        },
        {
            method: "GET",
            path: "/activity",
            handler: "activity.getRange",
        },
        {
            method: "GET",
            path: "/streak",
            handler: "activity.getStreak",
        }
    ]
};
