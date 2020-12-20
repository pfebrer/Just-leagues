import Configurable from "../configurable"
import GroupsCompetition from "./groups"
import Firebase from "../../api/Firebase"

import React, {Component} from 'react';
import _ from "lodash"
import { translate } from "../../assets/translations/translationManager"
//import {} from "react-native"
import MatchesDisplay from "../../components/competition/MatchesDisplay";
import CompStats from "../../components/competition/CompStats";

//This is the parent class of all competitions and contains general flows

export default class Competition extends Configurable {

    constructor(compDict){
        super()

        defaults = {
            matches: [],
            pendingMatches: []
        }

        allAttrs = {...defaults, ...compDict}

        //Set all the attributes of the competition as they were provided
        Object.keys(allAttrs).forEach( key => {
            this[key] = allAttrs[key]
        })

    }

    static turnOnListeners = (currentUser, compID, updateCompetition, updateRelevantUsers) => {

        let listeners = {}
            
        listeners["main"] = Firebase.onCompetitionSnapshot( compID, compData => {

            //Update the competition with the main information (this is the doc information)
            updateCompetition({...compData, isAdmin: currentUser.gymAdmin && currentUser.gymAdmin.indexOf(compData.gymID) != -1})
            
            //Trigger all the additional listeners that the specific competition might have now that we have all the competition's info
            //if (listeners["additional"]) listeners["additional"].forEach(listener => listener()) //First we cancel the existing ones

            if(!listeners["additional"]){
                listeners["additional"] = GroupsCompetition.addListeners.map( listener => listener(compData, updateCompetition))
            }
            
            //THIS MIGHT BE TOO MUCH (Impose some limit)
            //if (listeners["matches"]) listeners["matches"]()
            if (!listeners["matches"]) {
                listeners["matches"] = Firebase.onCompMatchesSnapshot(compData.gymID, compID, (matches) => updateCompetition({matches}))
            }

            if (!listeners["pendingMatches"]){
                listeners["pendingMatches"] = Firebase.onCompPendingMatchesSnapshot(compData.gymID, compID, (pendingMatches) => updateCompetition({pendingMatches}))
            }
            
            if (!listeners["admins"]) {
                listeners["admins"] = Firebase.onCompAdminsSnapshot(compData.gymID, compID, currentUser,relevantUsers => updateRelevantUsers(relevantUsers))
            }
            
        
        })

        listeners["users"] = Firebase.onCompUsersSnapshot(compID, currentUser,relevantUsers => updateRelevantUsers(relevantUsers))

        //Return a function that will turn off all listeners at the same time
        return () => {

            listeners["main"]();

            listeners["matches"]();

            listeners["pendingMatches"]();

            listeners["users"]();

            listeners["admins"]();
            
            if (listeners["additional"]) listeners["additional"].forEach(listener => listener())
        
        }

    }
    
    renderName = (nameObject) => {
        /* Renders the name of a given user according to the competition's settings */ 

        let nameDisplaySettings = this.getSetting("nameDisplay")

        if (!nameObject){
            return translate("errors.no name")
        } if (nameDisplaySettings == "Name Lastname"){
            return [ nameObject.firstName, nameObject.lastName].join(" ")
        } else if (nameDisplaySettings == "Lastname, Name" ) {
            return [ nameObject.lastName, nameObject.firstName].join(", ")
        } else if (nameDisplaySettings == "Lastname") {
            return nameObject.lastName
        } else if (nameDisplaySettings == "Name") {
            return nameObject.firstName
        } else if (nameDisplaySettings == "Name Lastname (aka)") {
            return [ nameObject.firstName, nameObject.lastName].join(" ") + (nameObject.aka ? "(" + nameObject.aka + ")" : "")
        } else if (nameDisplaySettings == "aka"){
            return nameObject.aka
        }
    }

    compMatchesListener = (setState) => Firebase.onCompPendingMatchesSnapshot(this.gymID, this.id, (matches) => setState({pendingMatches: matches}))

    renderCompMatches = (props) => {

        if (!this.matches) return null
        
        return <MatchesDisplay 
            navigation={props.navigation} 
            matches={this.matchesWithContext([...this.matches, ...this.pendingMatches])}/> 
    }

    compStatsListener = (setState) => Firebase.onCompMatchesSnapshot(this.gymID, this.id, (matches) => setState({matches}))

    renderCompStats = (props) => {

        if (!this.matches) return null
        
        return <CompStats 
            navigation={props.navigation} 
            matches={ this.matchesWithContext(this.matches) }
            competition={this}/> 
    }

    adminCompSummary = () => {

        let groupedPending = _.groupBy(this.pendingMatches, "scheduled")

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
                    {icon: "alert", "name": translate("vocabulary.pending matches"), value: this.pendingMatches ? this.pendingMatches.length : "..."}
                ]
            }
            
        ]
    }

    /* HELPERS */
    matchesWithContext = (matches) => {
        return matches.map( match => ({...match, context: {...match.context, competition: this  }}) ) //_.pick(this, ["renderName", "name", "playersIDs", "gymID", "id", "getSetting"])
    }

    getMatch = (matchID) => {
        return this.matchesWithContext( [ _.find([...this.matches, ...this.pendingMatches], ["id", matchID]) ] )[0]
    }

    getMatches = (matchesIDs) => {
        //Does not return in the same order as IDs where provided!!
        return this.matchesWithContext( [...this.matches, ...this.pendingMatches].filter(match => matchesIDs.indexOf(match.id) > -1) )
    }

    getUserMatches = (uid, pending) => {

        let matches = pending ? this.pendingMatches : pending == false ? this.matches : [...this.matches, ...this.pendingMatches]

        return this.matchesWithContext( matches.filter(match => match.playersIDs.indexOf(uid) > -1) )
        
    }

}
