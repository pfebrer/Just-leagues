//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC

let dbPrefix = "";
const Constants = {
    GROUP_SIZE: 4
};
const Collections = {
    RANKINGS: (dbPrefix && dbPrefix + '_') + "rankings",
    GROUPS: (dbPrefix && dbPrefix + '_') + "groups",
    PLAYERS: (dbPrefix && dbPrefix + '_') + "players",
    TOURNAMENT: (dbPrefix && dbPrefix + '_') + "Torneig",
    MATCHES: (dbPrefix && dbPrefix + '_') + "matches",
    MONTH_INFO: (dbPrefix && dbPrefix + '_') + "monthInfo",
    CHALLENGE: (dbPrefix && dbPrefix + '_') + "Reptes"
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
        chatMessages: "chatMessages"
    },
    PLAYERS: {
        props: {
            currentGroup: "currentGroup",
            playerName: "playerName"
        }
    }
};
//USED IN FIREBASE FUNCTIONS, REMEMBER TO KEEP IN SYNC
export {Constants, Collections, Documents};