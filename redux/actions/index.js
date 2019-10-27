import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION, SET_APPSETTINGS} from './actionTypes'

export const storeUserData = (userData) => ({
    type: STORE_CURRENTUSERDATA,
    data: userData
})

export const setCurrentCompetition = (compInfo) => ({
    type: SET_CURRENTCOMPETITION,
    data: compInfo
})



