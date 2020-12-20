import { combineReducers } from 'redux'
import currentUser, * as fromCurrentUser from './currentUser'
import match from "./match"
import relevantUsers from "./relevantUsers"
import competitions, * as fromCompetitions from "./competitions"
import bets from "./bets"

export default combineReducers({
    currentUser,
    match,
    relevantUsers,
    competitions,
    bets
})

//SELECTORS

export const selectCurrentCompetition = (state) => fromCompetitions.selectCurrentCompetition(state.competitions)

export const selectAdminCompetitions = (state) => fromCompetitions.selectAdminCompetitions(state.competitions)

export const selectSuperChargedCompetitions = (state) => fromCompetitions.selectSuperChargedCompetitions(state.competitions)

export const selectUserPendingMatches = (state) => {

    if (!state.competitions) return []

    return Object.values(state.competitions).reduce((userPendingMatches, competition) => {

        if (!competition.pendingMatches) return userPendingMatches

        return [...userPendingMatches, ...competition.pendingMatches.filter(match => match.playersIDs.indexOf(state.currentUser.id) > -1)]
    }, [])
}

export const selectUserSetting = (state, ...args) => fromCurrentUser.selectUserSetting(state.currentUser, ...args)