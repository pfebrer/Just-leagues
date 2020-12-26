import _ from "lodash"

import { UPDATE_RELEVANTUSERS } from '../actions/actionTypes'

const relevantUsers = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_RELEVANTUSERS:

            // First, we sanitize all users
            var newRelevantUsers = action.newRelevantUsers.reduce((relevantUsers,user) => {

                let {settings: userSettings, expoToken, asigned, email, displayName} = user
    
                let names = userSettings && userSettings["Profile"] ? 
                  _.pick( userSettings["Profile"] , ["aka", "firstName", "lastName"])
                  : {aka: displayName , firstName: displayName, lastName: ""} //This is just to account for users that may not have their settings updated (or unasigned users)
    
                relevantUsers[user.id] = {
                  names,
                  expoToken,
                  asigned,
                  email
                }
    
                return relevantUsers;
            }, {})

            let newState = {
                ...state,
                ...newRelevantUsers,
            }

            return newState
                
        default:
            return state
    }
}

export default relevantUsers