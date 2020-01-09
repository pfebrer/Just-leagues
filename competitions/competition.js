//This is the parent class of all competitions and contains general flows

export default class Competition {

    constructor(compDict){

        //Set all the attributes of the competition as they were provided
        Object.keys(compDict).forEach( key => {
            this[key] = compDict[key]
        })

    }
}
