import { UPDATE_BETS } from '../actions/actionTypes'

const bets = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_BETS:

            var newState = {
                ...action.newBets,
            }

            return newState
        default:
            return state
            
    }
}

export default bets