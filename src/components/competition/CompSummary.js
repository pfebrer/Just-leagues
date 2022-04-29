import React, { Component } from 'react'
import { View } from 'react-native'
import { Text, Icon } from 'native-base'
import { connect } from 'react-redux'
import _ from "lodash"
import Card from '../UX/Card'
import { setCurrentCompetition } from '../../redux/actions'
import Firebase from '../../api/Firebase'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'

class CompSummary extends Component {

    goToCompetition = (tab) => {

        //Set the current competition so that the competition screen can know what to render
        this.props.setCurrentCompetition(this.props.competition.id)

        this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name, tab})

    }

    handleHeaderPress = (participating) => {
        if (participating) {
            this.goToCompetition()
        } else {
            Firebase.askToJoinCompetition(this.props.competition.gymID, this.props.competition.id,this.props.uid)
        }
    }

    render() {

        const participating = this.props.activeCompetitions.includes(this.props.competition.id)
        const alreadyAsked = (this.props.competition.playersAskingToJoin || []).includes(this.props.uid)
        const gym = _.find(this.props.gyms, {id: this.props.competition.gymID})

        return (
            <Card
                titleIcon="trophy"
                title={this.props.competition.name}
                onHeaderPress={() => this.handleHeaderPress(participating)}
                actionIcon={participating ? "arrow-forward" : alreadyAsked ? "time" : "person-add"}>
                <View style={{flexDirection: "row", paddingBottom: 10}}>
                    <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                        <Icon as={MaterialCommunityIcons} size={5} name="warehouse"/>
                        <View style={{paddingLeft: 20}}>
                            <Text>{gym ? gym.name : null} </Text>
                        </View>
                    </View>
                    <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                        <Icon as={MaterialIcons} size={5} name="location-on"/>
                        <View style={{paddingLeft: 10}}>
                            <Text>{this.props.competition.settings.general.location} </Text>
                        </View>
                    </View>
                </View>
                <View style={{flexDirection: "row"}}>
                    <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                        <Icon as={MaterialCommunityIcons} size={5} name="run"/>
                        <View style={{paddingLeft: 20}}>
                            <Text>{this.props.competition.sport.replace(/^\w/, (c) => c.toUpperCase())} </Text>
                        </View>
                    </View>
                </View>
            </Card>
        )
    }
}

const mapStateToProps = state => ({
    uid: state.currentUser.id,
    activeCompetitions: state.currentUser.activeCompetitions
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(CompSummary)
