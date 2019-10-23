import { translate } from '../assets/translations/translationManager';

//Contains all the parameters that can be used to tune the app


exports.COMPSETTINGS = {
    groups: {
        pointsScheme: [
            {
                result: [3,0],
                points: [7,1],
            },

            {
                result: [3,1],
                points: [6,2],
            },

            {
                result: [3,2],
                points: [5,3],
            }
        ], //Describes how the point distribution works.
        groupSize: 4, //Number of players each group should have under normal circumstances
        minGroupSize: 3, //If last group has less players than this, they will be joined into the previous group
    }
}

exports.USERSETTINGS = {
    "General appearance": {
        backgroundColor: {
            name: "settings.background color.name",
            description: "settings.background color.description",
            default: "#ffe39f"
        }
    },
    "Competition display": {
        groupMaxVisibleCols: {
            name: "settings.max visible cols.name",
            description: "settings.max visible cols.description",
            default: 6
        },
    },
}
