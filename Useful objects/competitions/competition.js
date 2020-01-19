import Configurable from "../configurable"
import GroupsCompetition from "./groups"
import Firebase from "../../api/Firebase"

import React, {Component} from 'react';
import {ScrollView} from "react-native"
import MatchesDisplay from "../../components/competition/MatchesDisplay";
import CompStats from "../../components/competition/CompStats";

//This is the parent class of all competitions and contains general flows

export default class Competition extends Configurable {

    constructor(compDict){
        super()

        //Set all the attributes of the competition as they were provided
        Object.keys(compDict).forEach( key => {
            this[key] = compDict[key]
        })

    }

    static turnOnListeners = (currentUser, compID, updateCompetition, updateRelevantUsers) => {

        let listeners = {}
            
        listeners["main"] = Firebase.onCompetitionSnapshot( compID, compData => {

            //Trigger all the additional listeners that the specific competition might have now that we have all the competition's info
            if (listeners["additional"]) listeners["additional"].forEach(listener => listener()) //First we cancel the existing ones

            listeners["additional"] = GroupsCompetition.addListeners.map( listener => listener(compData, updateCompetition))

            //THIS MIGHT BE TOO MUCH (Impose some limit)
            if (listeners["matches"]) listeners["matches"]()
            listeners["matches"] = Firebase.onCompMatchesSnapshot(compData.gymID, compID, (matches) => updateCompetition({matches}))

            if (listeners["pendingMatches"]) listeners["pendingMatches"]()
            listeners["pendingMatches"] = Firebase.onCompPendingMatchesSnapshot(compData.gymID, compID, (pendingMatches) => updateCompetition({pendingMatches}))
            
            //Then, update the competition with the main information (this is the doc information)
            updateCompetition(compData)
        
        })

        listeners["users"] = Firebase.onCompUsersSnapshot(compID, currentUser,relevantUsers => updateRelevantUsers(relevantUsers))

        //Return a function that will turn off all listeners at the same time
        return () => {

            listeners["main"]();

            listeners["matches"]();

            listeners["pendingMatches"]();

            listeners["users"]();
            
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
        } else if (nameDisplaySettings == "Name") {
            return nameObject.firstName
        } else if (nameDisplaySettings == "free"){
            return nameObject.aka
        }
    }

    compMatchesListener = (setState) => Firebase.onCompPendingMatchesSnapshot(this.gymID, this.id, (matches) => setState({matches}))

    renderCompMatches = (state, props) => {

        if (!this.matches) return null
        
        return <MatchesDisplay 
            navigation={props.navigation} 
            matches={[...this.matches, ...this.pendingMatches].map( match => ({...match, context: {...match.context, competition: this }}) )}/> 
    }

    compStatsListener = (setState) => Firebase.onCompMatchesSnapshot(this.gymID, this.id, (matches) => setState({matches}))

    renderCompStats = (props) => {

        if (!this.matches) return null
        
        return <CompStats 
            navigation={props.navigation} 
            matches={this.matches.map( match => ({...match, context: {...match.context, competition: this }}) )}/> 
    }

}
