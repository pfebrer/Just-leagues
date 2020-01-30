import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"
import Groups from "../../components/groups/Groups"
import Table from "../../components/groups/Table"
import { translate } from "../../assets/translations/translationManager"
import { sortPlayerIndices } from "../../assets/utils/utilFuncs"

import _ from "lodash"

export default class GroupsCompetition extends Competition {

    constructor(compDict){
        super(compDict);

        setTimeout( this.getNewRanking , 3000 )

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

    additionalCompSummary = () => {

        return [
            {icon: "trophy", name: translate("vocabulary.groups"), value: this.groups ? this.groups.length : "..."}
        ]
    }

    //----------------------------------------------
    //                  HELPERS
    //----------------------------------------------
    
    getNewRanking = () => {

        if (!this.groups) return null
        //Returns how the ranking of the competition will look in the next period given the actual results
        let newRanking = _.sortBy(this.groups, "order").reduce((newRanking, group) => {

            let sortedIs = this.getSortedIndices(group)

            return [...newRanking, ...sortedIs.map(i => group.playersIDs[i])]
        }, [])

        return newRanking
    }

    getPlayerGroup = (uid) => {

        return _.find( this.groups, (group) => group.playersIDs.indexOf(uid) != -1)
    }

    getSortedIndices = ({playersIDs, scores}) => {
        

        scores = _.chunk(scores, this.playersIDs.length);
        let totals = scores.map( playerScores => playerScores.reduce((a, b) => a + b, 0) )
    
        return sortPlayerIndices(playersIDs, scores, totals, this.getSetting("untyingCriteria"))

    }

}