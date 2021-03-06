import React from "react"
import {View} from "react-native"

import Competition from "./competition"
import Firebase from "../../api/Firebase"
import GroupsBetting from "../../components/betting/GroupsBetting"
import Groups from "../../components/groups/Groups"
import Table from "../../components/groups/Table"
import { translate } from "../../assets/translations/translationWorkers"
import { sortPlayerIndices } from "../../assets/utils/utilFuncs"

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

        return <Groups
            competition={this}
            //competition={_.pick(this, ["renderName", "name", "playersIDs", "settings", "getMatch", "getSortedIndices", "getGroupMatches", "id", "gymID"])}
            groups={this.groups} 
            navigation={props.navigation}
        />
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

    renderCompBetting = () => {

        return {props: {competition: this, groups: this.groups}, Component: GroupsBetting }
    }

    //----------------------------------------------
    //                  HELPERS
    //----------------------------------------------
    
    getNewRanking = () => {

        const nPromoting = this.getSetting("nPromotingPlayers")

        if (!this.groups) return null
        //Returns how the ranking of the competition will look in the next period given the actual results
        let newRanking = _.sortBy(this.groups, "order").reduce((newRanking, group, i) => {

            let sortedPlayerIDs = this.getSortedIndices(group).map(i => group.playersIDs[i])

            //If it is the first group there is still no ranking to manipulate, just add the sorted players
            if (i == 0) return sortedPlayerIDs

            //Add the ascending players in front of the players from previous group that will descend
            newRanking.splice(-nPromoting, 0, ...sortedPlayerIDs.slice(0, nPromoting) )

            //Add now the players that are not ascending
            return [...newRanking, ...sortedPlayerIDs.slice(nPromoting)]
        }, [])

        return newRanking
    }

    getPlayerGroup = (uid) => {

        return _.find( this.groups, (group) => group.playersIDs.indexOf(uid) != -1)
    }

    getGroupTotals = ({playersIDs, scores}) => {

        return _.chunk(scores, playersIDs.length).map( playerScores => playerScores.reduce((a, b) => a + b, 0) )
    }

    getSortedIndices = ({playersIDs, scores}) => {
        
        scores = _.chunk(scores, playersIDs.length);
        let totals = scores.map( playerScores => playerScores.reduce((a, b) => a + b, 0) )
    
        return sortPlayerIndices(playersIDs, scores, totals, this.getSetting("untyingCriteria"))

    }

    getGroupMatches = (groupID) => {
        return this.matchesWithContext([...this.matches, ...this.pendingMatches].filter( match => match.context.group.id == groupID))
    }

    getPeriodMatches = () => {
        
        if (!this.groups) return []

        return this.groups.reduce((matches, group) => {return [...matches, ...this.getGroupMatches(group.id)]}, [])
    }

    adminCompSummary = () => {

        let groupedPending = _.groupBy(this.pendingMatches, "scheduled")

        const nPending = this.pendingMatches.length
        const nPeriod = this.getPeriodMatches().length

        return [

            {
                name: undefined ,
                attributes: [
                    {icon: "people", name: translate("vocabulary.players"), "value": this.playersIDs.length},
                    ...(this.additionalCompSummary ? this.additionalCompSummary() : [])
                ]
            },

            {
                name: translate("tabs.matches"),
                attributes: [
                    {icon: "alert", "name": translate("vocabulary.pending matches"), value: this.pendingMatches ? `${nPending}/${nPeriod} (${((nPending/nPeriod)*100).toFixed()} %)` : "..."}
                ]
            },
            
        ]
    }

}