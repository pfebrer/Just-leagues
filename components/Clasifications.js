import React from 'react';
import {ActivityIndicator, ImageBackground, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Groups from "./Groups"
import Challenges from "./Challenges"
import AddMatchModal from "./AddMatchModal"
import AdminAddMatchModal from "./AdminAddMatchModal"
import {firebase, firestore} from "../Firebase"
import {AntDesign} from '@expo/vector-icons';
import {Collections, Documents} from "../constants/CONSTANTS";

export default class Clasifications extends React.Component {
    constructor(props) {
        super(props);
        this.compView = (
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Text>Carregant classificacions</Text>
                <ActivityIndicator size="large"/>
            </View>
        );
        this.state = {
            ranking: [],
            userId: firebase.auth().currentUser.uid,
            compView: this.compView
        };
        this.playersRef = firestore.collection(Collections.PLAYERS);
        this.rankingsRef = firestore.collection(Collections.RANKINGS).doc(Documents.RANKINGS.squashRanking);
        this.matchesRef = firestore.collection(Collections.MATCHES);
        this.groupsRef = firestore.collection(Collections.GROUPS);
        this.playersRef.doc(this.state.userId).get().then((docSnapshot) => {
            let {playerName, currentGroup, admin} = docSnapshot.data();
            this.setState({playerName, admin});
        }).catch(err => {
            alert("No s'ha pogut carregar la informació de l'usuari" + err);
        });
    }

    componentDidMount() {
        this.typeOfComp = firestore.collection(Collections.MONTH_INFO).doc(Documents.MONTH_INFO.typeOfComp).onSnapshot((docSnapshot) => {
            const typeOfComp = docSnapshot.data();
            this.setState({typeOfComp});
        });
        this.ranking = this.rankingsRef.onSnapshot((docSnapshot) => {
            const {ranking, wentUp, wentDown} = docSnapshot.data();
            this.setState({
                ranking,
                wentDown,
                wentUp
            })
        });

    }

    componentDidUpdate(previousProps, previousState) {
        function areEqual(a1, a2) {
            return JSON.stringify(a1) == JSON.stringify(a2);
        }

        if (this.state.typeOfComp && (!areEqual(previousState.typeOfComp, this.state.typeOfComp) || !areEqual(previousState.ranking, this.state.ranking) || !areEqual(previousState.groupsResults, this.state.groupsResults) || !areEqual(previousState.playerName, this.state.playerName))) {
            let compView = null;
            if (this.state.typeOfComp.Groups) {
                compView = <Groups returnGroups={this.returnGroups} ranking={this.state.ranking}
                                   handlePress={this.handlePress}/>;

            } else if (this.state.typeOfComp.Challenges) {
                compView =
                    <Challenges ranking={this.state.ranking} wentUp={this.state.wentUp} wentDown={this.state.wentDown}
                                playerName={this.state.playerName} handlePress={this.handlePress}/>;
            } else if (this.state.typeOfComp.Knockou) {

            }
            let showAddButton = this.state.typeOfComp.Groups || this.state.admin;
            let showEditButton = this.state.admin;

            this.setState({
                compView,
                showAddButton,
                showEditButton
            });
        }
    }


    componentWillUnmount() {
        this.typeOfComp();
        this.ranking();
    };

    toggleAddMatchModal = () => {
        this.setState({
            addMatchModal: !this.state.addMatchModal
        });
    };

    toggleEditingScreen = () => {
        this.props.navigation.navigate("EditingScreen");
    };

    handlePress = ({content, typeOfCell, matchPlayers, iGroup, resultsPositions, fromAddMatchModal, fromChallenges, matchResult}) => {
        if (typeOfCell == "playerNameCell") {
            this.props.navigation.navigate("Stats", {playerName: content})
        } else if (typeOfCell == "pointsCell" || fromAddMatchModal) {
            let oppPoints = this.oppositePoints(content)
            let points = [content, oppPoints]
            this.props.navigation.navigate("MatchModal", {
                matchPlayers,
                points,
                addResult: this.addResult,
                iGroup,
                resultsPositions,
                playerName: this.state.playerName
            })
        } else if (fromChallenges) {
            let points = matchResult
            let iGroup = "Reptes"
            this.props.navigation.navigate("MatchModal", {
                matchPlayers,
                points,
                addResult: this.addResult,
                iGroup,
                playerName: this.state.playerName,
                fromChallenges
            })
        }
    };

    addResult = ({iGroup, resultsPositions, resultInPoints, resultInSets, matchPlayers}) => {
        //Afegir el resultat al grup
        let toUpdate = {};
        let refToDoc;
        let ref;
        if (/^\d+$/.test(iGroup)) {
            let groupResults = this.state.groupsResults[iGroup - 1];
            for (let i = 0; i < 2; i++) {
                groupResults[resultsPositions[i]] = resultInPoints[i];
            }
            toUpdate = {
                results: groupResults,
            };
            ref = this.groupsRef;
            refToDoc = String(iGroup)
        } else {
            toUpdate = {
                matchPlayers,
                matchResult: resultInSets
            };
            ref = firestore.collection(iGroup);
            refToDoc = String(Date.now())
        }
        ref.doc(refToDoc).set(toUpdate).then(
            //Registrar el partit a l'històric
            this.matchesRef.doc(String(Date.now())).set({
                date: Date.now(),
                iGroup,
                matchPlayers,
                matchResult: resultInSets,
            })
        ).then(
            this.setState({addMatchModal: false})
        ).catch((err) => {
            alert("El partit no s'ha guardat correctament\nError: " + err.message)
        })
    };

    oppositePoints = (points) => {
        let pairedPoints = [[7, 1], [6, 2], [5, 3]];
        let oppPoints = ""
        pairedPoints.forEach((pair) => {
            let ind = pair.indexOf(points);
            if (ind >= 0) {
                if (ind === 0) {
                    oppPoints = pair[1];
                } else {
                    oppPoints = pair[0];
                }
            }
        });
        return oppPoints;
    };

    returnGroups = (groupsResults) => {
        this.setState({
            groupsResults: groupsResults
        });
    };

    render() {

        let addMatchModal = this.state.addMatchModal ? this.state.admin ? (
            <AdminAddMatchModal toggleAddMatchModal={this.toggleAddMatchModal} ranking={this.state.ranking}
                                playerName={this.state.playerName} groupsResults={this.state.groupsResults}
                                addResult={this.addResult}/>
        ) : (
            <AddMatchModal toggleAddMatchModal={this.toggleAddMatchModal} ranking={this.state.ranking}
                           playerName={this.state.playerName} groupsResults={this.state.groupsResults}
                           handlePlayerPress={this.handlePress}/>
        ) : null;
        let addMatchButton = this.state.showAddButton ? (
            <TouchableOpacity style={styles.addMatchButton} onPress={this.toggleAddMatchModal}>
                <Text style={styles.addMatchText}>+</Text>
            </TouchableOpacity>
        ) : null;
        let editCompButton = this.state.showEditButton ? (
            <TouchableOpacity style={styles.editCompButton} onPress={this.toggleEditingScreen}>
                <AntDesign name="setting" size={25} color="black"/>
            </TouchableOpacity>
        ) : null;

        return (
            <ImageBackground style={{flex: 1}} source={require("../assets/images/bg.jpg")}>
                <View style={{flex: 1, backgroundColor: "#ffec8b33"}}>
                    {this.state.compView}
                    {addMatchButton}
                    {addMatchModal}
                    {editCompButton}
                </View>
            </ImageBackground>
        );
    }

}

const styles = StyleSheet.create({
    addMatchButton: {
        position: "absolute",
        left: 0,
        top: 0,
        height: 90,
        paddingBottom: 10,
        width: 90,
        paddingRight: 15,
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: 90,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        backgroundColor: "green",
        borderColor: "#00ff0033"
    },
    editCompButton: {
        position: "absolute",
        right: 0,
        top: 0,
        height: 90,
        paddingBottom: 10,
        width: 90,
        paddingLeft: 15,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 90,
        borderLeftWidth: 10,
        borderBottomWidth: 10,
        backgroundColor: "gray",
        borderColor: "#00333333"
    },
    addMatchText: {
        color: "white",
        fontSize: 35
    }
});