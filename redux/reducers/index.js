import { combineReducers } from 'redux'
import currentUser from './currentUser'
import competition from "./competition"

export default combineReducers({
    currentUser,
    competition
})