import { SET_CURRENTCOMPETITION } from '../actions/actionTypes'

const competition = (state = {gymID: "D5xZ9D0c0U5FHWdV1qXD", sportID: "squash"}, action) => {
    switch (action.type) {
        case SET_CURRENTCOMPETITION:
            console.log("REDUX: Storing current competition data...")
            let newState = {
                gymID: action.gymID,
                sportID: action.sportID
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default competition;