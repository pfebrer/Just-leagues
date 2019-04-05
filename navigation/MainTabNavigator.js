import React from 'react';
import {createBottomTabNavigator, createMaterialTopTabNavigator, createStackNavigator} from 'react-navigation';
import Stats from "../components/Stats";
import Classifications from "../components/Clasifications";
import MatchModal from "../components/MatchModal";
import EditingScreen from "../components/EditingScreen";
import GroupChat from "../components/GroupChat";
import MatchSearcher from "../components/MatchSearcher";
import {AntDesign, Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons} from '@expo/vector-icons';
import EditRankingScreen from "../components/ranking/EditRankingScreen";
import {ChatWorkMode, Constants} from "../constants/CONSTANTS";


const ClasifStack = createStackNavigator({
    Classifications: Classifications,
    MatchModal: MatchModal,
    EditingScreen: EditingScreen,
}, {
    headerMode: "none",
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
                tabBarLabel: "Estadístiques",
                tabBarIcon: ({tintColor}) => (
                    <Ionicons name="ios-stats" size={20} color={tintColor}/>
                )
            }
        },
        Classificacions: {
            screen: ClasifStack,
            navigationOptions: {
                tabBarLabel: "Competició",
                tabBarIcon: ({tintColor}) => (
                    <MaterialCommunityIcons name="tournament" size={20} color={tintColor}/>
                )
            }
        },
        GroupChat: {
            screen: chatsStack,
            navigationOptions: {
                tabBarLabel: "Xat",
                tabBarIcon: ({tintColor}) => (
                    <Entypo name="chat" size={20} color={tintColor}/>
                )
            }
        },
        MatchSearcher: {
            screen: MatchSearcher,

            navigationOptions: {
                tabBarLabel: "Partits",
                tabBarIcon: ({tintColor}) => (
                    <AntDesign name="database" size={20} color={tintColor}/>
                )
            }
        },
        Ranking: {
            screen: EditRankingScreen,
            navigationOptions: {
                tabBarLabel: "Ranking",
                tabBarIcon: ({tintColor}) => (
                    <MaterialIcons name="format-list-numbered" size={20} color={tintColor}/>
                )
            }
        }
    },
    {
        initialRouteName: "Classificacions",
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            activeBackgroundColor: "#cccccc4D",
            inactiveBackgroundColor: "#ffffff00"
        }
    }
);