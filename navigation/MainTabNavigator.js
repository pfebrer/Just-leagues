import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';
import Stats from "../components/Stats";
import Classifications from "../components/Clasifications";
import MatchModal from "../components/MatchModal";
import EditingScreen from "../components/EditingScreen";
import GroupChat from "../components/GroupChat";
import MatchSearcher from "../components/MatchSearcher";
import {AntDesign, Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import EditRankingScreen from "../components/ranking/EditRankingScreen";
import {ChatWorkMode, Constants} from "../constants/CONSTANTS";
import { translate } from '../assets/translations/translationManager';


const ClasifStack = createStackNavigator({
    Classifications: Classifications,
    MatchModal: MatchModal,
    EditingScreen: EditingScreen,
}, {
    mode: "modal"
});


//createMaterialTopTabNavigator(RouteConfigs, TabNavigatorConfig);
const chatsStack = createMaterialTopTabNavigator(
    {
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
                    <MaterialCommunityIcons name="tournament" size={20} color={tintColor}/>
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
        Ranking: {
            screen: EditRankingScreen,
            navigationOptions: {
                tabBarLabel: translate("tabs.ranking"),
                tabBarIcon: ({tintColor}) => (
                    <MaterialIcons name="format-list-numbered" size={20} color={tintColor}/>
                )
            }
        }
    },
    {
        initialRouteName: "Competition",
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            activeBackgroundColor: "#cccccc4D",
            inactiveBackgroundColor: "#ffffff00"
        }
    }
);