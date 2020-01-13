import { UPDATE_COMPETITIONS, SET_CURRENTCOMPETITION} from '../actions/actionTypes'
import GroupsCompetition from '../../Useful objects/competitions/groups'
import _ from 'lodash'

const competitions = (state = {}, action) => {
    switch (action.type) {
        case UPDATE_COMPETITIONS:

            let currentComp = _.find(competitions, 'isCurrent')

            var newState = {
                ...state,
                ...action.newCompetitions,
            }

            //Preserve the current competition
            if (currentComp && newState[currentComp.id]) {newState[currentComp.id].isCurrent = true}

            return newState
        case SET_CURRENTCOMPETITION:

            var newState = Object.keys(state).reduce((newState, compID) => {
                newState[compID] = { ...state[compID], isCurrent: compID == action.id}
                return newState
            }, {} )

            return newState

        default:
            return state
        
    }
}

//SELECTORS
const compClasses = {
    groups: GroupsCompetition,
}

const superChargeComp = (comp) => new compClasses[comp.type](comp)

export const selectCurrentCompetition = (competitions) => {
    let currentComp = _.find(competitions, 'isCurrent')

    if(currentComp) return superChargeComp(currentComp)
    else return null
} 

export const selectSuperChargedCompetitions = (competitions) => {
    return Object.keys(competitions).reduce((superCharged, compID) => {
        superCharged[compID] = superChargeComp(competitions[compID])
        return superCharged
    }, {})
}

export default competitions