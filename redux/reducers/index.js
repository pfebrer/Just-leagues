import { combineReducers } from 'redux'
import currentUser from './currentUser'
import match from "./match"
import relevantUsers from "./relevantUsers"
import competitions, * as fromCompetitions from "./competitions"

export default combineReducers({
    currentUser,
    match,
    relevantUsers,
    competitions
})

//SELECTORS

export const selectCurrentCompetition = (state) => fromCompetitions.selectCurrentCompetition(state.competitions)

export const selectSuperChargedCompetitions = (state) => fromCompetitions.selectSuperChargedCompetitions(state.competitions)