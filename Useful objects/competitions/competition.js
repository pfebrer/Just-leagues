import Configurable from "../configurable"

//This is the parent class of all competitions and contains general flows

export default class Competition extends Configurable {

    constructor(compDict){
        super()

        //Set all the attributes of the competition as they were provided
        Object.keys(compDict).forEach( key => {
            this[key] = compDict[key]
        })

    }

    renderName = (nameObject) => {
        /* Renders the name of a given user according to the competition's settings */ 

        let nameDisplaySettings = this.getSetting("nameDisplay")

        if (!nameObject){
            return translate("errors.no name")
        } if (nameDisplaySettings == "Name Lastname"){
            return [ nameObject.firstName, nameObject.lastName].join(" ")
        } else if (nameDisplaySettings == "Lastname, Name" ) {
            return [ nameObject.lastName, nameObject.firstName].join(", ")
        } else if (nameDisplaySettings == "Name") {
            return nameObject.firstName
        } else if (nameDisplaySettings == "free"){
            return nameObject.aka
        }
    }
}
