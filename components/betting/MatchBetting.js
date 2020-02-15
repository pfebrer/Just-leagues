import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native'

import { w, h, totalSize} from '../../api/Dimensions';
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import { elevation} from "../../assets/utils/utilFuncs"
import { BetTypes } from '../../api/BetManager'
import toBetView from './BetView'
import Colors from '../../constants/Colors'
import NumericInput from '../inputs/NumericInput'

import _ from "lodash"

const refToMatch = ({match}) => {

    const {gymID, id: compID} = match.context.competition
    
    //Maybe we can keep all references to the pending match, given that no bets will be placed on a played match
    if (true || match.context.pending) return Firebase.pendingMatchRef(gymID, compID, match.id).path
    //else return Firebase.matchRef(gymID, compID, )
}

const isPlayed = ({match}) => !match.context.pending
const isMatchScheduled = ({match}) => match.scheduled && match.scheduled.time
const isBeingPlayed = ({match}) => isMatchScheduled({match}) && match.scheduled.time < new Date()
const isPlayedOrOngoing = ({match}) => isPlayed({match}) || isBeingPlayed({match})

class MatchWinnerBet extends Component {

    render(){

        const match = this.props.match
        const competition = match.context.competition
        const playerNames = match.playersIDs.map(uid => competition.renderName(this.props.relevantUsers[uid].names))
        const addStyles = match.playersIDs.map((uid, index) => this.props.bet == index + 1 ? {
            view: styles.selectedWinnerView , text: styles.selectedWinnerText
        } : {
            view: styles.unselectedView , text: styles.unselectedText
        })
            
        return (
            <View style={styles.betView}>
                <TouchableOpacity
                    disabled={this.props.betClosed} 
                    style={addStyles[0].view}
                    onPress={() => this.props.onBetChange({bet: 1})}
                >
                    <Text style={addStyles[0].text} >{playerNames[0]}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={this.props.betClosed}
                    style={{ ...addStyles[1].view, ...styles.rightView}}
                    onPress={() => this.props.onBetChange({bet: 2})}>
                    <Text style={{...addStyles[1].text}}>{playerNames[1]}</Text>
                </TouchableOpacity>
            </View>
        )
        
        
    }
}

MatchWinnerBet = toBetView(MatchWinnerBet, BetTypes.MATCHWINNER_BET, refToMatch, isPlayedOrOngoing )

class MatchResultBet extends Component {

    componentDidMount(){
        if ( _.isEmpty(this.props.bet) ){
            this.props.onBetChange({bet: [0,0]})
        }
    }

    updateBet = (index, value) => {

        let bet = _.isEmpty(this.props.bet) ? [0,0] : this.props.bet

        this.props.onBetChange({bet: bet.map((oldVal,iVal) => index == iVal ? value : oldVal ) })
    }

    render(){

        const match = this.props.match
        const competition = match.context.competition
        const playerNames = match.playersIDs.map(uid => competition.renderName(this.props.relevantUsers[uid].names))
        let addStyles = match.playersIDs.map((uid, index) => this.props.bet == index + 1 ? {
            view: styles.selectedWinnerView , text: styles.selectedWinnerText
        } : {
            view: styles.unselectedView , text: styles.unselectedText
        })

        addStyles[1].view = {...addStyles[1].view, ...styles.rightView }
            
        return (
            <View style={styles.betView}>
                {playerNames.map( (playerName, i) => {

                    return (
                        <View
                            style={addStyles[i].view}
                        >
                            <NumericInput
                            style={{paddingRight: 0}}
                            value={this.props.bet[i]}
                            disabled={this.props.betClosed}
                            disabledValueContainerStyle={{marginHorizontal: 20}}
                            onValueChange={(value)=>this.updateBet(i, value)}/>
                            <Text style={addStyles[i].text} >{playerName}</Text>
                        </View>
                    )
                })}
            </View>
        )
        
        
    }
}

MatchResultBet = toBetView(MatchResultBet, BetTypes.MATCHRESULT_BET, refToMatch, isPlayedOrOngoing )

class MatchGamesTotalBet extends Component {

    render(){

        return (
            <View style={{...styles.betView, justifyContent: "center", alignItems: "center", paddingVertical: 10}}>
                <View style={{flex:1, paddingLeft: 20}}>
                    <Text style={{fontFamily: "bold"}}>{translate("vocabulary.games")}</Text>
                </View>
                <NumericInput
                    style={{paddingRight: 0}}
                    value={_.isEqual(this.props.bet, {}) ? 0 : this.props.bet}
                    disabled={this.props.betClosed}
                    disabledValueContainerStyle={{marginHorizontal: 20}}
                    onValueChange={(value)=>this.props.onBetChange({bet: value})}/>   
            </View>
        )
        
        
    }
}

MatchGamesTotalBet = toBetView(MatchGamesTotalBet, BetTypes.MATCHGAMESTOTAL_BET, refToMatch, isPlayedOrOngoing )

export {MatchWinnerBet, MatchResultBet, MatchGamesTotalBet, isMatchScheduled, isBeingPlayed, isPlayed, isPlayedOrOngoing}

const styles = StyleSheet.create({
    
    betView: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "space-between",
        borderRadius: 2,
        borderWidth: 1,
        backgroundColor: "#ccc",
        ...elevation(2),
        overflow: "hidden"
    },

    selectedWinnerView: {
        backgroundColor: Colors.WINNER_GREEN_BG,
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
        ...elevation(5)
    },

    selectedWinnerText: {
        color: Colors.WINNER_GREEN_TEXT,
        fontFamily: "bold"
    },

    unselectedView: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
    },

    rightView: {
        borderLeftWidth: 1
    }
})

