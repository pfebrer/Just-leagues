import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CompetitionScreen from "../screens/Competition/CompetitionScreen";
import AdminScreen from "../screens/AdminScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RankingEditScreen from "../screens/Admin/RankingEditScreen";
import PlayersManagementScreen from "../screens/Admin/PlayersManagementScreen";
import MatchScreen from "../screens/MatchScreen"
import HomeScreen from "../screens/HomeScreen"

import { Icon } from 'native-base';
// import ChatScreen from '../screens/ChatScreen'; NO CHAT FOR NOW, I FEEL LIKE IT ADDS NOTHING TO THE APP
import EndingPeriodModal from '../components/groups/EndingPeriodModal';
import SearchScreen from '../screens/SearchScreen';
import { Ionicons } from '@expo/vector-icons';

const HomeStack = createNativeStackNavigator();

function HomeNavigator() {
  return (
    <HomeStack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{
            headerShown: true,
            headerShadowVisible: false
        }}
        >
        <HomeStack.Screen name="HomeScreen" component={HomeScreen}/>
        <HomeStack.Screen name="SettingsScreen" component={SettingsScreen}/>
        <HomeStack.Screen name="CompetitionScreen" component={CompetitionScreen}/>
        <HomeStack.Screen name="MatchScreen" component={MatchScreen}/>
        <HomeStack.Screen name="AdminScreen" component={AdminScreen}/>
        <HomeStack.Screen name="EditRankingScreen" component={RankingEditScreen}/>
        <HomeStack.Screen name="PlayersManagementScreen" component={PlayersManagementScreen}/>
        <HomeStack.Screen name="EndPeriodScreen" component={EndingPeriodModal}/>
    </HomeStack.Navigator>
  );
}

const MainTab = createBottomTabNavigator();

function MainNavigator() {
  return (
    <MainTab.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: 'black',
            tabBarInactiveTintColor: '#ccc',
            tabBarActiveBackgroundColor: "#ffffff00",
            tabBarInactiveBackgroundColor: "#ffffff00"
        }}
        >
        <MainTab.Screen 
            name="Home" 
            component={HomeNavigator}
            options={{
                tabBarIcon: ({color}) => <Icon as={Ionicons} name="home" size={5} style={{color}}/>
            }}
            />
        <MainTab.Screen 
            name="Search" 
            component={SearchScreen} 
            options={{
                tabBarIcon: ({color}) => <Icon as={Ionicons} name="search" size={5} style={{color}}/>
            }}
            />
        {/* <MainTab.Screen
            name="Chat" 
            component={ChatScreen} 
            options={{
                tabBarIcon: ({color}) => <Icon as={Ionicons} name="chatbubbles" size={5} style={{color}}/>
            }}
            /> */}
    </MainTab.Navigator>
  );
}

export default MainNavigator;