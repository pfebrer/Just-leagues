import Configurable from "../configurable"
import Firebase from "../../api/Firebase"

import React, {Component} from 'react';
import {ScrollView} from "react-native"
import MatchesDisplay from "../../components/competition/MatchesDisplay";

//This is the parent class of all competitions and contains general flows

export default class Competition extends Component {

    constructor(props){
        super(props);

        //Set all the attributes of the competition as they were provided
        Object.keys(props.competition).forEach( key => {
            this[key] = props.competition[key]
        })

    }

    defineProps = () => {
        //this.props.what will determine which listener is triggered
        this.listeners = {
            main: this.compScreenListener,
            compState: this.compStateListener,
            matches: this.compMatchesListener
        }

        this.renderFuncs = {
            main: this.renderCompScreen,
            compState: this.renderCompState,
            matches: this.renderCompMatches
        }
    }

    componentDidMount(){

        this.defineProps()

        this.activeListener = this.listeners[this.props.what]()

    }

    componentWillUnmount(){
        //Unsubscribe from listeners
        if (this.activeListener) this.activeListener()
    }

    getSetting = (settingKey) => Configurable.getSetting(this.settings, settingKey)

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

    compMatchesListener = () => Firebase.onCompPendingMatchesSnapshot(this.gymID, this.id, (matches) => this.setState({matches}))

    renderCompMatches = () => {

        if (!this.state.matches) return null
        
        return <MatchesDisplay 
            navigation={this.props.navigation} 
            matches={this.state.matches.map( match => ({...match, context: {...match.context, competition: {...this.props.competition, ...this.superCharges} }}) )}/> 
    }

    render(){

        if (!this.renderFuncs) return null

        return this.renderFuncs[this.props.what]()

    }
}
