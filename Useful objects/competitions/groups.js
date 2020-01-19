import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"
import Groups from "../../components/groups/Groups"
import Table from "../../components/groups/Table"

import _ from "lodash"

export default class GroupsCompetition extends Competition {

    constructor(compDict){
        super(compDict);

    }

    //Define the specific listeners that we need for this type of competition
    static addListeners = [
        (comp, updateCompetition) => Firebase.onGroupsSnapshot(comp.gymID, comp.id, (groups) => updateCompetition({groups}))
    ]

    compScreenListener = (setState) => Firebase.onGroupsSnapshot(this.gymID, this.id, (groups) => setState({groups}));

    renderCompScreen = (props) => {

        if (!this.groups) return null

        return <Groups competition={this} groups={this.groups} navigation={props.navigation}/>
    }

    compStateListener = (setState, state, props) => Firebase.onPlayerGroupSnapshot(this.gymID, this.id, props.currentUser.id, (listenerResult) => setState({listenerResult}))

    renderCompState = (props) => {

        let playerGroup = this.getPlayerGroup(props.uid)

        if (!playerGroup) return null

        return <Table
            {...playerGroup}
            competition={this}
            navigation={props.navigation}
        />
    }

    //----------------------------------------------
    //                  HELPERS
    //----------------------------------------------
    
    getPlayerGroup = (uid) => {

        return _.find( this.groups, (group) => group.playersIDs.indexOf(uid) != -1)
    }

    getSortedIndices = () => {
        console.warn("Jeje, here you go")
    }

}