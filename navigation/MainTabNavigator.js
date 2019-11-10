import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';

import Stats from "../screens/StatsScreen";
import CompetitionScreen from "../screens/CompetitionScreen";
import AdminScreen from "../screens/AdminScreen";
import GroupChat from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RankingEditScreen from "../screens/RankingEditScreen";
import HomeScreen from "../screens/HomeScreen"
import MatchScreen from "../screens/MatchScreen"

import { Icon } from 'native-base';
import ChatScreen from '../screens/ChatScreen';



const EditingStack = createStackNavigator({
    AdminScreen: AdminScreen,
    EditRankingScreen: RankingEditScreen,
},{ headerMode: "none"});


const HomeStack = createStackNavigator({
    HomeScreen: HomeScreen,
    SettingsScreen: SettingsScreen,
    CompetitionScreen: CompetitionScreen,
    MatchScreen: MatchScreen,
    //Screens for admins only
    AdminScreen: AdminScreen,
    EditRankingScreen: RankingEditScreen
},{initialRouteName: "HomeScreen"});

const AdminStack = createStackNavigator({
    AdminScreen: AdminScreen,
});

export default createBottomTabNavigator({
        /* Stats: {
            screen: Stats,
            navigationOptions: {
                tabBarLabel: translate("tabs.stats"),
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="ios-stats" size={20} color={tintColor}/>
                )
            }
        }, */
        /* Competition: {
            screen: ClasifStack,
            navigationOptions: {
                tabBarLabel: translate("tabs.competition"),
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="md-trophy" size={20} color={tintColor}/>
                )
            }
        }, */
        Home: {
            screen: HomeStack,
            navigationOptions: {
                tabBarIcon: ({tintColor}) => (
                    <Icon name="home" size={20} style={{color: tintColor}}/>
                )
            }
        },
        Chat: {
            screen: ChatScreen,
            navigationOptions: {
                tabBarIcon: ({tintColor}) => (
                    <Icon name="chatbubbles" style={{color: tintColor}}/>
                )
            }
        },/*
        Profile: {
            screen: ProfileScreen,
            navigationOptions: {
                tabBarIcon: ({tintColor}) => (
                    <Icon name="person" style={{color: tintColor}}/>
                )
            }
        },*/
        /*MatchSearcher: {
            screen: MatchSearcher,

            navigationOptions: {
                tabBarLabel: translate("tabs.matches"),
                tabBarIcon: ({tintColor}) => (
                    <AntDesign name="database" size={20} color={tintColor}/>
                )
            }
        },*/
        /*Ranking: {
            screen: EditRankingScreen,
            navigationOptions: {
                tabBarLabel: translate("tabs.ranking"),
                tabBarIcon: ({tintColor}) => (
                    <MaterialIcons name="format-list-numbered" size={20} color={tintColor}/>
                )
            }
        }*/
    },
    {
        initialRouteName: "Home",
        tabBarOptions: {
            showLabel: false,
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            activeBackgroundColor: "#cccccc4D",
            inactiveBackgroundColor: "#ffffff00"
        }
    }
);