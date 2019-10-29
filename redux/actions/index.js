import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION, SET_CURRENTMATCH, UPDATE_IDSANDNAMES} from './actionTypes'

export const storeUserData = (userData) => ({
    type: STORE_CURRENTUSERDATA,
    data: userData
})

export const setCurrentCompetition = (compInfo) => ({
    type: SET_CURRENTCOMPETITION,
    data: compInfo
})

export const setCurrentMatch = (matchInfo) => ({
    type: SET_CURRENTMATCH,
    data: matchInfo
})

export const updateIDsAndNames = (newIDsAndNames) => ({
    type: UPDATE_IDSANDNAMES,
    newIDsAndNames
})



