import React, { Component } from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import { Icon } from 'native-base'
import { connect } from "react-redux";

import Card from "../UX/Card"
import { setCurrentCompetition } from "../../redux/actions";


class CompetitionState extends Component {

    static _type = "competition"

    static getKey = ({compID}) => `competition${compID}`

    goToCompetition = (tab) => {

        //Set the current competition so that the competition screen can know what to render
        this.props.setCurrentCompetition(this.props.competition.id)

        this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name, tab})

    }

    goToCompChat = () => {

        this.props.setCurrentCompetition(this.props.competition.id)
        this.props.navigation.navigate("Chat")
    }

    render(){

        if (!this.props.competition) return <Card loading/>

        return (
            <Card
                titleIcon="trophy"
                title={this.props.competition.name}
                onHeaderPress={this.goToCompetition}
                actionIcon="add">
                    {this.props.competition.renderCompState({uid: this.props.uid, navigation: this.props.navigation})}
                    <View style={styles.competitionStateActions}>
                        <Icon name="chatbubbles" onPress={this.goToCompChat}/>
                        {/*<Icon name="stats" onPress={() => this.goToCompetition("stats")}/>*/}
                    </View>
            </Card>
        )

    }
}

const mapStateToProps = state => ({
    uid: state.currentUser.id,
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(CompetitionState)

const styles = StyleSheet.create({

    competitionStateActions: {
        flexDirection: "row",
        paddingTop: 20,
        justifyContent: "space-around",
        alignContent: "center"
    }

});