import React from 'react';
import {ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ScoreRow from "./ScoreRow"
import MatchHistory from "./MatchHistory"
import {firebase, firestore} from "../Firebase"
import {Collections} from "../constants/CONSTANTS";

export default class MatchModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editableResult: false,
            resultSubmitted: false
        }
        this.editedResults = ["", ""];
        this.playerName = props.navigation.getParam('playerName', null);
        this.matchPlayers = props.navigation.getParam('matchPlayers', []);

        firestore.collection(Collections.PLAYERS).doc(firebase.auth().currentUser.uid).get().then((docSnapshot) => {
            let {playerName, currentGroup, admin} = docSnapshot.data();
            this.setState({playerName, admin});
        }).catch(err => {
            alert("No s'ha pogut carregar la informació de l'usuari", err);
        });
    }

    pointsToSets = (points) => {
        let sets = null;
        if ([7, 6, 5].indexOf(points) >= 0) {
            sets = 3;
        } else if (points == 3) {
            sets = 2;
        } else if (points == 2) {
            sets = 1;
        } else if (points == 1) {
            sets = 0;
        }
        return sets;
    }

    setsToPoints = (setsInp) => {
        let sets = JSON.stringify(setsInp)
        let points;
        if (sets === JSON.stringify([3, 0])) {
            points = [7, 1];
        } else if (sets === JSON.stringify([3, 1])) {
            points = [6, 2];
        } else if (sets === JSON.stringify([3, 2])) {
            points = [5, 3];
        } else if (sets === JSON.stringify([2, 3])) {
            points = [3, 5];
        } else if (sets === JSON.stringify([1, 3])) {
            points = [2, 6];
        } else if (sets === JSON.stringify([0, 3])) {
            points = [1, 7];
        }
        return points;
    }

    getEditedResults = ({pKey, result}) => {
        this.editedResults[pKey] = result
    }

    resultIsCorrect = (result) => {
        let isCorrect = false;
        if ((result[0] == 3 || result[1] == 3) && !(result[0] == 3 && result[1] == 3)) {
            isCorrect = true;
        }
        return isCorrect;
    }

    editResult = (editableResult) => {

        if (editableResult) {
            const addResult = this.props.navigation.getParam('addResult', "");
            const iGroup = this.props.navigation.getParam('iGroup', "");
            const resultsPositions = this.props.navigation.getParam('resultsPositions', []);
            const matchPlayers = [this.matchPlayers[0][1], this.matchPlayers[1][1]]
            const editedResults = this.editedResults
            if (this.resultIsCorrect(editedResults)) {
                const resultInPoints = this.setsToPoints(editedResults)
                addResult({iGroup, resultsPositions, resultInPoints, resultInSets: editedResults, matchPlayers})
                this.setState({
                    resultSubmitted: true,
                    editableResult: false,
                });
                this.props.navigation.navigate("Classifications")
            } else {
                alert("No ens enganyis, aquest resultat és impossible :(")
            }

        }
        this.setState({
            editableResult: !editableResult
        })
    }

    renderAddResultButton = (addResultButton) => {
        let button;
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
                    <TouchableOpacity style={styles.goBackArrowButton} onPress={() => {
                        this.props.navigation.navigate("Classifications")
                    }}>
                        <Text style={styles.goBackArrowText}>Torna</Text>
                    </TouchableOpacity>
                    <TouchableOpacity key="addResultButton" style={resultViewStyle} onPress={() => {
                        this.editResult(this.state.editableResult)
                    }}>
                        <Text style={resultTextStyle}>{text}</Text>
                    </TouchableOpacity>
                </View>
            )
        } else {
            let text = "Torna a les classificacions";
            button = (
                <TouchableOpacity key="goBackButton" style={styles.goBackButton} onPress={() => {
                    this.props.navigation.navigate("Classifications")
                }}>
                    <Text style={styles.goBackText}>{text}</Text>
                </TouchableOpacity>
            )
        }
        return button;
    }

    render() {
        const {navigation} = this.props;

        const matchPlayers = this.matchPlayers;
        const points = navigation.getParam('points', []);
        const fromChallenges = navigation.getParam('fromChallenges', false);
        const sets = fromChallenges ? points : points.map((point) => {
            return this.pointsToSets(point)
        })
        let addResultButton = false;

        if ([7, 6, 5, 3, 2, 1].indexOf(points[0]) < 0) {
            addResultButton = true;
        }

        let matchPlayersText = "(" + matchPlayers[0][0] + ") " + matchPlayers[0][1] + " - " + matchPlayers[1][1] + " (" + matchPlayers[1][0] + ")"
        let mPTFontSize = matchPlayersText.length < 38 ? 17 : (
            matchPlayersText.length < 42 ? 16 : 15
        )

        return (
            <ImageBackground style={{flex: 1}} source={require("./../assets/images/bg.jpg")}>
                <View style={styles.container}>
                    <View style={styles.scoreContainer}>
                        {this.renderAddResultButton(addResultButton)}
                        <View style={styles.matchPlayersView}>
                            <Text style={[styles.matchPlayersText, {fontSize: mPTFontSize}]}>{matchPlayersText}</Text>
                        </View>
                        <ScoreRow sets={this.state.resultSubmitted ? this.editedResults : sets}
                                  onNewResult={this.getEditedResults} editableResult={this.state.editableResult}/>
                    </View>
                    <View style={styles.matchPlayersView}>
                        <Text style={styles.matchPlayersText}>Últims enfrontaments:</Text>
                    </View>
                    <MatchHistory filter={matchPlayers[0][1]} filter2={matchPlayers[1][1]} fromMatchModal={true}/>
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: "#ffec8b33"
    },
    scoreContainer: {
        flex: 2.5,
        alignItems: "center",
        justifyContent: "center",
    },
    matchPlayersView: {
        alignItems: "center",
        justifyContent: "center",
    },
    matchPlayersText: {
        color: "black",
        fontFamily: "bold",
        fontSize: 17,
    },
    addResultButton: {
        flex: 8,
        backgroundColor: "#97f4c3CC",
        alignItems: "center",
        justifyContent: "center",
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    addResultText: {
        color: "black",
        fontSize: 20
    },
    submitResultButton: {
        flex: 8,
        backgroundColor: "#aee789CC",
        alignItems: "center",
        justifyContent: "center",
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    submitResultText: {
        color: "#2d652b",
        fontSize: 20
    },
    goBackButton: {
        backgroundColor: "#01ffec4D",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 20,
    },
    goBackArrowButton: {
        flex: 3,
        backgroundColor: "#cc000080",
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    goBackText: {
        color: "black",
        fontSize: 20
    },
    goBackArrowText: {
        color: "white",
        fontSize: 20,
    },
});