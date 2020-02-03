import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity} from 'react-native'

import { translate } from '../../assets/translations/translationManager'

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"
import UpdatableCard from './UpdatableCard'


class MatchResult extends Component {

    constructor(props){
        super(props)

        this.state = {
            pendingUpdate: false,
            selectedBet: undefined
        }
    }

    render() {

        if ( !this.props.match.isBetable || !this.props.match.playersIDs) return null

        let players = this.props.match.playersIDs.map( uid => this.props.match.context.competition.renderName(this.props.relevantUsers[uid].names) )

        return (
            <UpdatableCard
                titleIcon="logo-game-controller-a"
                title={translate("cardTitles.match bets")}
                pendingUpdate={this.state.pendingUpdate}
                onCommitUpdate={this.commitResultToDB}
                >
                <TouchableOpacity style={styles.playerNameView}>
                    <Text style={{...styles.playerNameText, textAlign: "left"}}>{players[0]}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.playerNameView}>
                    <Text style={{...styles.playerNameText,textAlign:"right"}}>{players[1]}</Text>
                </TouchableOpacity>

            </UpdatableCard>
        )
    }
}


const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competitions: state.competitions,
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(MatchResult);

const styles = StyleSheet.create({

})