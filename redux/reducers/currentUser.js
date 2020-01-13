import { STORE_CURRENTUSERDATA } from '../actions/actionTypes'

const currentUser = (state = [], action) => {
    switch (action.type) {
        case STORE_CURRENTUSERDATA:

            let newState = {
                ...state,
                ...action.data,
            }

            return newState
                
        default:
            return state
    }
}

export default currentUser