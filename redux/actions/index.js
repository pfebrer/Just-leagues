import { STORE_CURRENTUSERDATA } from './actionTypes'

export const storeUserData = (uid, userData) => ({
    type: STORE_CURRENTUSERDATA,
    id: uid,
    data: userData
})