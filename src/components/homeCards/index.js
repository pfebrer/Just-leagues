import React, { Component } from 'react'

import AdminSummary from "./AdminSummary"
import CompetitionState from './CompetitionState'
import Courts from "./Courts"
import Notifications from "./Notifications"
import PendingMatches from "./PendingMatches"

const allCards = [AdminSummary, Courts, Notifications, PendingMatches, CompetitionState].reduce((inps, current) => {
    inps[current._type] = current
    return inps
}, {})

export default class HomeCard extends Component {

    static getKey = (type, props) => {
        /* Returns a unique key for a particular card so that react can distinguish them
        
        Check the render() method of HomeScreen.js to see how it's used.
        */

        if (allCards[type] && allCards[type].getKey){
            return allCards[type].getKey(props)
        } else {
            return type
        }

    }

    constructor(props){
        super(props)

        this.CardComponent = allCards[props.type]

        this.state = {}
    }

    render(){
        return <this.CardComponent {...this.props} />
    }
    
}

export { allCards }