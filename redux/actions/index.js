import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION} from './actionTypes'

export const storeUserData = (uid, userData) => ({
    type: STORE_CURRENTUSERDATA,
    id: uid,
    data: userData
})

export const setCurrentCompetition = (gymID, sportID) => ({
    type: SET_CURRENTCOMPETITION,
    gymID,
    sportID
})

