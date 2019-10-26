import { STORE_CURRENTUSERDATA, SET_CURRENTCOMPETITION, SET_APPSETTINGS} from './actionTypes'

export const storeUserData = (uid, userData) => ({
    type: STORE_CURRENTUSERDATA,
    id: uid,
    data: userData
})

export const setCurrentCompetition = (gymID, competitionID, name, typeOfComp) => ({
    type: SET_CURRENTCOMPETITION,
    data: {
        gymID,
        competitionID,
        type: typeOfComp,
        name
    }
    
})



