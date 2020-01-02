//Contains all the parameters that can be used to tune the behaviour of a competition
exports.COMPSETTINGS = {
    "general": {
        nameDisplay: {
            control: {
                type: "picker",
            },
            name: "compsettings.nameDisplay.name",
            description: "compsettings.nameDisplay.description",
            default: "Name Lastname", //One of ["Name Lastname", "Lastname, Name", "Name", "free"]
        }
    },
    "groups": {
        nPromotingPlayers: {
            control: {
                type: "integer",
                controlType: "up-down"
            },
            name: "compsettings.nPromotingPlayers.name",
            description: "compsettings.nPromotingPlayers.description", //Number of players that go up or down on period closing
            default: 1, 
        },
        untyingCriteria: {
            control: {
                type: "sortable",
                items: ["directMatch","position"]
            },
            name: "compsettings.untyingCriteria.name",
            description: "compsettings.untyingCriteria.description", //How to decide which player is higher in the ranking when there is a points tie 
            default: ["directMatch","position"], 
        }, 
        pointsScheme: {
            control: {
                type: "relations",
            },
            name: "compsettings.pointScheme.name",
            description: "compsettings.pointScheme.description", //Describes how the point distribution works.
            default: [
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
            ]
        }, 
        groupSize: {
            control: {
                type: "integer",
                controlType: "up-down"
            },
            name: "compsettings.groupSize.name",
            description: "compsettings.groupSize.description", //Number of players each group should have under normal circumstances
            default: 4, 
        }, 
        minGroupSize: {
            control: {
                type: "integer",
                controlType: "up-down"
            },
            name: "compsettings.minGroupSize.name",
            description: "compsettings.minGroupSize.description", //If last group has less players than this, they will be joined into the previous group
            default: 3, 
        },
    }
}

//This function should be fired when 
updateCompSettings = () => {
    console.warn("Updating competitions settings...")
    fetch('https://europe-west1-squash-leagues-94b68.cloudfunctions.net/updateCompSettings', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({compSettings: exports.COMPSETTING})
    });
}

//Just uncomment this line when you change add some fields to the competition settings
//updateCompSettings()

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
