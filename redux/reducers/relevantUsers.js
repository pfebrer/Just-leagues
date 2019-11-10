import { UPDATE_RELEVANTUSERS } from '../actions/actionTypes'

const relevantUsers = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_RELEVANTUSERS:
            console.log("REDUX: Updating the relevant users database...")
            let newState = {
                ...state,
                ...action.newRelevantUsers,
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default relevantUsers