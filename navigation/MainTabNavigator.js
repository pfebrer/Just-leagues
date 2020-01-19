import React from 'react';
import { getActiveChildNavigationOptions } from "react-navigation"
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createDrawerNavigator } from 'react-navigation-drawer';

import Calendar from "../api/Calendar"
import Stats from "../screens/StatsScreen";
import CompetitionScreen from "../screens/Competition/CompetitionScreen";
import AdminScreen from "../screens/AdminScreen";
import GroupChat from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RankingEditScreen from "../screens/Admin/RankingEditScreen";
import PlayersManagementScreen from "../screens/Admin/PlayersManagementScreen";
import HomeScreen from "../screens/HomeScreen"
import MatchScreen from "../screens/MatchScreen"

import { Icon } from 'native-base';
import HeaderIcon from "../components/header/HeaderIcon"
import ChatScreen from '../screens/ChatScreen';
import { translate } from '../assets/translations/translationManager';

export const compTabBarOptions = {
    pressColor: "#ccc",
    style: {
        backgroundColor: "white"
    },
    indicatorStyle: {
        backgroundColor: "black",
    },
    labelStyle: {
        color: "black"
    },
}

/*const CompetitionTabs = createMaterialTopTabNavigator({
    CompetitionScreen: {
        screen: CompetitionScreen,
        navigationOptions: {
            tabBarLabel: translate("tabs.competition overview")
        }
    },
    CompetitionMatches: {
        screen: CompetitionMatches,
        navigationOptions: {
            tabBarLabel: translate("tabs.matches")
        }
    },
    CompetitionStats: {
        screen: CompetitionStats,
        navigationOptions: {
            tabBarLabel: translate("tabs.stats")
        }
    }
}, {
    lazy: true,
    tabBarOptions: compTabBarOptions,
});*/

const EditingStack = createStackNavigator({
    AdminScreen: AdminScreen,
    EditRankingScreen: RankingEditScreen,
},{ headerMode: "none"});


const HomeStack = createStackNavigator({
    Calendar: Calendar,
    HomeScreen: HomeScreen,
    SettingsScreen: SettingsScreen,
    CompetitionScreen: CompetitionScreen,
    /*CompetitionTabs: {
        screen: CompetitionTabs,
        navigationOptions: ({navigation, screenProps}) => ({
            headerRight: <HeaderIcon name="chatbubbles" onPress={() => navigation.navigate("Chat")}/>,
            ...getActiveChildNavigationOptions(navigation, screenProps) //This gets the name of the competition to set it as a title
        }),
    },*/
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