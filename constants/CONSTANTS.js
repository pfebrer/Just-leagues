//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC

const Constants = {
    GROUP_SIZE: 4,
    UNTYING_CRITERIA: ["directMatch","position"],
    dbPrefix: "",
    paddingTopHeader: 20,
};

const Collections = {
    GYMS:  (Constants.dbPrefix && Constants.dbPrefix) + "gyms",
    USERS: (Constants.dbPrefix && Constants.dbPrefix) + "users",
};

const Subcollections = {
    COMPETITIONS: "competitions",
    GROUPS: "groups",
    MATCHES: "matches",
    PENDINGMATCHES: "pendingMatches",
    MESSAGES: "messages",
    RANKHISTORY: "rankHistory"
}

const Documents = {
    COMPETITIONS: {
        usersToCreate: "players"
    }
};

const CalendarConstants = {
    name: "Just leagues",
    color: "blue",
}

//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC
export {Constants, Collections, Subcollections, Documents, CalendarConstants};