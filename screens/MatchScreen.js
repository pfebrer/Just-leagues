import React, {Component} from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert} from 'react-native';
import _ from "lodash"
import Firebase from "../api/Firebase"

import {resultIsCorrect} from "../assets/utils/utilFuncs"
import { translate } from '../assets/translations/translationManager';

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../redux/actions"

import { Icon, Toast } from 'native-base';
import HeaderIcon from "../components/header/HeaderIcon"

import TimeInfo from "../components/match/TimeInfo"
import MatchResult from '../components/match/MatchResult';
import Head2Head from "../components/match/Head2Head"
import MatchDiscussion from "../components/match/MatchDiscussion"
import MatchImage from "../components/match/MatchImage"
import MatchBet from '../components/match/MatchBet';

class MatchScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editable: false
        }

        this.defaultResult = [0,0]

    }

    static navigationOptions = ({navigation}) => {
        return {
            title: translate("tabs.match view"),
            //headerRight: <HeaderIcon name="checkmark" onPress={navigation.getParam("commitAllMatchChanges")}/>
        }
    };

    componentDidMount() {

       this.props.navigation.setParams({commitAllMatchChanges: this.commitAllMatchChanges})

       this.grantEditRights()

    }

    grantEditRights = () => {

        console.warn(this.props.currentMatch.context.competition.gymID)

        let editable = 
            //Don't let people edit other people's matches or edit already played matches
            (this.props.currentMatch.playersIDs.indexOf(this.props.currentUser.id) >= 0 && this.props.currentMatch.context.pending)
            //Unless it is an admin of this gym
            || (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.indexOf(this.props.currentMatch.context.competition.gymID) >= 0)
            //Or an app admin
            || this.props.currentUser.admin

        this.setState({editable})
    }

    componentDidUpdate(prevProps){

        if ( (!prevProps.currentMatch && this.props.currentMatch) || (prevProps.currentMatch.id != this.props.currentMatch.id) ){

            //this.listenToMatch()

        } else if ( ! _.isEqual(prevProps.currentUser, this.props.currentUser)) {

            this.grantEditRights()

        }

    }

    commitAllMatchChanges = () => {

        //Does not work fine (not in use right now)!!
        //Update all parameters
        this.updateDBMatchParams(false)

    }

    updateDBMatchParams = (params, callback) => {

        if ( params && params.indexOf("result") >= 0){

            let isResultCorrect = resultIsCorrect(this.props.currentMatch.result, this.props.currentMatch.context.competition.settings["groups"].pointsScheme)

            if (!isResultCorrect){

                Toast.show({
                    text: translate("errors.you entered an invalid result"),
                    type: "danger",
                    duration: 3000
                });

                return false

            } else if ( this.props.currentMatch.context.pending) {
                //If this is the first result for this match we have to submit a new match and delete this pending match

                if ( !this.props.currentMatch.scheduled || ! this.props.currentMatch.scheduled.time){
                    Alert.alert(
                        translate("vocabulary.attention"),
                        translate("questions.has this match been played now?"),
                        [
                        {
                            text: [translate('vocabulary.no'), translate("actions.add the date")].join(". "),
                            style: 'cancel',
                        },
                        {text: translate('vocabulary.yes'), onPress: () => this.submitNewMatch(callback)},
                        ],
                        {cancelable: true},
                    );
                } else {
                    this.submitNewMatch(callback)
                }
                
                return true
            }
            
        }
        
        Firebase.updateDocInfo(this.matchRef, this.props.currentMatch, callback, {merge: true, params, omit: ["context", "playersNames"]})
    }

    submitNewMatch = (callback) => {
        if (this.matchSub) this.matchSub(); //Stop listening to the match (we are going to change its location)

        Firebase.submitNewPlayedMatch(this.props.currentMatch,
        
            () => {

                this.props.setCurrentMatch({context: {...this.props.currentMatch.context, pending: false}}, {merge: true})
                callback()

                //Listen to the match again
                this.listenToMatch()
            }
        )
    }

    render() {

        if (!this.props.currentMatch) return null

        return (
            <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <ScrollView style={styles.mainView} contentContainerStyle={styles.scrollContainer}>
                    <MatchImage match={this.props.currentMatch}/>

                    <MatchResult
                        match={this.props.currentMatch}
                        editable={this.state.editable}
                        defaultResult={this.defaultResult}
                        updateDBMatchParams={this.updateDBMatchParams}/>

                    <TimeInfo
                        match={this.props.currentMatch}
                        editable={this.state.editable}
                        updateDBMatchParams={this.updateDBMatchParams}/>

                    <MatchBet match={this.props.currentMatch}/>
                    
                    <MatchDiscussion match={this.props.currentMatch}/>

                    <Head2Head match={this.props.currentMatch}/>
                    
                </ScrollView>
                
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    competitions: state.competitions,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffec8b33",
    },

    mainView:{
        flex: 1,
        paddingHorizontal: 20
    },

    scrollContainer: {
        paddingVertical: 20
    }

});