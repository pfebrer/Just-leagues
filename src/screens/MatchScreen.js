import React, {Component} from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert, Pressable} from 'react-native';
import _ from "lodash"
import Firebase from "../api/Firebase"

import {resultIsCorrect, isError} from "../assets/utils/utilFuncs";
import { translate } from '../assets/translations/translationWorkers';
import Colors from '../constants/Colors'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../redux/actions"

import { Button, Box, Toast } from 'native-base';

import TimeInfo from "../components/match/TimeInfo"
import MatchResult from '../components/match/MatchResult';
import Head2Head from "../components/match/Head2Head"
import MatchDiscussion from "../components/match/MatchDiscussion"
import MatchImage from "../components/match/MatchImage"
import MatchBet from '../components/match/MatchBet';
import { getMatchColors } from '../components/betting/MatchBetting'

class MatchScreen extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editable: false
        }

        this.defaultResult = [0,0]

    }

    componentDidMount() {
        this.props.navigation.setOptions({
            //title: translate("tabs.match view"),
            title: ""
        })

       this.grantEditRights()

    }

    grantEditRights = () => {

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

            let isResultCorrect = resultIsCorrect(this.props.currentMatch.result, this.props.currentMatch.context.competition.getSetting("pointsScheme"))

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

        const {gymID, id: compID} = this.props.currentMatch.context.competition

        const matchRef = this.props.currentMatch.context.pending ? 
            Firebase.pendingMatchRef(gymID, compID, this.props.currentMatch.id)
            : Firebase.matchRef(gymID, compID, this.props.currentMatch.id)
        
        Firebase.updateDocInfo(matchRef, this.props.currentMatch, callback, {merge: true, params, omit: ["context", "playersNames"]})
    }

    submitNewMatch = async (callback) => {

        const submittedMatch = await Firebase.submitNewPlayedMatch(this.props.currentMatch)

        if ( !isError(submittedMatch) ){
            this.props.setCurrentMatch({context: {...this.props.currentMatch.context, pending: false}}, {merge: true})
            callback()
        }

    }

    onCancelPress = () => {
        Alert.alert(
            translate("vocabulary.attention"),
            translate("questions.are you sure you want to cancel this match?"),
            [
            {
                text: translate('vocabulary.no'),
                style: 'cancel',
            },
            {text: translate('vocabulary.yes'), onPress: this.cancelMatchResult},
            ],
            {cancelable: true},
        );
    }

    cancelMatchResult = async (callback) => {

        const cancelledMatch = await Firebase.cancelPlayedMatchResult(this.props.currentMatch, true)

        if ( !isError(cancelledMatch) ){
            this.props.setCurrentMatch({context: {...this.props.currentMatch.context, pending: true}, result: null}, {merge: true})
            callback()
        }
    }

    render() {

        const match = this.props.currentMatch

        if (!match) return null

        //let {bg: backgroundColor, text: textColor} = getMatchColors({match})
        const backgroundColor = "white"
        const textColor = "black"

        const commonProps = {
            style: {borderColor: textColor, borderWidth: 2},
            match: match,
            editable: this.state.editable,
        }

        return (
            <View style={{...styles.container, backgroundColor}}>
                <ScrollView style={styles.mainView} contentContainerStyle={styles.scrollContainer}>
                    <MatchImage match={match}/>

                    <MatchResult
                        {...commonProps}
                        editable={this.state.editable}
                        defaultResult={this.defaultResult}
                        updateDBMatchParams={this.updateDBMatchParams}
                        />

                    <TimeInfo
                        {...commonProps}
                        updateDBMatchParams={this.updateDBMatchParams}/>

                    <MatchBet {...commonProps}/>
                    
                    <MatchDiscussion {...commonProps}/>

                    <Head2Head {...commonProps}/>
                    
                </ScrollView>

                {this.state.editable && match.context.pending == false ? <View style={styles.cancelContainer}>
                    <Button alignSelf="center" backgroundColor="salmon" onPress={this.onCancelPress}>
                        <Text style={{color: "darkred", fontWeight: "bold"}}>
                            {translate("admin.cancel match result")}
                        </Text>
                    </Button>
                </View> : null}
                
                
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
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
    },

    cancelContainer: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        width: "100%"
    }

});