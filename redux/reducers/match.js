import { SET_CURRENTMATCH} from '../actions/actionTypes'

const match = (state = {}, action) => {
    switch (action.type) {
        case SET_CURRENTMATCH:

            if (action.config.merge){
                var newState = { ...state, ...action.data }
            } else {
                var newState = action.data
            }

            return newState
                
        default:
            return state
    }
}

export default match;