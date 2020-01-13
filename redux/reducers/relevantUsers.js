import { UPDATE_RELEVANTUSERS } from '../actions/actionTypes'

const relevantUsers = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_RELEVANTUSERS:

            let newState = {
                ...state,
                ...action.newRelevantUsers,
            }

            return newState
                
        default:
            return state
    }
}

export default relevantUsers