//This is the parent class of all users and contains general flows for it

export default class User extends Configurable {

    constructor(userData){
        super()

        //Set all the attributes of the competition as they were provided
        Object.keys(userData).forEach( key => {
            this[key] = userData[key]
        })

    }
}