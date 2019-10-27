import { UPDATE_IDSANDNAMES } from '../actions/actionTypes'

const IDsAndNames = (state = [], action) => {
    switch (action.type) {
        case UPDATE_IDSANDNAMES:
            console.log("REDUX: Updating the IDs and names database...")
            let newState = {
                ...state,
                ...action.newIDsAndNames,
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default IDsAndNames