//Contains all the parameters that can be used to tune the app
exports.COMPSETTINGS = {
    general: {
        nameDisplay: "Name Lastname" //One of ["Name Lastname", "Lastname, Name", "Name", "free"]
    },
    groups: {
        nPromotingPlayers: 1, //Number of players that go up or down on period closing
        untyingCriteria: ["directMatch","position"], //How to decide which player is higher in the ranking when there is a points tie 
        pointsScheme: [
            {
                result: [0,-1],
                points: [7,0]
            },

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

//Remember to set a translation for each setting that you add!
exports.USERSETTINGS = {
    "Profile": {
        aka: {
            control: {
                type: "text",
            },
            name: "settings.aka.name",
            description: "settings.aka.description",
            default: "",
            
        },
        firstName: {
            control: {
                type: "text",
            },
            name: "settings.first name.name",
            default: "",
            
        },
        lastName: {
            control: {
                type: "text",
            },
            name: "settings.last name.name",
            default: "",
        }
    },
    "General appearance": {
        backgroundColor: {
            control: {
                type: "colorWheel",
            },
            name: "settings.background color.name",
            description: "settings.background color.description",
            default: "#ffe39f",
            
        }
    },
    "Competition display": {
        groupMaxVisibleCols: {
            control: {
                type: "integer",
                controlType: "up-down"
            },
            name: "settings.max visible cols.name",
            description: "settings.max visible cols.description",
            default: 6
        },
    },
}

//Get the value of a particular setting of a given user
exports.getUserSetting = (userData, settingKey) => {

    return "red"

    let settings = exports.deepClone(userData.settings)

    Object.keys(settings).forEach( settingType => {
        Object.keys(settings[settingType]).forEach( key => {

            if (key == settingKey){
                return settings[settingType][settingKey]
            }
        })
    })

    return undefined
}
