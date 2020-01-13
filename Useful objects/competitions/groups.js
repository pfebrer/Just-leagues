import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"
import Groups from "../../components/groups/Groups"
import Table from "../../components/groups/Table"

export default class GroupsCompetition extends Competition {

    constructor(compDict){
        super(compDict);

    }

    compScreenListener = (setState) => Firebase.onGroupsSnapshot(this.gymID, this.id, (groups) => setState({groups}));

    renderCompScreen = (state, props) => {

        if (!state.groups) return null

        return <Groups competition={this} groups={state.groups} navigation={props.navigation}/>
    }

    compStateListener = (setState, state, props) => Firebase.onPlayerGroupSnapshot(this.gymID, this.id, props.currentUser.id, (listenerResult) => setState({listenerResult}))

    renderCompState = (state, props) => {

        if (!state.listenerResult) return null

        return <Table
            {...state.listenerResult}
            competition={this}
            navigation={props.navigation}
        />
    }

    getSortedIndices = () => {
        console.warn("Jeje, here you go")
    }

}