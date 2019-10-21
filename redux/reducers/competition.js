import { SET_CURRENTCOMPETITION, SET_RANKING } from '../actions/actionTypes'

const competition = (state = {gymID: "D5xZ9D0c0U5FHWdV1qXD", sportID: "squash"}, action) => {
    switch (action.type) {
        case SET_CURRENTCOMPETITION:
            console.log("REDUX: Storing current competition data...")
            var newState = {
                gymID: action.gymID,
                sportID: action.sportID
            }
            console.log(newState)
            return newState
        case SET_RANKING:
            console.log("REDUX: Setting ranking for the competition...")
            var newState = {
                ...state,
                ranking: action.ranking,
            }
            console.log(newState)
            return newState

                
        default:
            return state
    }
}

export default competition;