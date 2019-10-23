import React from 'react';
import {ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Firebase from "../api/Firebase"
import ChangePWModal from '../components/ChangePWModal';
import PlayerProfile from '../components/statDisplays/UserProfile';

//Redux stuff
import { connect } from 'react-redux'
import { USERSETTINGS } from "../constants/Settings"

class Stats extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playerMatches: []
        }
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

    static getDerivedStateFromProps(nextProps, prevState) {

        let uid = nextProps.navigation.getParam("uid", "");

        return {uid}

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
        let uid = this.state.uid || this.props.currentUser.id

        return (
            <View style={styles.container}>
                <PlayerProfile uid={uid}/>
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
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(Stats);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: USERSETTINGS.generalAppearance.backgroundColor.default,
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
        flexDirection: "row",
        display: "none"
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