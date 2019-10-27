import { combineReducers } from 'redux'
import currentUser from './currentUser'
import competition from "./competition"
import IDsAndNames from "./IDsAndNames"

export default combineReducers({
    currentUser,
    competition,
    IDsAndNames,
})