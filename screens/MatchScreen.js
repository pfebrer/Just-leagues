import React, {Component} from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView} from 'react-native';
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

import {COMPSETTINGS} from "../constants/Settings";

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

    listenToMatch = () => {

        if (this.matchSub) this.matchSub();

        let { matchID, compID } = this.props.currentMatch.context
        this.competition = this.props.currentMatch.context.competition

        this.matchID = matchID

        if (this.props.currentMatch.context.pending){
            //Listen to the pendingMatch

            this.matchSub = Firebase.onPendingMatchSnapshot(this.competition.gymID, this.competition.id, this.matchID,
            
                (match, docSnapshot) => {

                    this.matchRef = docSnapshot.ref

                    this.props.setCurrentMatch( { ...match, result: match.result || this.defaultResult, context:{...match.context, ...this.props.currentMatch.context}}, {merge: true} )

                    this.grantEditRights()
    
                }
    
            );

        } else {

            this.matchSub = Firebase.onMatchSnapshot(this.competition.gymID, this.competition.id, this.matchID,
            
                (match, docSnapshot) => {

                    this.matchRef = docSnapshot.ref

                    this.props.setCurrentMatch( {...match, context: {...match.context, matchID: this.matchID, competition: this.competition} }, {merge: true} )

                    this.grantEditRights()
    
                }
    
            );
        }

    }

    componentDidMount() {

       this.listenToMatch()

       this.props.navigation.setParams({commitAllMatchChanges: this.commitAllMatchChanges})

    }

    grantEditRights = () => {

        let editable = 
            //Don't let people edit other people's matches or edit already played matches
            (this.props.currentMatch.playersIDs.indexOf(this.props.currentUser.id) >= 0 && this.props.currentMatch.context.pending)
            //Unless it is an admin of this gym
            || (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.indexOf(this.competition.gymID) >= 0)
            //Or an app admin
            || this.props.currentUser.admin

        this.setState({editable})
    }

    componentDidUpdate(prevProps){

        if ( (!prevProps.currentMatch && this.props.currentMatch) || (prevProps.currentMatch.context.matchID != this.props.currentMatch.context.matchID) ){

            this.listenToMatch()

        } else if ( ! _.isEqual(prevProps.currentUser, this.props.currentUser)) {

            this.grantEditRights()

        }

    }

    componentWillUnmount(){
        if (this.matchSub) this.matchSub();
    }

    commitAllMatchChanges = () => {

        //Does not work fine (not in use right now)!!
        //Update all parameters
        this.updateDBMatchParams(false)

    }

    updateDBMatchParams = (params, callback) => {

        if ( params && params.indexOf("result") >= 0){

            let isResultCorrect = resultIsCorrect(this.props.currentMatch.result, COMPSETTINGS.groups.pointsScheme)

            if (!isResultCorrect){

                Toast.show({
                    text: translate("errors.you entered an ivalid result"),
                    type: "danger",
                    duration: 3000
                });

                return false

            } else if ( this.props.currentMatch.context.pending) {
                //If this is the first result for this match we have to submit a new match and delete this pending match

                if (this.matchSub) this.matchSub(); //Stop listening to the match (we are going to change its location)

                Firebase.submitNewPlayedMatch(this.props.currentMatch,
                    
                    () => {

                        this.props.setCurrentMatch({context: {...this.props.currentMatch.context, pending: false}}, {merge: true})
                        callback()

                        //Listen to the match again
                        this.listenToMatch()
                    }
                )
                
                return true
            }
            
        }
        
        Firebase.updateDocInfo(this.matchRef, this.props.currentMatch, callback, {merge: true, params, omit: ["context", "playersNames"]})
    }

    render() {

        return (
            <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <ScrollView style={styles.mainView} contentContainerStyle={styles.scrollContainer}>
                    <MatchImage/>

                    <MatchResult
                        editable={this.state.editable}
                        defaultResult={this.defaultResult}
                        updateDBMatchParams={this.updateDBMatchParams}/>

                    <TimeInfo
                        editable={this.state.editable}
                        updateDBMatchParams={this.updateDBMatchParams}/>
                    
                    <MatchDiscussion/>

                    <Head2Head/>
                    
                </ScrollView>
                
            </View>
        );
    }
}

class ScoreInput extends Component {
    render() {

        return (
            <View style={styles.scoreInputView}>
                <TouchableOpacity 
                    style={styles.scoreInputControls}
                    onPress={() => this.props.updateValue(-1)}>
                    <Icon name="arrow-round-back" style={styles.scoreInputControlsIcon}/>
                </TouchableOpacity>
                <View style={styles.scoreValueView}>
                    <Text style={styles.scoreValue}>{this.props.value}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.scoreInputControls}
                    onPress={() => this.props.updateValue(+1)}
                    >
                    <Icon name="arrow-round-forward" style={styles.scoreInputControlsIcon}/>
                </TouchableOpacity>
            </View>
        )
        
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    competitions: state.competitions,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = dispatch => ({
    setCurrentMatch: (compInfo, config) => dispatch(setCurrentMatch(compInfo, config))
})

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