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

    compScreenListener = (callback) => Firebase.onGroupsSnapshot(this.gymID, this.id, callback);

    renderCompScreen = ({navigation, listenerResult: groups}) => {
        return <Groups competition={this} groups={groups} navigation={navigation}/>
    }

    compStateListener = (uid, callback) => Firebase.onPlayerGroupSnapshot(this.gymID, this.id, uid, callback)

    renderCompState = ({navigation, listenerResult}) => {
        return <Table
            {...listenerResult}
            competition={this}
            navigation={navigation}
        />
    }

    getSortedIndices = () => {
        console.warn("Jeje, here you go")
    }

}