import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION, SET_CURRENTMATCH, UPDATE_IDSANDNAMES} from './actionTypes'

export const storeUserData = (userData) => ({
    type: STORE_CURRENTUSERDATA,
    data: userData
})

export const setCurrentCompetition = (compInfo, config = {}) => ({
    type: SET_CURRENTCOMPETITION,
    data: compInfo,
    config
})

export const setCurrentMatch = (matchInfo, config = {}) => ({
    type: SET_CURRENTMATCH,
    data: matchInfo,
    config,
})

export const updateIDsAndNames = (newIDsAndNames) => ({
    type: UPDATE_IDSANDNAMES,
    newIDsAndNames
})



