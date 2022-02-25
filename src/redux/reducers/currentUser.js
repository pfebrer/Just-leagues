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

export const selectUserSetting = (currentUser, settingType, settingKey) => {

    if (currentUser && currentUser.settings) {
        return currentUser.settings[settingType][settingKey]
    } else {
        return undefined
    }
}

export default currentUser