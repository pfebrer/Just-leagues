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

class HomeScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                ...elevation(2),
                backgroundColor: navigation.getParam("backgroundColor"),
              },
            headerLeft: navigation.getParam("isAdmin", false) ? <HeaderIcon name="clipboard" onPress={() => {navigation.navigate("AdminScreen")}} /> : null,
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false
        }
    }

    componentDidMount() {

        this.props.navigation.setParams({
            backgroundColor: this.props.backgroundColor,
            isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
        })

    }

    componentDidUpdate(prevProps){

        let currentbackCol = this.props.backgroundColor

        //Update the header color when the background color is updated :)
        if ( prevProps.backgroundColor !== currentbackCol){
            this.props.navigation.setParams({backgroundColor: currentbackCol})
        }

        if ( ! _.isEqual(prevProps.currentUser.gymAdmin, this.props.currentUser.gymAdmin)
            || ( prevProps.currentUser.admin != this.props.currentUser.admin) ) {

            this.props.navigation.setParams({
                isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
            })

        }
    }

    render() {

        // This is meant to be a setting, but for now we are hard coding it.
        // The only reason is because it's hard to figure out the best way to incorporate
        // newly developed cards to the settings of users.
        const homeCards = [
            ...(["notifications", "pendingMatches", "admin"].map(type => ({type}))),
            ...this.props.currentUser.activeCompetitions.map(compID => ({
                type: "competition", 
                props: {competition: this.props.competitions[compID], compID: compID}
            }))
        ]

        return (
            <ScrollView 
                style={{...styles.container, backgroundColor: this.props.backgroundColor}}
                contentContainerStyle={{paddingVertical: 10}}>

                {homeCards.map(({type, props}) => 
                    <HomeCard 
                        key={HomeCard.getKey(type, props)}
                        type={type}
                        navigation={this.props.navigation}
                        {...props}
                    />)
                }

            </ScrollView>
        )
    }

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