import React from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import MatchHistory from "../components/matchSearcher/MatchHistory"
import Firebase from "../api/Firebase"
import {Collections} from "../constants/CONSTANTS";

import {pointsToSets, setsToPoints, resultIsCorrect} from "../assets/utils/utilFuncs"
import { translate } from '../assets/translations/translationManager';

//Redux stuff
import { connect } from 'react-redux'
import IDsAndNames from '../redux/reducers/IDsAndNames';
import PressPicker from '../components/match/PressPicker';
import { Icon } from 'native-base';
import { h, totalSize } from '../api/Dimensions';
import Card from '../components/home/Card';
import HeaderIcon from "../components/header/HeaderIcon"
import DatePicker from 'react-native-datepicker'

class MatchScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            match: {},
            newScore1: 0,
            newScore2: 0,
            resultSubmitted: false
        };
        this.editedResults = ["", ""];

    }

    static navigationOptions = ({navigation}) => {
        return {
            title: translate("tabs.match view"),
            headerRight: <HeaderIcon name="checkmark" onPress={navigation.getParam("commitMatchChanges")}/>
        }
    };

    componentDidMount() {

        this.matchSub = Firebase.firestore.doc(this.props.currentMatch.ref).onSnapshot(
            
            match => this.setState({match: match.data()})

        );

    }

    componentDidUpdate(prevProps){

        if ( (!prevProps.currentMatch && this.props.currentMatch) || (prevProps.currentMatch.ref != this.props.currentMatch.ref) ){

            if (this.matchSub) this.matchSub();

            this.matchSub = Firebase.doc(this.props.currentMatch.ref).onSnapshot(
            
                match => this.setState({match: match.data()})
    
            );
        }
    }

    getEditedResults = ({pKey, result}) => {
        this.editedResults[pKey] = result
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

    renderAddResultButton = (addResultButton) => {
        let button = null;
        const matchPlayersNames = [this.matchPlayers[0][1], this.matchPlayers[1][1]]
        if ((addResultButton && !this.state.resultSubmitted && matchPlayersNames.indexOf(this.playerName) >= 0) || this.state.admin) {
            let text = "Afegeix resultat";
            let resultViewStyle = styles.addResultButton;
            let resultTextStyle = styles.addResultText;
            if (this.state.editableResult) {
                text = "CONFIRMA";
                resultViewStyle = styles.submitResultButton;
                resultTextStyle = styles.submitResultText;
            }
            button = (
                <View style={{flexDirection: "row", marginBottom: 20}}>
                    <TouchableOpacity key="addResultButton" style={resultViewStyle} onPress={() => {
                        this.editResult(this.state.editableResult)
                    }}>
                        <Text style={resultTextStyle}>{text}</Text>
                    </TouchableOpacity>
                </View>
            )
        }

        return button;
    }

    render() {

        
        let result = this.state.match.result || [this.state.newScore1, this.state.newScore2]

        return (
            <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <View style={styles.mainView}>
                    <Card
                        titleIcon="baseball"
                        title={translate("vocabulary.match score")}
                        >
                        <View style={styles.playerNameView}>
                            <Text style={{...styles.playerNameText, textAlign: "left"}}>{"(1) " + this.props.IDsAndNames[this.props.currentMatch.player1] || "Sense nom"}</Text>
                        </View>
                        <View style={styles.scoreContainer}>
                            <View style={styles.scoreInputView}>
                                <TouchableOpacity 
                                    style={styles.scoreInputControls}
                                    onPress={() => this.setState({newScore1: this.state.newScore1 - 1})}>
                                    <Icon name="arrow-round-back" style={styles.scoreInputControlsIcon}/>
                                </TouchableOpacity>
                                <View style={styles.scoreValueView}>
                                    <Text style={styles.scoreValue}>{result[0]}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.scoreInputControls}
                                    onPress={() => this.setState({newScore1: this.state.newScore1 + 1})}
                                    >
                                    <Icon name="arrow-round-forward" style={styles.scoreInputControlsIcon}/>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.scoreInputView}>
                                <TouchableOpacity 
                                    style={styles.scoreInputControls}
                                    onPress={() => this.setState({newScore2: this.state.newScore2 - 1})}>
                                    <Icon name="arrow-round-back" style={styles.scoreInputControlsIcon}/>
                                </TouchableOpacity>
                                <View style={styles.scoreValueView}>
                                    <Text style={styles.scoreValue}>{result[1]}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.scoreInputControls}
                                    onPress={() => this.setState({newScore2: this.state.newScore2 + 1})}>
                                    <Icon name="arrow-round-forward" style={styles.scoreInputControlsIcon}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View style={styles.playerNameView}>
                            <Text style={{...styles.playerNameText,textAlign:"right"}}>{(this.props.IDsAndNames[this.props.currentMatch.player2] || "Sense nom") + " (2)"}</Text>
                        </View>

                    </Card>
                    <Card
                        titleIcon="calendar"
                        title="Horari">
                            <DatePicker
                                minDate={new Date()}
                                style={{width: "100%"}}
                                mode="datetime"
                                placeholder={translate("vocabulary.fix a date")}
                                format="DD-MM-YYYY HH:mm"/>
                            <View style={{paddingTop:10}}>
                                <Text style={{textAlign: "center"}}>No hi ha data límit per jugar aquest partit :)</Text>
                            </View>
                        
                    </Card>

                    <Card
                        titleIcon="filing"
                        title="Història">
                        
                    </Card>
                    
                </View>
                
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentMatch: state.match,
    IDsAndNames: state.IDsAndNames
})

export default connect(mapStateToProps)(MatchScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: "#ffec8b33",
    },

    mainView:{
        flex: 1,
    },

    matchScoreView: {
        backgroundColor: "#e3b785",
        borderRadius: 5,
        elevation: 5,
        paddingHorizontal: 20,
    },

    //Players
    playerNameView: {
        width: "100%",
    },

    playerNameText: {
        fontSize: totalSize(2)
    },

    //Scores input
    scoreContainer: {
        flexDirection: "row",
        marginVertical: 10,
    },

    scoreInputView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flex:1
    },

    scoreValueView: {
        elevation: 3,
        backgroundColor: "white",
        height: h(6),
        width: h(6),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },

    scoreValue: {
        fontSize: totalSize(2.5)
    },

    scoreInputControls: {
        padding: 20,
    },

    scoreInputControlsIcon: {
        fontSize: totalSize(1.5)
    },

    //Submit button
    actionButtonsView: {
        marginVertical: 20
    },

    submitButton: {
        backgroundColor: "green",
        elevation: 2,
        paddingHorizontal: 50,
        paddingVertical: 5,
        borderRadius: 2,
    },

    submitButtonIcon: {
        fontSize: totalSize(4),
        color: "white"
    }
});