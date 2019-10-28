import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View, 
    Animated,
    Easing,
} from 'react-native';

import { Icon, Text} from 'native-base';

import Firebase from "../../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'

import { totalSize, w, h } from '../../api/Dimensions';

import { translate } from '../../assets/translations/translationManager';
import { convertDate, sortMatchesByDate } from "../../assets/utils/utilFuncs";

class PendingMatches extends Component {

    constructor(props){
        super(props)
        
        this.state = {
            matches: []
        }

        this.panelHeight = new Animated.Value(0)

        this.MAX_HEIGHT = 10000

    }

    componentDidMount(){
        this.listener = Firebase.onPendingMatchesSnapshot(this.props.currentUser.id, 
            matches => {

                matches = matches.map( match => ({
                    ...match,
                    playersNames: match.playersIDs.map( uid => this.props.IDsAndNames[uid] || "Sense nom"),
                    competition: this.props.currentUser.activeCompetitions.filter(comp => comp.id == match.compID )[0] || "Competició desconeguda"
                }) )

                matches = sortMatchesByDate(matches)

                this.MAX_HEIGHT =Math.max(0, h(5)*(matches.length - 1))

                this.setState({matches})
            }
        )
    }

    componentWillUnmount(){
        this.listener()
    }

    toggleContent = () => {

        Animated.timing(this.panelHeight, {
            toValue: this.state.showingContent ? 0 : this.MAX_HEIGHT,
            duration: this.state.showingContent ? 500 : 1500,
            easing: this.state.showingContent ? undefined : Easing.elastic(2)
        }).start(() => this.setState({showingContent: !this.state.showingContent})) 

    }

    renderMatchView = (match, header = false) => {

        var matchInfo;

        //Determine the match information that should be displayed
        if (match.playersIDs.length == 2){
            //then we need to display just the rival
            let rival = match.playersNames.filter( (name, i) => match.playersIDs[i] != this.props.currentUser.id )[0]

            matchInfo = <Text>{rival}</Text>
        }

        //Determine how the time information should be rendered
        var timeInfo;

        if (match.scheduled) {

            let {time, location} = match.scheduled

            if (convertDate(time.toDate(), "dd/mm/yyyy") ==  convertDate(Date.now(), "dd/mm/yyyy")) {
                time = "Today at " + convertDate(time.toDate(), "hh:mm")
            } else {
                time = convertDate(time.toDate(), "dd/mm hh:mm")
            }

            timeInfo = <View>
                            <Text note style={{color: "green", textAlign: "right"}}>{translate("vocabulary.scheduled match")}</Text>
                            <Text style={{fontFamily: "bold"}}>{time}</Text>
                            <Text note></Text>
                        </View>

        } else {

            const matchDue = convertDate(match.due.toDate(), "dd/mm")

            timeInfo = <View>
                            <Text note style={{color: "darkred",textAlign: "right"}}>{translate("vocabulary.not scheduled match")}</Text>
                            <Text note style={{textAlign: "right"}}>{translate("vocabulary.limit") + ": " + matchDue}</Text>
                        </View>
        }

        return (
            <View key={match.id} style={ header ? this.props.homeStyles.pendingMatchHeader : this.props.homeStyles.pendingMatchContainer}>
                <View>
                    {matchInfo}
                    <Text note>{match.competition.name}</Text>
                </View>
                <View style={{flex: 1, alignItems: "flex-end"}}> 
                    {timeInfo}
                </View>
                    
            </View>
        )
    }

    renderPendingMatches = (matches) => {

        if ( !matches || matches.length == 0 ){

            return <Text>{translate("info.no pending matches")}</Text>

        } else {

            let hiddenMatches = matches.slice(1).map(match => this.renderMatchView(match, header = true))

            return (
                <View>
                    {this.renderMatchView(matches[0])}
                    <Animated.View 
                        style={{height: this.panelHeight, overflow: "hidden"}}>
                        {hiddenMatches}
                    </Animated.View>
                </View>
            )

        }
    }

    render(){

        const spin = this.panelHeight.interpolate({
            inputRange: [0, this.MAX_HEIGHT],
            outputRange: ['0deg', '180deg']
        })

        const dropdownBut = this.state.matches.length > 1 ? (
            <Animated.View style={{transform: [{ rotate: spin}] }}>
                <Icon name="arrow-dropdown" style={{...this.props.homeStyles.actionIcon}}/>
            </Animated.View>
        ) : null

        return <Animated.View style={{...this.props.homeStyles.gridItem, flex:1, height: "auto"}}>
                    <TouchableOpacity 
                        style={this.props.homeStyles.itemTitleView} 
                        onPress={this.toggleContent}>
                        <Icon name="time" style={this.props.homeStyles.titleIcon}/>
                        <Text style={this.props.homeStyles.titleText}>{translate("vocabulary.pending matches")}</Text>
                        <View style={{...this.props.homeStyles.actionIconView}}>
                            <Text note style={this.props.homeStyles.actionHelperText}>{"(" + this.state.matches.length + ")"}</Text>
                            {dropdownBut}
                        </View>
                    </TouchableOpacity>
                    {this.renderPendingMatches(this.state.matches)}
                </Animated.View>
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    IDsAndNames: state.IDsAndNames
})

export default connect(mapStateToProps)(PendingMatches);