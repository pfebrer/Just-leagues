import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'

import { w, h, totalSize} from '../../api/Dimensions';
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import { elevation} from "../../assets/utils/utilFuncs"
import { BetTypes } from '../../api/BetManager'

import _ from "lodash"

import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers,
    bets: state.bets,
})

const mapDispatchToProps = {
    
}

export default function toBetView(BetControlsComponent, type, refTo, checkIfBetClosed){

    class BetView extends Component {
        /* Can act as an independent or managed component*/
    
        constructor(props){
            super(props);
    
            this.state = {
                bet:{}
            }

            this.customFilter = () => true
        }
    
        componentDidMount(){
            
            this.syncStateWithDatabase()
        }
    
        componentDidUpdate(prevProps){
    
            if ( !_.isEqual(prevProps.bets, this.props.bets)){
    
                this.syncStateWithDatabase()
                
            }
    
        }
    
        syncStateWithDatabase = () => {
    
            //We only need to sync the state if it's our responsability, don't do this if it's a managed component
            if (this.props.bet) return null
    
            let relevantBet = _.find(this.props.bets, (bet) => {
                return bet.refTo == refTo(this.props) && bet.type == type && this.customFilter(bet)
            })
    
            if (!_.isEqual(relevantBet, this.state)){
                this.setState(relevantBet)
            }
        }

        setCustomFilter = (customFilter) => { 
            this.customFilter = customFilter 
            this.syncStateWithDatabase()
        }
    
        getBetForSubmit = () => {
    
            return {
                ...this.state,
                type,
                removePreviousBet: this.state.id, //This indicates that the bet was already placed and we need to update it
                refTo: refTo(this.props),
                uid: this.props.currentUser.id,
                placedOn: new Date()
            }
        }
    
        submitBettingState = () => {
    
            let bet = this.getBetForSubmit()
    
            Firebase.submitBets(this.props.competition, [bet], () => console.warn("YEEEEY"))
        }
    
        render(){

            const betClosed = checkIfBetClosed(this.props)
            const betObject = this.props.bet || this.state
            const betState =  betObject.bet
            const onBetChange = this.props.onBetChange || ( (updates) => this.setState(updates) ) 
    
            const footer = this.props.bet ?  
                null : betClosed ? (
                    <TouchableOpacity style={styles.groupBetSubmitBut} disabled>
                        <Text style={styles.betsClosedText}>{translate("info.bets closed")}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.groupBetSubmitBut} onPress={this.submitBettingState}>
                        <Text style={styles.groupBetSubmitText}>{betObject.placedOn ? translate("actions.modify") : translate("actions.submit")}</Text>
                    </TouchableOpacity>
                )
                
                
            return (
                <View>
                    <BetControlsComponent 
                        bet={betState} 
                        betMetadata={betObject} 
                        betClosed={betClosed}
                        onBetChange={onBetChange}
                        setCustomBetFilter={this.setCustomFilter}
                        {...this.props} />
                    {footer}
                </View>
            )

        }

        
        
    }

    return connect(mapStateToProps, mapDispatchToProps)(BetView)
}

const styles = StyleSheet.create({

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

    betsClosedText: {
        fontFamily: "bold",
        textTransform: "uppercase",
        color: "#ccc"
    }
})
