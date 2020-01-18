import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"

import Knockout from "../../components/knockout/Knockout"

export default class KnockoutCompetition extends Competition {

    constructor(compDict){
        super(compDict);

    }

    compScreenListener = (setState) => null//Firebase.onGroupsSnapshot(this.gymID, this.id, (groups) => setState({groups}));

    renderCompScreen = (state, props) => {

        return <Knockout competition={this}  navigation={props.navigation}/>
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