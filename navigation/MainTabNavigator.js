import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';

import Stats from "../screens/StatsScreen";
import CompetitionScreen from "../screens/Competition/CompetitionScreen";
import CompetitionMatches from "../screens/Competition/CompetitionMatches"
import AdminScreen from "../screens/AdminScreen";
import GroupChat from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RankingEditScreen from "../screens/Admin/RankingEditScreen";
import PlayersManagementScreen from "../screens/Admin/PlayersManagementScreen";
import HomeScreen from "../screens/HomeScreen"
import MatchScreen from "../screens/MatchScreen"

import { Icon } from 'native-base';
import ChatScreen from '../screens/ChatScreen';
import { translate } from '../assets/translations/translationManager';


const CompScreen = createStackNavigator({
    CompetitionScreen: CompetitionScreen
  })

const CompMatches = createStackNavigator({
    CompetitionMatches: CompetitionMatches
})

const CompetitionDrawer = createDrawerNavigator({
    CompetitionScreenStack: {
        screen: CompScreen,
        navigationOptions: {
            drawerLabel: translate("tabs.competition overview")
        }
    },
    CompetitionMatchesStack: {
        screen: CompMatches,
        navigationOptions: {
            drawerLabel: translate("tabs.matches")
        }
    },
  }, {
    drawerPosition: "right",
    drawerType: "slide"
  });

const EditingStack = createStackNavigator({
    AdminScreen: AdminScreen,
    EditRankingScreen: RankingEditScreen,
},{ headerMode: "none"});


const HomeStack = createStackNavigator({
    HomeScreen: HomeScreen,
    SettingsScreen: SettingsScreen,
    CompetitionDrawer: {
        screen: CompetitionDrawer,
        navigationOptions: {
            header: null
        }
    },
    MatchScreen: MatchScreen,
    //Screens for admins only
    AdminScreen: AdminScreen,
    EditRankingScreen: RankingEditScreen,
    PlayersManagementScreen: PlayersManagementScreen
},{initialRouteName: "HomeScreen"});

export default MainNavigator = createBottomTabNavigator({
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