//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC

const Constants = {
    GROUP_SIZE: 4,
    UNTYING_CRITERIA: ["directMatch","position"],
    dbPrefix: "",
    paddingTopHeader: 20,
};
const Collections = {
    RANKINGS: (Constants.dbPrefix && Constants.dbPrefix) + "rankings",
    GROUPS: (Constants.dbPrefix && Constants.dbPrefix) + "groups",
    PLAYERS: (Constants.dbPrefix && Constants.dbPrefix) + "players",
    TOURNAMENT: (Constants.dbPrefix && Constants.dbPrefix) + "Torneig",
    MATCHES: (Constants.dbPrefix && Constants.dbPrefix) + "matches",
    MONTH_INFO: (Constants.dbPrefix && Constants.dbPrefix) + "monthInfo",
    CHALLENGE: (Constants.dbPrefix && Constants.dbPrefix) + "Reptes"
};

const Documents = {
    RANKINGS: {
        squashRanking: "squashRanking",
    },
    MONTH_INFO: {
        typeOfComp: "typeOfComp",
        updateRanking: "updateRanking"
    },
    GROUPS: {
        chatMessages: "chatMessages",
        generalMessages: "generalMessages"
    },
    PLAYERS: {
        props: {
            currentGroup: "currentGroup",
            playerName: "playerName"
        }
    }
};

const ChatWorkMode = {
    group: 'Group',
    general: 'General'
};

//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC
export {Constants, Collections, Documents, ChatWorkMode};