import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';

import rootReducer from '../reducers'

let store;

if(__DEV__){
    //Log all changes to store when in developement
    const createStoreWithMiddleware = applyMiddleware(createLogger())(createStore)

    store = createStoreWithMiddleware(rootReducer)
} else {

    store = createStore(rootReducer)
}

export default store
