import React, {Component} from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import _ from "lodash"
import Firebase from "../api/Firebase"
import {Collections, Subcollections} from "../constants/CONSTANTS";

import {pointsToSets, setsToPoints, resultIsCorrect} from "../assets/utils/utilFuncs"
import { translate } from '../assets/translations/translationManager';

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../redux/actions"

import PressPicker from '../components/match/PressPicker';
import { Icon, Toast } from 'native-base';
import { h, totalSize } from '../api/Dimensions';
import Card from '../components/home/Card';
import HeaderIcon from "../components/header/HeaderIcon"
import TimeInfo from "../components/match/TimeInfo"
import MatchResult from '../components/match/MatchResult';

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
            headerRight: <HeaderIcon name="checkmark" onPress={navigation.getParam("commitAllMatchChanges")}/>
        }
    };

    listenToMatch = () => {

        if (this.matchSub) this.matchSub();

        let {gymID, id: compID} = this.props.currentMatch.context.competition
        let { matchID } = this.props.currentMatch.context

        this.gymID = gymID, this.compID = compID, this.matchID = matchID

        if (this.props.currentMatch.context.pending){
            //Listen to the pendingMatch

            this.matchSub = Firebase.onPendingMatchSnapshot(this.gymID, this.compID, this.matchID,
            
                (match, docSnapshot) => {

                    this.matchRef = docSnapshot.ref

                    this.props.setCurrentMatch( {...match, result: match.result || this.defaultResult}, {merge: true} )

                    this.grantEditRights()
    
                }
    
            );

        } else {
            //Listen to the match
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
            || (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.indexOf(this.gymID) >= 0)
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

            }
            
        }

        Firebase.updateDocInfo(this.matchRef, this.props.currentMatch, callback, merge = true, params = params, omit = ["context"])
    }

    editResult = (editableResult) => {
        debugger;
        if (editableResult) {
            const addResult = this.props.navigation.getParam('addResult', "");
            const iGroup = this.props.navigation.getParam('iGroup', "");
            const resultsPositions = this.props.navigation.getParam('resultsPositions', []);
            const matchPlayers = [this.matchPlayers[0][1], this.matchPlayers[1][1]]
            const editedResults = this.editedResults
            if (resultIsCorrect(editedResults)) {
                const resultInPoints = setsToPoints(editedResults)
                addResult({iGroup, resultsPositions, resultInPoints, resultInSets: editedResults, matchPlayers})
                this.setState({
                    resultSubmitted: true,
                    editableResult: false,
                });
                this.props.navigation.navigate("Classifications")
            } else {
                alert(translate("errors.impossible result"))
            }

        }
        this.setState({
            editableResult: !editableResult
        })
    }

    render() {

        return (
            <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <ScrollView style={styles.mainView} contentContainerStyle={styles.scrollContainer}>
                    <Card
                        titleIcon="images"
                        title="Foto commemorativa">
                        
                    </Card>

                    <MatchResult
                        editable={this.state.editable}
                        defaultResult={this.defaultResult}
                        updateDBMatchParams={this.updateDBMatchParams}/>

                    <TimeInfo
                        editable={this.state.editable}
                        updateDBMatchParams={this.updateDBMatchParams}/>
                    
                    <Card
                        titleIcon="chatboxes"
                        title="Discussió">
                        
                    </Card>

                    <Card
                        titleIcon="filing"
                        title="Història">
                        
                    </Card>
                    
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
    IDsAndNames: state.IDsAndNames
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