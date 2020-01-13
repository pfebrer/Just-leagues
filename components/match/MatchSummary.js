import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import Card from '../home/Card'
import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import { totalSize, h} from '../../api/Dimensions'
import { Icon } from 'native-base'


class MatchSummary extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false
        }

        this.defaultResult = [0,0]
    }

    render() {

        if (!this.props.match.playersIDs) return <Card loading/>

        let result = this.props.match.result || this.props.defaultResult || this.defaultResult

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers[uid].names) )
        let ranks = this.props.match.playersIDs.map( uid => {
            return this.props.match.context.competition.playersIDs.indexOf(uid) + 1
        })

        return (
            <Card
                cardContainerStyles={{paddingTop: 20}}
                headerStyles={{paddingBottom: 0, height : 0}}
                childrenContainerStyles={styles.cardContentContainer}
                >
                <Text style={{...styles.playerNameText, textAlign: "left"}}>
                    {"(" + ranks[0] + ") " + players[0]}
                </Text>
                <Text style={{...styles.scoreText, textAlign: "center"}}>
                    {result.join(" - ")}
                </Text>
                <Text style={{...styles.playerNameText, textAlign: "right"}}>
                    {players[1] + " (" + ranks[1] + ")"}
                </Text>
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
        flex: 1
    },

    cardContentContainer: {
        display: "flex",
        flexDirection: "row"
    },

})