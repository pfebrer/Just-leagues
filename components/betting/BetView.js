import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'

import { w, h, totalSize} from '../../api/Dimensions';
import { elevation } from '../../assets/utils/utilFuncs'
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import NumericInput from '../inputs/NumericInput'
import Colors from '../../constants/Colors'
import { betHelpers } from '../../api/BetManager'

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
                bet:{},
                quantity: 1
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
                odds: betHelpers[type].odds(),
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

        renderHeader = () =>{

        }

        renderContent = () =>{
            
        }
    
        render(){

            const betClosed = checkIfBetClosed(this.props)
            const betObject = this.props.bet || this.state
            const betState =  betObject.bet
            const onBetChange = this.props.onBetChange || ( (updates) => this.setState(updates) ) 
    
            const footer = this.props.bet ?  
                null : betClosed ? (
                    <View style={{...styles.disabledBetView, flexDirection: "row" }} disabled>
                        {this.state.outcome ? 
                            <Text style={this.state.outcome > 0? styles.positiveOutcomeText : styles.negativeOutcomeText}>
                                {(this.state.outcome > 0 ? "+" : "") + this.state.outcome}
                            </Text> 
                            : <Text style={styles.betsClosedText}>{translate("info.bets closed")}</Text> }     
                    </View>
                ) : (
                    <View style={styles.betSubmiterView}>
                        <View style={styles.betQuantityView}>
                            <NumericInput
                                key="quantity"
                                value={this.state.quantity}
                                disableTextInput
                                onValueChange={(value)=> value <= 10 ? this.setState({quantity: value}) : null}
                                valueContainerStyle={{...elevation(0)}}
                                leftControlIcon="remove"
                                rightControlIcon="add"/>
                            <NumericInput
                                key="winOutcome"
                                style={{paddingRight: 0}}
                                valueContainerStyle={{...elevation(0)}}
                                disabledValueTextStyle={{color: Colors.WINNER_GREEN_BG, fontFamily: "bold"}}
                                value={betHelpers[type].odds().win * this.state.quantity}
                                disabled />
                        </View>
                        <TouchableOpacity style={styles.groupBetSubmitBut} onPress={this.submitBettingState}>
                            <Text style={styles.groupBetSubmitText}>{betObject.placedOn ? translate("actions.modify") : translate("actions.submit")}</Text>
                        </TouchableOpacity>
                    </View>
                    
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
        paddingLeft: 20,
        paddingRight: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5,
/*         borderWidth: 1,
        backgroundColor: "white",
        ...elevation(2), */
    },

    disabledBetView: {
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
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
    },

    betSubmiterView: {
        flexDirection: "row",
    },

    betQuantityView: {
        flexDirection: "row",
        justifyContent: "flex-start",
        flex:1
    },

    negativeOutcomeText: {
        color: Colors.LOSER_RED_BG,
        fontSize: totalSize(2),
        fontFamily: "bold",
        paddingRight: 10
    },

    positiveOutcomeText: {
        color: Colors.WINNER_GREEN_BG,
        fontSize: totalSize(2),
        fontFamily: "bold",
        paddingRight: 10
    }
})
