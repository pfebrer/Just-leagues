import { 
    STORE_CURRENTUSERDATA,
    SET_CURRENTCOMPETITION,
    SET_CURRENTMATCH,
    UPDATE_COMPETITIONS,
    UPDATE_RELEVANTUSERS
} from './actionTypes'

import Competition from "../../Useful objects/competitions/competition"
import GroupCompetition from "../../Useful objects/competitions/groups"

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

export const updateRelevantUsers = (newRelevantUsers) => ({
    type: UPDATE_RELEVANTUSERS,
    newRelevantUsers
})

export const updateCompetitions = (newCompetitions) => ({
    type: UPDATE_COMPETITIONS,
    newCompetitions: newCompetitions ? Object.keys(newCompetitions).reduce((comps, compID) => {comps[compID] = new GroupCompetition(newCompetitions[compID]); return comps}, {}) : null
})



