import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'
import { withNavigation } from 'react-navigation'
import moment from 'moment'

import Card from '../UX/Card'
import Colors from '../../constants/Colors'
import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'

import { isMatchScheduled, isPlayed } from '../betting/MatchBetting'


class MatchSummary extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }

        this.defaultResult = [0,0]
    }

    goToMatch = () => {

        this.props.setCurrentMatch(this.props.match)
        this.props.navigation.navigate("MatchScreen")
    }

    addWinnerLStyles = (result, ownIndex, otherIndex) => {

        return result[ownIndex] > result[otherIndex] ? {
            fontFamily: "bold"
        } : {}
    }

    render() {

        const match = this.props.match

        if (!match.playersIDs) return <Card loading/>

        let result = match.result || this.props.defaultResult || this.defaultResult

        let players = match.playersIDs.map( uid => match.context.competition.renderName(this.props.relevantUsers[uid].names) )
        let ranks = match.playersIDs.map( uid => {
            return match.context.competition.playersIDs.indexOf(uid) + 1
        })

        let backgroundColor = isPlayed({match}) ? Colors.WINNER_GREEN_BG : isMatchScheduled({match}) ? "#fdd48a" : Colors.LOSER_RED_BG

        let timeInfo = isPlayed({match}) ? match.playedOn : isMatchScheduled({match}) ? match.scheduled.time : match.due

        let timeInfoColor = isPlayed({match}) ? Colors.WINNER_GREEN_TEXT : isMatchScheduled({match}) ? "orange" : Colors.LOSER_RED_TEXT

        return (
            <Card
                cardContainerStyles={{paddingTop: 20, backgroundColor}}
                headerStyles={{paddingBottom: 0, height : 0}}
                >
                <TouchableOpacity onPress={this.goToMatch}>
                    <View style={styles.matchResultView}>
                        <Text style={{...styles.playerNameText, ...this.addWinnerLStyles(result, 0 , 1), textAlign: "left"}}>
                            {"(" + ranks[0] + ") " + players[0]}
                        </Text>
                        <View style={{...styles.scoreText}}>
                            <Text style={this.addWinnerLStyles(result, 0 , 1)}>
                                {result[0]}
                            </Text>
                            <Text> - </Text>
                            <Text style={this.addWinnerLStyles(result, 1 , 0)}>
                                {result[1]}
                            </Text>

                        </View>
                        <Text style={{...styles.playerNameText, ...this.addWinnerLStyles(result, 1, 0), textAlign: "right"}}>
                            {players[1] + " (" + ranks[1] + ")"}
                        </Text>
                    </View>
                    <View style={styles.timeInfoView}>
                        <Icon name="time" style={{paddingRight: 20, color: timeInfoColor}}/>
                        <Text style={{color: timeInfoColor}}>{moment(timeInfo).calendar()}</Text>
                    </View>
                    
                </TouchableOpacity>
            </Card>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchSummary);

exports.Table = connect(mapStateToProps, mapDispatchToProps)(withNavigation(MatchSummary));

const styles = StyleSheet.create({
    //Players
    playerNameView: {
        flex: 2,
    },

    playerNameText: {
        fontSize: totalSize(1.5),
        flex: 2
    },

    scoreView: {
        flex: 1,
    },

    scoreText: {
        fontSize: totalSize(1.5),
        flexDirection: "row",
        justifyContent: "center",
        flex: 1
    },

    matchResultView: {
        display: "flex",
        flexDirection: "row"
    },

    timeInfoView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    }

})