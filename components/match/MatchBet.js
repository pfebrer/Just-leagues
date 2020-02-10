import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import Card from '../home/Card'
import { MatchWinnerBet, MatchResultBet, MatchGamesTotalBet } from '../betting/MatchBetting'


class MatchBets extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false,
            selectedBet: undefined
        }
    }

    render() {

        //if ( !this.props.match.isBetable || !this.props.match.playersIDs) return null

        //YOU CAN NOT BET ON AN OWN MATCH! At least for now...
        if (this.props.match.playersIDs.indexOf(this.props.currentUser.id) != -1) return null

        return (
            <Card
                titleIcon="logo-game-controller-a"
                title={translate("cardTitles.match bets")}
                pendingUpdate={this.state.pendingUpdate}
                onCommitUpdate={this.commitResultToDB}
                >
                <MatchWinnerBet match={this.props.match} competition={this.props.match.context.competition}/>
                <MatchResultBet match={this.props.match} competition={this.props.match.context.competition}/>
                <MatchGamesTotalBet match={this.props.match} competition={this.props.match.context.competition}/>

            </Card>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchBets);

const styles = StyleSheet.create({

})