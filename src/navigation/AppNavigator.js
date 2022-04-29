import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import LoadingScreen from '../screens/LoadingScreen';
import Login from "../FirebaseLogin";

const AuthStack = createNativeStackNavigator()

const AuthNavigator = () => {
    return (
        <AuthStack.Navigator 
            initialRouteName="AuthLoading"
            screenOptions={{
                headerShown: false
            }}>
            <AuthStack.Screen
                name="AuthLoading"
                component={LoadingScreen}
            />
            <AuthStack.Screen
                name="Auth"
                component={Login}
            />
            <AuthStack.Screen
                name="App"
                component={MainTabNavigator}
            />
        </AuthStack.Navigator>
    )
}

const AppNavigator = () => {

    return <NavigationContainer>
        <AuthNavigator/>
    </NavigationContainer>
}

export default AppNavigator;