import React from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ScoreRow from "../components/ScoreRow"
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
                    <View style={styles.playerNameView}>
                        <Text style={styles.playerNameText}>{this.props.IDsAndNames[this.props.currentMatch.player1] || "Sense nom"}</Text>
                    </View>
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
                    <View style={styles.playerNameView}>
                        <Text style={styles.playerNameText}>{this.props.IDsAndNames[this.props.currentMatch.player2] || "Sense nom"}</Text>
                    </View>
                </View>
                
                <View style={styles.actionButtonsView}>
                    <TouchableOpacity style={styles.submitButton}>
                        <Icon name="checkmark" style={styles.submitButtonIcon}/>
                    </TouchableOpacity>
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
        justifyContent: "center",
        alignItems: "center"
    },

    mainView:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    //Players
    playerNameView: {
        marginVertical: 20
    },

    playerNameText: {
        fontFamily: "bold",
        fontSize: totalSize(3)
    },

    //Scores input
    scoreInputView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },

    scoreValueView: {
        elevation: 3,
        backgroundColor: "white",
        height: h(8),
        width: h(8),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },

    scoreValue: {
        fontSize: totalSize(3.5)
    },

    scoreInputControls: {
        padding: 20,
    },

    scoreInputControlsIcon: {
        fontSize: totalSize(4)
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