import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, TouchableOpacity} from 'react-native'
import Firebase from "../api/Firebase"
import AntDesign from '@expo/vector-icons/AntDesign';
import {Collections} from "../constants/CONSTANTS";

export default class Challenges extends Component {

    constructor() {
        super()
        this.challengesRef = Firebase.firestore.collection(Collections.CHALLENGE);
        this.state = {
            playedChallenges: [],
            alreadyPlayed: []
        }
    }

    componentDidMount() {
        this.unsub = this.challengesRef.onSnapshot((querySnapshot) => {
            let playedChallenges = []
            querySnapshot.forEach((doc) => {
                let {matchPlayers,matchResult} = doc.data();
                playedChallenges.push({matchPlayers,matchResult})
            });
            this.setState({playedChallenges})
        });
    }

    componentDidUpdate(prevProps,prevState){
        if(prevState.playedChallenges.length != this.state.playedChallenges.length) {
            let alreadyPlayed = [];
            let alreadyPResults = [];
            this.state.playedChallenges.forEach((challenge) => {
                let iSelf = challenge.matchPlayers.indexOf(this.props.playerName);
                if (iSelf >= 0){
                    alreadyPlayed.push(challenge.matchPlayers[iSelf == 0 ? 1 : 0])
                    alreadyPResults.push([challenge.matchResult[iSelf],challenge.matchResult[iSelf == 0 ? 1 : 0]])
                }
            })
            this.setState({alreadyPlayed,alreadyPResults});
        }
    }

    render() {

        let ranking = this.props.ranking;
        let iSelf = ranking.indexOf(this.props.playerName);
        let rankMiddle = Math.floor(ranking.length/2);
        let renderedRanking = ranking.slice(0,rankMiddle).map((player,i) => {
            
            let secI = i+rankMiddle;
            let secPlayer = ranking[secI];
            let iPlayed = this.state.alreadyPlayed.indexOf(player)
            let alreadyPlayed = iPlayed >= 0;
            let secIPlayed = this.state.alreadyPlayed.indexOf(secPlayer)
            let secAlreadyPlayed = secIPlayed >= 0;
            let twoViews = [];
            let array = [{i,player,alreadyPlayed,iPlayed},{i:secI,player:secPlayer,alreadyPlayed:secAlreadyPlayed,iPlayed:secIPlayed}];

            array.forEach(({i,player,alreadyPlayed}) => {
                
                let wentDown = this.props.wentDown.indexOf(player) >= 0;
                let wentUp = this.props.wentUp.indexOf(player) >= 0;

                let addTextStyles = iSelf - i <= 5 && iSelf > i && !alreadyPlayed ? styles.canChallengeText : (
                    i - iSelf <= 5 && i > iSelf && !alreadyPlayed ? styles.canBeChallengedByText : (
                        i != iSelf ? styles.notSignificantText : null
                    )
                );

                let matchResult = ["",""];
                if (alreadyPlayed){
                    matchResult = this.state.alreadyPResults[iPlayed]
                }
                
                let wentUpOrDownIcon = wentUp ? <AntDesign name="arrowup" size={20} color="darkgreen"/> : (
                    wentDown ? <AntDesign name="arrowdown" size={20} color="darkred"/> : null
                )
                let view = Math.abs(i-iSelf) <=5 && i != iSelf ? (
                    <TouchableOpacity key={player+"view"} style={styles.playerView} onLongPress={()=>{
                        this.props.handlePress({
                            fromChallenges:true,
                            matchPlayers:[[iSelf+1,this.props.playerName],[i+1,player]],
                            matchResult: matchResult
                        })}}
                        onPress={()=>{
                        this.props.handlePress({
                            typeOfCell:"playerNameCell",
                            content: player
                        })}}
                        >
                        <Text key={player} style={[styles.playerText,addTextStyles]}> {i+1+". "+player} </Text>
                        {wentUpOrDownIcon}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity key={player+"view"} style={styles.playerView} onPress={()=>{
                        this.props.handlePress({
                            typeOfCell:"playerNameCell",
                            content: player
                        })}}>
                        <Text key={player} style={[styles.playerText,addTextStyles]}> {i+1+". "+player} </Text>
                        {wentUpOrDownIcon}
                    </TouchableOpacity>
                );

                twoViews.push(view)
            });

            return ( 
                <View key={i+" "+secI} style={styles.rankingRow}>
                    {twoViews}
                </View>
                
            )
        })
        return (
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.titleText}> REPTES </Text>
                </View>
                <ScrollView style={styles.scrollView} bounces={true}>
                    {renderedRanking}
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        paddingTop:20,
    },
    titleView:{
        paddingVertical:15,
        justifyContent:"center",
        alignItems:"center"
    },
    titleText: {
        fontFamily: "bold",
        fontSize: 30
    },
    scrollView: {
        flex:1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#ffffff80"
    },
    rankingRow: {
        flexDirection: "row",
        paddingVertical:5,
        justifyContent:"center",
        alignItems:"center"
    },
    playerView:{
        flex:1,
        flexDirection:"row",
    },
    playerText: {
        fontFamily: "bold"
    },
    canChallengeText:{
        color: "darkgreen"
    },
    canBeChallengedByText: {
        color: "darkred"
    },
    notSignificantText:{
        color: "gray"
    }
})
