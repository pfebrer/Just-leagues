import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableHighlight, View, Text} from 'react-native';
import Groups from "../components/groups/Groups"
import Challenges from "../components/Challenges"
import AddMatchModal from "../components/AddMatchModal"
import AdminAddMatchModal from "../components/AdminAddMatchModal"
import Firebase from "../api/Firebase"

import {oppositePoints} from "../assets/utils/utilFuncs"
import { Icon} from 'native-base';

//Redux stuff
import { connect } from 'react-redux'
import SETTINGS from '../constants/Settings';

class Competition extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            addMatchModal: false,
            typeOfComp: "groups"
        };

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: <TouchableOpacity onPress={() => {navigation.getParam("toggleAddMatchModal")}}>
                            <Icon name="add" style={{ paddingLeft: 20 }} />
                        </TouchableOpacity>, 
            headerRight: <TouchableHighlight onPress={() => {navigation.navigate("EditingScreen")}}>
                            <Icon name="settings" style={{ paddingRight: 20 }} />
                        </TouchableHighlight>
        }
    };

    componentDidMount() {

        /*Firebase.userRef(this.state.userId).get().then((docSnapshot) => {
            let {playerName, currentGroup, admin} = docSnapshot.data();
            this.setState({playerName, admin});
        }).catch(err => {
            alert("No s'ha pogut carregar la informació de l'usuari" + err);
        });*/

        /*this.typeOfComp = Firebase.typeOfCompRef.onSnapshot((docSnapshot) => {
            const typeOfComp = docSnapshot.data();
            this.setState({typeOfComp});
        });*/

        /*this.ranking = Firebase.rankingsRef.onSnapshot((docSnapshot) => {
            debugger;
            const {ranking, wentUp, wentDown} = docSnapshot.data();
            this.setState({
                ranking,
                wentDown,
                wentUp,
            })
        });*/

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

    goToUserProfile = (uid = Firebase.userData.id) => {
        this.props.navigation.navigate("Stats", {uid: uid})
    }

    handlePress = ({content, typeOfCell, matchPlayers, iGroup, resultsPositions, fromAddMatchModal, fromChallenges, matchResult}) => {
        
        if (typeOfCell == "pointsCell" || fromAddMatchModal) {
            let oppPoints = oppositePoints(content)
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
            ref = Firebase.groupsRef;
            refToDoc = String(iGroup)
        } else {
            toUpdate = {
                matchPlayers,
                matchResult: resultInSets
            };
            ref = Firebase.firestore.collection(iGroup);
            refToDoc = String(Date.now())
        }
        ref.doc(refToDoc).set(toUpdate).then(
            //Registrar el partit a l'històric
            Firebase.matchesRef.doc(String(Date.now())).set({
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

    returnGroups = (groupsResults) => {
        this.setState({
            groupsResults: groupsResults
        });
    };

    renderAddMatchModal = (addMatchModal, isAdmin) => {

        if (addMatchModal) {

            return isAdmin ? (
                <AdminAddMatchModal toggleAddMatchModal={this.toggleAddMatchModal} ranking={this.state.ranking}
                                    playerName={this.state.playerName} groupsResults={this.state.groupsResults}
                                    addResult={this.addResult}/>
            ) : (
                <AddMatchModal toggleAddMatchModal={this.toggleAddMatchModal} ranking={this.state.ranking}
                               playerName={this.state.playerName} groupsResults={this.state.groupsResults}
                               handlePlayerPress={this.handlePress}/>
            )
        } else {
            return null;
        }
    }

    renderCompView = (typeOfComp, ranking) => {

        if (!typeOfComp) {
            return null
        } else if (typeOfComp == "groups") {
            return <Groups
                        goToUserProfile={this.goToUserProfile}
                        returnGroups={this.returnGroups}
                        navigation={this.props.navigation}/>;

        } else if (typeOfComp == "chalenges") {
            return <Challenges ranking={this.state.ranking} wentUp={this.state.wentUp} wentDown={this.state.wentDown}
                            playerName={this.state.playerName} handlePress={this.handlePress}/>;
        }

    }

    render() {

        return <View style={styles.container}>
                {this.renderCompView(this.state.typeOfComp)}
                {this.renderAddMatchModal(this.state.addMatchModal, this.state.admin)}
                </View>
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(Competition);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: SETTINGS.appearance.backgroundColor
    },

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