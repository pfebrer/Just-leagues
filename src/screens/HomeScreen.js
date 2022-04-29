import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
} from 'react-native';

//Redux stuff
import { connect } from 'react-redux'

import HeaderIcon from "../components/UX/HeaderIcon"

import HomeCard from "../components/homeCards"

import { elevation } from '../assets/utils/utilFuncs'

import _ from "lodash"
import { selectSuperChargedCompetitions } from '../redux/reducers';
import { selectUserSetting } from '../redux/reducers';

const HomeScreen = (props) => {

    const isAdmin = (props.currentUser.gymAdmin && props.currentUser.gymAdmin.length > 0) || props.currentUser.admin
    const backgroundColor = props.backgroundColor
    const navigation = props.navigation

    React.useEffect(() => {
        navigation.setOptions({
            title: "",
            headerStyle: {
                ...elevation(2),
                backgroundColor: backgroundColor,
            },
            headerLeft: () => isAdmin ? <HeaderIcon name="clipboard" onPress={() => {navigation.navigate("AdminScreen")}} /> : null,
            headerRight: () => <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}}/>
        });
    }, [navigation, isAdmin, backgroundColor]);


    // This is meant to be a setting, but for now we are hard coding it.
    // The only reason is because it's hard to figure out the best way to incorporate
    // newly developed cards to the settings of users.
    const homeCards = [
        ...(["notifications", "pendingMatches", "admin"].map(type => ({type}))),
        ...props.currentUser.activeCompetitions.map(compID => ({
            type: "competition", 
            props: {competition: props.competitions[compID], compID: compID}
        }))
    ]

    return (
        <ScrollView 
            style={{...styles.container, backgroundColor: backgroundColor}}
            contentContainerStyle={{paddingVertical: 10}}>

            {homeCards.map(({type, props}) => 
                <HomeCard 
                    key={HomeCard.getKey(type, props)}
                    type={type}
                    navigation={navigation}
                    {...props}
                />)
            }

        </ScrollView>
    )

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor"),
    competitions: selectSuperChargedCompetitions(state)
})

export default connect(mapStateToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
    },

});