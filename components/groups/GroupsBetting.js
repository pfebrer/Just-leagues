import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native'
import { Button } from "native-base"
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Card from "../home/Card"

import { w, h, totalSize} from '../../api/Dimensions';
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import { elevation} from "../../assets/utils/utilFuncs"

import _ from "lodash"

import { connect } from 'react-redux'

class GroupBet extends Component {
    /* Can act as an independent or managed component*/

    constructor(props){
        super(props);

        this.state = {}
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

        let groupBet = _.find(this.props.bets, ["refTo", Firebase.groupRef(this.props.competition.gymID, this.props.competition.id, this.props.group.id).path])

        if (!_.isEqual(groupBet, this.state)){
            this.setState(groupBet)
        }
    }

    updateBettingState = (uid, winnerOrLoser, currentState) => {

        /* winnerOrLoser is either 1 if it is a bet that the player will win or -1 if it's a bet that the player will loose */
        
        let newBetState = currentState ? currentState == winnerOrLoser ? {...this.state, [winnerOrLoser]: undefined } : 
            { [winnerOrLoser]: uid } : {...this.state, [winnerOrLoser]: uid }

        this.setState(newBetState)

    }

    getGroupBetForSubmit = () => {

        return {
            ...this.state,
            removePreviousBet: this.state[groupID].id, //This indicates that the bet was already placed and we need to update it
            refTo: Firebase.groupRef(this.props.competition.gymID, this.props.competition.id, this.props.group.id).path,
            uid: this.props.currentUser.id,
            placedOn: new Date()
        }
    }

    submitBettingState = () => {

        let groupBet = this.getGroupBetForSubmit()

        Firebase.submitBets(this.props.competition, [groupBet], () => console.warn("YEEEEY"))
    }

    renderPlayerBettingView = (uid, isLast, groupState, updateState) => {
        
        let bettingState = _.findKey(groupState, obj => obj == uid)

        let addPlayerViewStyles = { [-1]: styles.loser, [1]: styles.winner}[bettingState]
        let addPlayerTextStyles = { [-1]: styles.loserText, [1]: styles.winnerText}[bettingState]

        return <View key={uid} style={{...styles.playerBettingView, ...(isLast ? {borderBottomWidth: 0} : {}), ...addPlayerViewStyles}}>
            <TouchableOpacity 
                style={{...styles.indicatorView, ...styles.winner}}
                onPress={() => updateState(1, bettingState)}>
                
            </TouchableOpacity>
            <View style={styles.playerNameView}>
                <Text style={{...styles.playerNameText, ...addPlayerTextStyles}}>{this.props.competition.renderName(this.props.relevantUsers[uid].names)}</Text>
            </View>
            <TouchableOpacity 
                style={{...styles.indicatorView, ...styles.loser}}
                onPress={() => updateState(-1, bettingState)}>
            </TouchableOpacity>
            
        </View> 
    }

    render(){

        const group = this.props.group
        const betState = this.props.bet || this.state
        const onBetChange = this.props.onBetChange || this.updateBettingState

        return (
            <View>
                <View style={styles.groupView}>
                    {this.props.noHeader ? null : <View style={styles.groupHeaderView}>
                        <View style={styles.groupNameView}>
                            <Text style={styles.groupNameText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
                        </View>
                    </View>}
                    <View style={styles.groupPlayersView}>
                        {group.playersIDs.map( (uid, i) => this.renderPlayerBettingView(uid, i == group.playersIDs.length - 1,
                            betState, (winnerOrLoser, currState) => onBetChange(uid, winnerOrLoser, currState) ))}
                    </View>
                </View>
                {this.props.bet ? null : <TouchableOpacity style={styles.groupBetSubmitBut} onPress={this.submitBettingState}>
                    <Text style={styles.groupBetSubmitText}>{translate("actions.submit")}</Text>
                </TouchableOpacity>}
            </View>
        )
        
        
    }
}

export class GroupsBetting extends Component {

    constructor(props){
        super(props);

        this.state = {}
    }

    syncWithDatabase = () => {

        let groupBets = this.props.groups.reduce((groupBets, group) => {
                
            groupBets[group.id] = _.find(this.props.bets, ["refTo", Firebase.groupRef(this.props.competition.gymID, this.props.competition.id, group.id).path])
            return groupBets
        }, {})

        if (!_.isEqual(groupBets, this.state)){
            this.setState({...groupBets})
        }
    }

    componentDidMount(){
        this.syncWithDatabase()
    }

    componentDidUpdate(prevProps){

        if ( !_.isEqual(prevProps.bets, this.props.bets)){

            this.syncWithDatabase()
            
        }

    }

    submitBettingState = () => {

        let groupBets = Object.keys(this.state).reduce((groupBets, groupID) => {

            if (this.state[groupID]) {
                groupBets.push({
                    ...this.state[groupID],
                    removePreviousBet: this.state[groupID].id, //This indicates that the bet was already placed and we need to update it
                    refTo: Firebase.groupRef(this.props.competition.gymID, this.props.competition.id, groupID).path,
                    uid: this.props.currentUser.id,
                    placedOn: new Date()
                })
            }
        
            return groupBets
        }, []);

        Firebase.submitBets(this.props.competition, groupBets, () => console.warn("YEEEEY"))
    }

    updateBettingState = (groupID, uid, winnerOrLoser, currentState) => {
        /* winnerOrLoser is either 1 if it is a bet that the player will win or -1 if it's a bet that the player will loose */
        
        let newGroupState = currentState ? currentState == winnerOrLoser ? {...this.state[groupID], [winnerOrLoser]: undefined } : 
            { [winnerOrLoser]: uid } : {...this.state[groupID], [winnerOrLoser]: uid }

        this.setState({[groupID]: newGroupState })
    }

    renderGroup = ({item: group}) => {

        return <GroupBet
                    group={group}
                    bet={this.state[group.id] || {}}
                    onBetChange={(uid, wL, curr) => this.updateBettingState(group.id, uid, wL, curr)}
                    {...this.props} 
                    />
    }

    render() {

        return (
            <Card
                title={translate("cardTitles.groups betting")}
                titleIcon="logo-game-controller-a"
                childrenContainerStyles={{justifyContent: "center", alignItems: "center"}}>
                    <Carousel
                    ref={c => this._slider1Ref = c}
                    data={this.props.groups}
                    firstItem={this.state.activeSlide}
                    renderItem={(args) => this.renderGroup(args)}
                    sliderWidth={w(80)}
                    itemWidth={w(70)}
                    inactiveSlideScale={0.94}
                    inactiveSlideOpacity={0.7}
                    // inactiveSlideShift={20}
                    onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                    />
                    <Button onPress={this.submitBettingState}><Text>Submit</Text></Button>
            </Card>
        )
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers,
    bets: state.bets
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsBetting)

GroupBet = connect(mapStateToProps, mapDispatchToProps)(GroupBet)

export {GroupBet}

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
    }
})


