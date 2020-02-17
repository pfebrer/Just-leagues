import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Platform} from 'react-native'

import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import Card from '../UX/Card'
import { MatchWinnerBet, MatchResultBet, MatchGamesTotalBet, isMatchScheduled, isPlayed} from '../betting/MatchBetting'


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

        //YOU CAN NOT BET ON AN OWN MATCH! At least for now... Oh and iOs also doesn't like betting.
        if (Platform.OS == "ios" || this.props.match.playersIDs.indexOf(this.props.currentUser.id) != -1) return null

        let content = isMatchScheduled({match: this.props.match}) || isPlayed({match: this.props.match}) ? (
            [
                <MatchWinnerBet match={this.props.match} competition={this.props.match.context.competition}/>,
                <MatchResultBet match={this.props.match} competition={this.props.match.context.competition}/>,
                <MatchGamesTotalBet match={this.props.match} competition={this.props.match.context.competition}/>
            ]
            
        ) : (
            <Text>{translate("info.you can not place bets until the match is scheduled")}</Text>
        )

        return (
            <Card
                titleIcon="logo-game-controller-a"
                title={translate("cardTitles.match bets")}
                cardContainerStyles={this.props.style}
                >
                {content}
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