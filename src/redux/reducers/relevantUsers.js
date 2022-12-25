import _ from "lodash"

import { UPDATE_RELEVANTUSERS } from '../actions/actionTypes'

const relevantUsers = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_RELEVANTUSERS:

            // First, we sanitize all users
            var newRelevantUsers = action.newRelevantUsers.reduce((relevantUsers,user) => {

                let {settings: userSettings, expoToken, asigned, email, displayName, profilePic} = user

                // Get the names object from the profile
                let names = userSettings && userSettings["Profile"] ? _.pick( userSettings["Profile"] , ["aka", "firstName", "lastName"]) : null

                // For users that may not have their settings updated,
                // unasigned users or users whose profile has been accidentally deleted
                // we use the display name
                if ( !names || (!names.aka && !names.firstName && !names.lastName)){
                    names = {aka: displayName , firstName: displayName, lastName: ""}
                }
    
                relevantUsers[user.id] = {
                  names,
                  expoToken,
                  asigned,
                  email,
                  profilePic
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