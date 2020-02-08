import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View, 
    Animated,
    Easing,
} from 'react-native';

import { Icon, Text} from 'native-base';

import _ from "lodash"
import moment from "moment"

import Firebase from "../../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"

import { totalSize, w, h } from '../../api/Dimensions';

import { translate } from '../../assets/translations/translationManager';
import { convertDate, sortMatchesByDate, getCompetitionName } from "../../assets/utils/utilFuncs";
import Card from './Card';
import { selectSuperChargedCompetitions, selectUserPendingMatches} from '../../redux/reducers';

class PendingMatches extends Component {

    constructor(props){
        super(props)
        
        this.state = {
            matches: []
        }

        this.panelHeight = new Animated.Value(0)

        this.MAX_HEIGHT = 10000

    }

    setMatches = () => {

        const pendingMatches = Object.values(this.props.competitions).reduce((userPendingMatches, competition) => {

            return [...userPendingMatches, ...competition.getUserMatches(this.props.currentUser.id, true)]
        }, [])

        this.MAX_HEIGHT = Math.max(0, h(10)*(pendingMatches.length - 1))

        this.setState( {matches: sortMatchesByDate(pendingMatches)})
    }

    componentDidMount(){
        this.setMatches()
    }

    componentDidUpdate(prevProps){

        if ( !_.isEqual(_.map(this.props.competitions, "pendingMatches"), _.map(prevProps.competitions, "pendingMatches")) ){

            this.setMatches()

        }
    }

    toggleContent = () => {

        Animated.timing(this.panelHeight, {
            toValue: this.state.showingContent ? 0 : this.MAX_HEIGHT,
            duration: this.state.showingContent ? 500 : 1500,
            easing: this.state.showingContent ? undefined : Easing.elastic(2)
        }).start(() => this.setState({showingContent: !this.state.showingContent})) 

    }

    goToMatch = (match) => {

        this.props.setCurrentMatch(match)

        this.props.navigation.navigate("MatchScreen")

    }

    renderMatchView = (match, header = false) => {

        var matchInfo;

        //Determine the match information that should be displayed
        if (match.playersIDs.length == 2){
            //then we need to display just the rival
            let rival = match.playersIDs.map( uid => match.context.competition.renderName(this.props.relevantUsers[uid].names))
                        .filter( (name, i) => match.playersIDs[i] != this.props.currentUser.id )[0]

            matchInfo = <Text>{rival}</Text>
        }

        //Determine how the time information should be rendered
        var timeInfo;

        if (match.scheduled && match.scheduled.time) {

            let {time, location} = match.scheduled
            time = moment(time)

            var locationInfo = location ? <Text note style={{...styles.scheduleText}}>{location}</Text> : null

            timeInfo = <View style={styles.timeInfoView}>
                            <Text style={{fontFamily: "bold", ...styles.scheduleText}}>{time.calendar()}</Text>
                            <Text note style={{...styles.scheduleText}}>{"("+ time.fromNow() + ")"}</Text>
                            {locationInfo}
                        </View>
                        

        } else {

            const matchDue = moment(match.due)

            timeInfo = <View style={styles.timeInfoView}>
                            <Text note style={{...styles.scheduleText, color: "darkred"}}>{translate("vocabulary.not scheduled match")}</Text>
                            <Text note style={{...styles.scheduleText}}>{matchDue.calendar()}</Text>
                            <Text note style={{...styles.scheduleText}}>{"("+ matchDue.fromNow() + ")"}</Text>
                        </View>
        }

        let additionalPadStyles = match.scheduled && match.scheduled.time ? styles.scheduledPad : styles.notScheduledPad

        return (
            <TouchableOpacity 
                key={match.id} 
                style={ header ? styles.pendingMatchHeader : styles.pendingMatchContainer}
                onPress={() => this.goToMatch(match)}>
                <View style={{...styles.pendingMatchPad, ...additionalPadStyles}}/>
                <View style={{flex:1, justifyContent: "center"}}>
                    {matchInfo}
                    <Text note>{ getCompetitionName(match.context.competition)}</Text>
                </View>
                {timeInfo}
            </TouchableOpacity>
        )
    }

    renderPendingMatches = (matches) => {

        if ( !matches || matches.length == 0 ){

            return <Text>{translate("info.no pending matches")}</Text>

        } else {

            let hiddenMatches = matches.slice(1).map(match => this.renderMatchView(match))

            return (
                <View>
                    {this.renderMatchView(matches[0], true)}
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

        return (
            <Card
                titleIcon="time"
                title={translate("vocabulary.pending matches")}
                onHeaderPress={this.toggleContent}
                actionHelperText={"(" + this.state.matches.length + ")"}
                actionIcon={this.state.matches.length > 1 ? "arrow-dropdown" : false}
                actionIconViewStyles={{transform: [{ rotate: spin}] }}>
                {this.renderPendingMatches(this.state.matches)}
            </Card>
        ) 
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    relevantUsers: state.relevantUsers,
    competitions: selectSuperChargedCompetitions(state),
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(PendingMatches);

const styles = StyleSheet.create({

    pendingMatchHeader: {
        flexDirection: "row",
        minHeight: h(10),
        justifyContent: "center",
        alignItems: "center"
    },

    pendingMatchContainer: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        height: h(10),
    },

    pendingMatchPad: {
        width: 6,
        height: "90%",
        marginRight: 15,
        borderRadius: 3
    },

    timeInfoView: {
        marginLeft: 10,
    },

    scheduleText: {
        textAlign: "right",
        fontSize: totalSize(1.6)
    },

    scheduledPad: {
        backgroundColor: "#c6e17b",
    },

    notScheduledPad: {
        backgroundColor: "#e1947b"
    },

});