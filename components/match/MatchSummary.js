import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'
import { withNavigation } from 'react-navigation'

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

        if (!this.props.match.playersIDs) return <Card loading/>

        let result = this.props.match.result || this.props.defaultResult || this.defaultResult

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers[uid].names) )
        let ranks = this.props.match.playersIDs.map( uid => {
            return this.props.match.context.competition.playersIDs.indexOf(uid) + 1
        })

        let backgroundColor = this.props.match.playedOn ? "#c6e17b" : this.props.match.scheduled ? "#fdd48a" : "#e1947b"

        return (
            <Card
                cardContainerStyles={{paddingTop: 20, backgroundColor}}
                headerStyles={{paddingBottom: 0, height : 0}}
                >
                <TouchableOpacity style={styles.cardContentContainer} onPress={this.goToMatch}>
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

    cardContentContainer: {
        display: "flex",
        flexDirection: "row"
    },

})