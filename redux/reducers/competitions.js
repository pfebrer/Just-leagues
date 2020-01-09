import { UPDATE_COMPETITIONS } from '../actions/actionTypes'

const competitions = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_COMPETITIONS:
            console.log("REDUX: Updating the competitions database...")
            console.log(action.newCompetitions)
            let newState = {
                ...state,
                ...action.newCompetitions,
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default competitions