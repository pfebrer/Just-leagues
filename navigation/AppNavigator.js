import {createAppContainer, createSwitchNavigator} from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import Loading from './../components/Loading';
import Login from "../FirebaseLogin";

export default createAppContainer(
    createSwitchNavigator({
            // You could add another route here for authentication.
            // Read more at https://reactnavigation.org/docs/en/auth-flow.html
            AuthLoading: Loading,
            Auth: Login,
            App: MainTabNavigator,
        }, {
            initialRouteName: 'AuthLoading',
        }
    )
);