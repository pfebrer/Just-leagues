import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"
import Groups from "../../components/groups/Groups"
import Table from "../../components/groups/Table"

import { connect } from 'react-redux'

class GroupsCompetition extends Competition {

    constructor(props){
        super(props);


        this.state = {
            ...this.state, //Things coming from Competition initialization
        }

        this.superCharges = {
            renderName: this.renderName,
            getSortedIndices: this.getSortedIndices
        }

    }

    compScreenListener = () => Firebase.onGroupsSnapshot(this.gymID, this.id, (listenerResult) => this.setState({groups:listenerResult}));

    renderCompScreen = () => {

        if (!this.state.groups) return null

        return <Groups competition={{...this.props.competition, ...this.superCharges}} groups={this.state.groups} navigation={this.props.navigation}/>
    }

    compStateListener = () => Firebase.onPlayerGroupSnapshot(this.gymID, this.id, this.props.currentUser.id, (listenerResult) => this.setState({listenerResult}))

    renderCompState = () => {

        if (!this.state.listenerResult) return null

        return <Table
            {...this.state.listenerResult}
            competition={{...this.props.competition, ...this.superCharges}}
            navigation={this.props.navigation}
        />
    }

    getSortedIndices = () => {
        console.warn("Jeje, here you go")
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(GroupsCompetition);