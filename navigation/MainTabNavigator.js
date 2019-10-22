import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';

import Stats from "../screens/StatsScreen";
import Classifications from "../screens/CompetitionScreen";
import MatchModal from "../components/MatchModal";
import EditingScreen from "../screens/EditingScreen";
import GroupChat from "../components/GroupChat";
import MatchSearcher from "../screens/MatchSearcherScreen";
import SettingsScreen from "../screens/SettingsScreen";
import RankingEditScreen from "../screens/RankingEditScreen";
import HomeScreen from "../screens/HomeScreen"

import {ChatWorkMode, Constants} from "../constants/CONSTANTS";
import { translate } from '../assets/translations/translationManager';
import {AntDesign, Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';



const EditingStack = createStackNavigator({
    EditingScreen: EditingScreen,
    EditRankingScreen: RankingEditScreen,
},{ headerMode: "none"});

const HomeStack = createStackNavigator({
    HomeScreen: HomeScreen,
    SettingsScreen: SettingsScreen
});

const ClasifStack = createStackNavigator({
    Classifications: Classifications,
    MatchModal: MatchModal,
    EditingStack: EditingStack,
}, {
    mode: "modal"
});

//createMaterialTopTabNavigator(RouteConfigs, TabNavigatorConfig);
const chatsStack = createMaterialTopTabNavigator({
        GroupChat: {
            screen: GroupChat,
            params: {workMode: ChatWorkMode.group},
            navigationOptions: {
                tabBarLabel: "Grup",
                tabBarIcon: ({tintColor}) => (
                    <MaterialCommunityIcons name="tournament" size={20} color={tintColor}/>
                )
            }
        },
        GeneralChat: {
            screen: GroupChat,
            params: {workMode: ChatWorkMode.general},
            navigationOptions: {
                tabBarLabel: "General",
                tabBarIcon: ({tintColor}) => (
                    <MaterialCommunityIcons name="tournament" size={20} color={tintColor}/>
                )
            }
        },
    }, {
        headerMode: "none",
        mode: "modal",
        tabBarOptions: {
            style: {
                paddingTop: Constants.paddingTopHeader   //Padding 0 here
            }
        }
});

export default createBottomTabNavigator({
        Stats: {
            screen: Stats,
            navigationOptions: {
                tabBarLabel: translate("tabs.stats"),
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="ios-stats" size={20} color={tintColor}/>
                )
            }
        },
        Competition: {
            screen: ClasifStack,
            navigationOptions: {
                tabBarLabel: translate("tabs.competition"),
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="md-trophy" size={20} color={tintColor}/>
                )
            }
        },
        Home: {
            screen: HomeStack,
            navigationOptions: {
                tabBarLabel: translate("tabs.home"),
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="md-home" size={20} color={tintColor}/>
                )
            }
        },
        GroupChat: {
            screen: chatsStack,
            navigationOptions: {
                tabBarLabel: translate("tabs.chat"),
                tabBarIcon: ({tintColor}) => (
                    <Entypo name="chat" size={20} color={tintColor}/>
                )
            }
        },
        MatchSearcher: {
            screen: MatchSearcher,

            navigationOptions: {
                tabBarLabel: translate("tabs.matches"),
                tabBarIcon: ({tintColor}) => (
                    <AntDesign name="database" size={20} color={tintColor}/>
                )
            }
        },
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
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            activeBackgroundColor: "#cccccc4D",
            inactiveBackgroundColor: "#ffffff00"
        }
    }
);