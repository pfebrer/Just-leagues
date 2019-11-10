import { combineReducers } from 'redux'
import currentUser from './currentUser'
import competition from "./competition"
import match from "./match"
import relevantUsers from "./relevantUsers"
import competitions from "./competitions"

export default combineReducers({
    currentUser,
    competition,
    match,
    relevantUsers,
    competitions
})