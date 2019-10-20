import { STORE_CURRENTUSERDATA } from '../actions/actionTypes'

const currentUser = (state = [], action) => {
    switch (action.type) {
        case STORE_CURRENTUSERDATA:
            console.log("REDUX: Storing current user data...")
            let newState = {
                id: action.id,
                ...action.data,
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default currentUser