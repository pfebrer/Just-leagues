import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, Pressable} from 'react-native'
import moment from 'moment'

import Card from '../UX/Card'
import { withNavigation } from '../../assets/utils/utilFuncs'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'

import { isMatchScheduled, isPlayed, getMatchColors } from '../betting/MatchBetting'
import { Ionicons } from '@expo/vector-icons'

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

        let players = match.playersIDs.map( uid => match.context.competition.renderName(this.props.relevantUsers, uid) )
        let ranks = match.playersIDs.map( uid => {
            return match.context.competition.playersIDs.indexOf(uid) + 1
        })

        let {bg: backgroundColor, text: textColor} = getMatchColors({match})

        const isMatchPlayed = isPlayed({match})

        let timeInfo =  isMatchPlayed ? match.playedOn : isMatchScheduled({match}) ? match.scheduled.time : match.due

        const ScoreView = ({playerIndex, otherIndex}) => {
            return isMatchPlayed ? <View style={styles.scoreView}>
                <Text style={{...styles.scoreText, ...this.addWinnerLStyles(result, playerIndex, otherIndex)}}>
                    {result[playerIndex]}
                </Text>
            </View> : null
        }

        const PlayerNameView = ({playerIndex, otherIndex}) => {
            return <View style={styles.playerNameView}>
                <Text style={{...styles.playerNameText, ...this.addWinnerLStyles(result, playerIndex , otherIndex), textAlign: "left"}}>
                    {`${players[playerIndex]} (${ranks[playerIndex]})`}
                </Text>
            </View>
        }

        const HourInfo = ({timeInfo}) => {
            return isMatchPlayed ? null : <View style={styles.hourInfoView}>
                <Text style={{...styles.hourInfoText, color: textColor}}>
                    {moment(timeInfo).format("HH:mm")}
                </Text>
            </View>
        }

        return <View style={{...styles.container, backgroundColor, ...this.props.style}}>
            <Pressable onPress={this.goToMatch}>
                <View style={styles.matchWrapper}>
                    <View style={styles.timeInfoView}>
                        <Text style={{...styles.timeInfoText, color: textColor}}>{moment(timeInfo).format("DD MMM")}</Text>
                    </View>
                    <View style={styles.matchResultView}>
                        <View style={styles.playerView}>
                            <PlayerNameView playerIndex={0} otherIndex={1}/>
                            <ScoreView playerIndex={0} otherIndex={1}/>
                        </View>
                        <View style={styles.playerView}>
                            <PlayerNameView playerIndex={1} otherIndex={0}/>
                            <ScoreView playerIndex={1} otherIndex={0}/>
                        </View>
                    </View>
                    <HourInfo timeInfo={timeInfo}/>
                </View>
            </Pressable>
        </View>
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

    matchWrapper: {
        flexDirection: "row",
        alignItems: "center"
    },

    timeInfoView: {
        paddingHorizontal: 10,
    },

    timeInfoText: {
        fontWeight: "bold"
    },

    hourInfoView: {
        paddingHorizontal: 10,
    },

    hourInfoText: {
        fontWeight: "bold"
    },

    matchResultView: {
        flex: 1,
        paddingRight: 5,
    },

    playerView: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    //Players
    playerNameView: {
    },

    playerNameText: {
        fontSize: totalSize(1.5),
        flex: 2
    },

    scoreView: {
    },

    scoreText: {
        fontSize: totalSize(1.5),
        flexDirection: "row",
        justifyContent: "center",
        flex: 1
    }, 

})