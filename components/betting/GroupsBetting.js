import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Group} from 'react-native'

import { w, h, totalSize} from '../../api/Dimensions';
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import { elevation} from "../../assets/utils/utilFuncs"
import { BetTypes } from '../../api/BetManager'
import toBetView from './BetView'
import NumericInput from '../inputs/NumericInput'

import _ from "lodash"

const refToGroup = ({competition, group}) => Firebase.groupRef(competition.gymID, competition.id, group.id).path
const anyResult = ({group}) => group.scores.filter(score => score != false).length != 0

class GroupBet extends Component {

    updateBettingState = (uid, winnerOrLoser, currState) => {

        /* winnerOrLoser is either 1 if it is a bet that the player will win or -1 if it's a bet that the player will loose */
        
        let newBetState = currState ? currState == winnerOrLoser ? {...this.props.bet, [winnerOrLoser]: undefined } : 
            { [winnerOrLoser]: uid } : {...this.props.bet, [winnerOrLoser]: uid }

        this.props.onBetChange({bet: newBetState})

    }

    renderPlayerBettingView = (uid, isLast, groupState, updateState) => {
        
        let bettingState = _.findKey(groupState, obj => obj == uid)

        let addPlayerViewStyles = { [-1]: styles.loser, [1]: styles.winner}[bettingState]
        let addPlayerTextStyles = { [-1]: styles.loserText, [1]: styles.winnerText}[bettingState]

        return <View key={uid} style={{...styles.playerBettingView, ...(isLast ? {borderBottomWidth: 0} : {}), ...addPlayerViewStyles}}>
            <TouchableOpacity
                disabled={this.props.betClosed}
                style={{...styles.indicatorView, ...styles.winner}}
                onPress={() => updateState(1, bettingState)}>
                
            </TouchableOpacity>
            <View style={styles.playerNameView}>
                <Text style={{...styles.playerNameText, ...addPlayerTextStyles}}>{this.props.competition.renderName(this.props.relevantUsers[uid].names)}</Text>
            </View>
            <TouchableOpacity
                disabled={this.props.betClosed}
                style={{...styles.indicatorView, ...styles.loser}}
                onPress={() => updateState(-1, bettingState)}>
            </TouchableOpacity>
            
        </View> 
    }

    render(){

        const group = this.props.group
            
        return (
            <View style={styles.groupView}>
                {this.props.noHeader ? null : <View style={styles.groupHeaderView}>
                    <View style={styles.groupNameView}>
                        <Text style={styles.groupNameText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
                    </View>
                </View>}
                <View style={styles.groupPlayersView}>
                    {group.playersIDs.map( (uid, i) => this.renderPlayerBettingView(uid, i == group.playersIDs.length - 1,
                        this.props.bet, (winnerOrLoser, currState) => this.updateBettingState(uid, winnerOrLoser, currState) ))}
                </View>
            </View>
        )
        
        
    }
}

GroupBet = toBetView(GroupBet, BetTypes.GROUP_BET, refToGroup, anyResult)

class PlayerPointsBet extends Component {
    /* Can act as an independent or managed component*/

    componentDidMount(){
        this.props.setCustomBetFilter((bet) => Object.keys(bet.bet).indexOf(this.props.playerID) == 0) 
    }

    componentDidUpdate(){

        const uid = this.props.playerID
        if ( this.props.bet[uid] == undefined ){
            this.props.onBetChange({bet: {[uid]: 0}})
        }
    }

    render(){

        const uid = this.props.playerID
        const playerName = this.props.competition.renderName(this.props.relevantUsers[uid].names)
            
        return (
            <View style={styles.playerPointsView}>
                <Text style={{flex: 1, fontFamily: "bold", paddingLeft: 10}}>{playerName}</Text>
                <NumericInput
                    style={{paddingRight: 0}}
                    value={this.props.bet[uid]}
                    disabledValueContainerStyle={{marginHorizontal: 20}}
                    disabled={this.props.betClosed} 
                    onValueChange={(value)=>this.props.onBetChange({bet: {[uid]: value}})}/>
            </View>
        )
        
        
    }
}

PlayerPointsBet = toBetView(PlayerPointsBet, BetTypes.PLAYERPOINTS_BET, refToGroup, anyResult)

export {GroupBet, PlayerPointsBet}

const styles = StyleSheet.create({

    groupHeaderView: {
        flexDirection: "row",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        paddingVertical: 10
    },

    indicatorView: {
        width: w(5),
        marginHorizontal: w(2),
        height: w(5),
        ...elevation(2),
        borderRadius: w(5)
    },

    winner: {
        backgroundColor: "#c6e17b"
    },

    loser: {
        backgroundColor: "#e1947b"
    },

    groupNameView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    groupNameText: {
        fontFamily: "bold",
        fontSize: totalSize(1.9),
    },

    groupPlayersView: {

    },

    groupView: {
        marginBottom: 20,
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 1,
        ...elevation(5),
        borderRadius: 10,
        overflow: "hidden",
    },

    playerBettingView: {
        flexDirection: "row",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    bettingButton: {
        width: w(9),
        ...elevation(2),
    },

    notSelectedBettingButton: {
        backgroundColor: "#ccc"
    },

    playerNameView: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 30,
        paddingVertical: 8,
        alignItems: "center",
    },

    winnerText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    loserText: {
        fontFamily: "bold",
        color: "darkred"
    },

    groupBetSubmitBut: {
        marginHorizontal: 30,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
    },

    groupBetSubmitText: {
        fontFamily: "bold",
        textTransform: "uppercase",
        color: "black"
    },

    //PLAYER POINTS
    playerPointsView: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "space-between",
        borderRadius: 2,
        borderWidth: 1,
        backgroundColor: "#ccc",
        ...elevation(2),
        overflow: "hidden",
        paddingVertical: 10,
        alignItems: "center"
    }
})


