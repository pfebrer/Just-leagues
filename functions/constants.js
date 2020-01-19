const Constants = {
    dbPrefix: "",
};

exports.Collections = {
    GYMS:  (Constants.dbPrefix && Constants.dbPrefix) + "gyms",
    USERS: (Constants.dbPrefix && Constants.dbPrefix) + "users",
};

exports.Subcollections = {
    COMPETITIONS: "competitions",
    GROUPS: "groups",
    MATCHES: "matches",
    PENDINGMATCHES: "pendingMatches",
    MESSAGES: "messages"
}

exports.Documents = {
    COMPETITION: {
        usersToCreate: "players"
    }
};