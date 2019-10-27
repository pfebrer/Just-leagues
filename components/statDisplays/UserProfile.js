import React from 'react';
import {ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import PlayerCard from "./PlayerCard"
import Strike from "./Strike"
import DetailedStats from "./DetailedStats"
import MatchLength from "./MatchLength"
import Firebase from "../../api/Firebase"
import BestWorstRival from './BestWorstRival';


export default class PlayerProfile extends React.Component {

    constructor(props) {
        super(props)

        this.state = {}

    }

    getUserProfile = (uid) => {

        Firebase.userRef(uid).get()
        .then((docSnapshot) => {
            this.setState({userProfile: docSnapshot.get("profile")})
        })
        .catch(err => console.warn(err))

    }

    componentDidMount() {
        this.getUserProfile(this.props.uid)
    }

    componentDidUpdate(prevProps, prevState) {

        if (prevProps.uid != this.props.uid){
            this.getUserProfile(this.props.uid)
        }
        
    }

    componentWillUnmount() {
    }

    hidePWModal = () => {
        this.setState({
            changePW: false,
        })
    }

    render() {

        console.warn(this.props.uid)

        return null
        /*console.warn(this.state.userData)
        
        return (
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
        );*/
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