import React, { Component } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Group} from 'react-native'
import { Button } from "native-base"
import Carousel, {Pagination} from 'react-native-snap-carousel';
import Card from "../home/Card"

import { w, h, totalSize} from '../../api/Dimensions';
import Firebase from '../../api/Firebase';
import {translate } from "../../assets/translations/translationManager"
import { elevation} from "../../assets/utils/utilFuncs"
import { BetTypes } from '../../api/BetManager'
import toBetView from './BetView'

import _ from "lodash"

import { connect } from 'react-redux'

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