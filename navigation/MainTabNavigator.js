import React from 'react';
import {createBottomTabNavigator, createStackNavigator} from 'react-navigation';
import Stats from "../components/Stats";
import Classifications from "../components/Clasifications";
import MatchModal from "../components/MatchModal";
import EditingScreen from "../components/EditingScreen";
import GroupChat from "../components/GroupChat";
import MatchSearcher from "../components/MatchSearcher";
import {AntDesign, Entypo, Ionicons} from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const ClasifStack = createStackNavigator({
    Classifications: Classifications,
    MatchModal: MatchModal,
    EditingScreen: EditingScreen
}, {
    headerMode: "none",
    mode: "modal"
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
            screen: GroupChat,
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
        }
    },
    {initialRouteName: "GroupChat"},
    {
        tabBarOptions: {
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            activeBackgroundColor: "#cccccc4D",
            inactiveBackgroundColor: "#ffffff00"
        }
    }
);