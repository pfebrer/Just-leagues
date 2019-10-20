import {createAppContainer, createSwitchNavigator} from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import Login from "../FirebaseLogin";

export default createAppContainer(
    createSwitchNavigator({
            // You could add another route here for authentication.
            // Read more at https://reactnavigation.org/docs/en/auth-flow.html
            AuthLoading: LoadingScreen,
            Auth: Login,
            App: MainTabNavigator,
        }, {
            initialRouteName: 'AuthLoading',
        }
    )
);