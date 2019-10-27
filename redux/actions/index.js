import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION, UPDATE_IDSANDNAMES} from './actionTypes'

export const storeUserData = (userData) => ({
    type: STORE_CURRENTUSERDATA,
    data: userData
})

export const setCurrentCompetition = (compInfo) => ({
    type: SET_CURRENTCOMPETITION,
    data: compInfo
})

export const updateIDsAndNames = (newIDsAndNames) => ({
    type: UPDATE_IDSANDNAMES,
    newIDsAndNames
})



