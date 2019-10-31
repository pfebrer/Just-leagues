import { SET_CURRENTMATCH} from '../actions/actionTypes'

const match = (state = {}, action) => {
    switch (action.type) {
        case SET_CURRENTMATCH:
            console.log("REDUX: Storing current match data...")
            if (action.config.merge){
                var newState = { ...state, ...action.data }
            } else {
                var newState = action.data
            }
            console.log(newState)
            return newState
                
        default:
            return state
    }
}

export default match;