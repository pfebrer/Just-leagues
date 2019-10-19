import React from 'react';
import {ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PlayerCard from "../components/PlayerCard"
import Strike from "../components/statDisplays/Strike"
import DetailedStats from "../components/statDisplays/DetailedStats"
import MatchLength from "../components/statDisplays/MatchLength"
import Firebase from "../api/Firebase"
import BestWorstRival from '../components/statDisplays/BestWorstRival';
import ChangePWModal from '../components/ChangePWModal';


export default class Stats extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerName: "",
            playerMatches: []
        }

        this.userId = Firebase.auth.currentUser.uid;
    }

    componentDidMount() {

        /*Firebase.userRef(this.userId).get()
        .then((docSnapshot) => {
            let {playerName} = docSnapshot.data()
            if (this.state.playerName == "... ...") {
                this.setState({playerName, currentUserName: playerName})
            } else {
                this.setState({currentUserName: playerName})
            }
        })
        .catch(err => {
            alert("No s'ha pogut carregar la informació de l'usuari", err);
        });

        Firebase.matchesRef.orderBy("date").get().then((querySnapshot) => {
            let playerMatches = [];
            querySnapshot.forEach((doc) => {
                const {matchPlayers, matchResult, iGroup} = doc.data()
                let playerName = this.state.playerName
                const iPlayer = matchPlayers.indexOf(playerName);
                if (iPlayer >= 0) {
                    const iRival = iPlayer == 0 ? 1 : 0;
                    const matchWon = matchResult[iPlayer] > matchResult[iRival] ? true : false;
                    playerMatches.push({
                        rival: matchPlayers[iRival],
                        rivalSets: matchResult[iRival],
                        playerSets: matchResult[iPlayer],
                        matchWon,
                        iGroup
                    })
                }
            });
            this.setState({playerMatches: playerMatches.reverse()});
        }).catch(err => {
            alert("Hi ha problemes per carregar les estadístiques\nError: " + err.message)
        })*/
    }

    componentDidUpdate(prevProps, prevState) {
        /*if (prevState.playerName !== this.state.playerName) {
            this.unsub = Firebase.matchesRef.orderBy("date").onSnapshot((querySnapshot) => {
                let playerMatches = [];
                querySnapshot.forEach((doc) => {
                    const {matchPlayers, matchResult, iGroup} = doc.data()
                    let playerName = this.state.playerName
                    const iPlayer = matchPlayers.indexOf(playerName);
                    if (iPlayer >= 0) {
                        const iRival = iPlayer == 0 ? 1 : 0;
                        const matchWon = matchResult[iPlayer] > matchResult[iRival] ? true : false;
                        playerMatches.push({
                            rival: matchPlayers[iRival],
                            rivalSets: matchResult[iRival],
                            playerSets: matchResult[iPlayer],
                            iGroup,
                            matchWon
                        })
                    }
                });
                this.setState({playerMatches: playerMatches.reverse()});
            })
        }*/
    }

    componentWillUnmount() {
        this.unsub();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let playerName = nextProps.navigation.getParam("playerName", "")
        let lastPlayerName = prevState.playerName;
        if (playerName && playerName != lastPlayerName) {
            return {playerName};
        } else if (!lastPlayerName) {
            return {playerName: "... ..."}
        } else return null;
    }

    hidePWModal = () => {
        this.setState({
            changePW: false,
        })
    }

    render() {
        let playerName = this.state.playerName;
        let changePWModal = this.state.changePW ? (
            <ChangePWModal hidePWModal={this.hidePWModal}/>
        ) : null;
        return (
            <ImageBackground style={{flex: 1}} source={require("../assets/images/bg.jpg")}>
                <View style={styles.container}>
                    <PlayerCard playerName={playerName} playersRef={Firebase.playersRef}
                                //userRef={Firebase.playersRef.doc(this.userId)}
                                currentUserName={this.state.currentUserName}/>
                    <ScrollView style={styles.statsScrollView}>
                        <Strike playerMatches={this.state.playerMatches}/>
                        <View style={styles.statTitleView}>
                            <Text style={styles.statTitleText}>Estadístiques globals:</Text>
                        </View>
                        <DetailedStats playerMatches={this.state.playerMatches}/>
                        <View style={styles.statTitleView}>
                            <Text style={styles.statTitleText}>Segons durada del partit:</Text>
                        </View>
                        <MatchLength playerMatches={this.state.playerMatches}/>
                        <View style={styles.statTitleView}>
                            <Text style={styles.statTitleText}>Rivals més rellevants:</Text>
                        </View>
                        <BestWorstRival playerMatches={this.state.playerMatches}/>
                    </ScrollView>
                </View>
                <View style={styles.sessionOptions}>
                    <TouchableOpacity style={styles.changePWButton} onPress={() => {
                        this.setState({
                            changePW: true,
                        })
                    }}>
                        <Text style={styles.changePWText}>Canvia la contrasenya</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logOutButton} onPress={() => {
                        Firebase.auth.signOut().then().catch((error) => {
                            alert(error.message)
                        })
                    }}>
                        <Text style={styles.logOutText}>Tanca Sessió</Text>
                    </TouchableOpacity>
                </View>
                {changePWModal}
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "#ffec8b33",
        paddingTop: 30,
    },
    statsScrollView: {
        flexGrow: 1,
    },
    statTitleView: {
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: "center",
        justifyContent: "center"
    },
    statTitleText: {
        fontSize: 16,
        fontFamily: "bold",
        color: "black"
    },
    sessionOptions: {
        height: 40,
        flexDirection: "row"
    },
    logOutButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red"
    },
    logOutText: {
        color: "white",
        fontFamily: "bold"
    },
    changePWButton: {
        flex: 1,
        backgroundColor: "#f0e837",
        alignItems: "center",
        justifyContent: "center",
    },
    changePWText: {
        color: "black",
        fontFamily: "bold"
    },


});