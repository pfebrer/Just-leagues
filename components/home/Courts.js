import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View, 
    Animated,
    Easing,
    Linking
} from 'react-native';

import { Icon, Text} from 'native-base';

import _ from "lodash"
import moment from "moment"

import Firebase from "../../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"

import { totalSize, w, h } from '../../api/Dimensions';

import { translate } from '../../assets/translations/translationWorkers';
import { convertDate, sortMatchesByDate, getCompetitionName, elevation} from "../../assets/utils/utilFuncs";
import Card from '../UX/Card';
import { selectSuperChargedCompetitions, selectUserPendingMatches} from '../../redux/reducers';

class Courts extends Component {

    constructor(props){
        super(props)
        
        this.state = {
            matches: [{id:1},{id:2},{id:3} ]
        }

        this.panelHeight = new Animated.Value(0)

        this.MAX_HEIGHT = 10000

    }

    setMatches = () => {

        const pendingMatches = Object.values(this.props.competitions).reduce((userPendingMatches, competition) => {

            return [...userPendingMatches, ...competition.getUserMatches(this.props.currentUser.id, true)]
        }, [])

        this.MAX_HEIGHT = Math.max(0, h(15)*(pendingMatches.length - 1))

        this.setState( {matches: [{id:1},{id:2},{id:3} ]})
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

    goToMaps = () => {
        Linking.openURL('https://www.google.com/maps/search/?api=1&query=Nick Sports')
    }

    goToMatch = (match) => {

        //this.props.setCurrentMatch(match)

        //this.props.navigation.navigate("MatchScreen")

    }

    renderCourtView = (match, header = false) => {

        return <TouchableOpacity 
            key={match.id} 
            style={ header ? styles.pendingMatchHeader : styles.pendingMatchContainer}
            onPress={() => this.goToMatch(match)}>
            <View style={{flex:1, alignItems: "center", flexDirection: "row"}}>
                <View style={{paddingLeft: 10, flex:1, alignItems: "center", justifyContent: "flex-start"}}>
                    <Icon type="MaterialCommunityIcons" name="calendar-clock"/>
                    <Text>20/10/20</Text>
                    <Text style={styles.timeText}>20:00 - 21:00</Text>
                </View>
                <TouchableOpacity
                    onPress={this.goToMaps}
                    style={{flex: 1, justifyContent: "center", alignItems:"center", paddingRight: 20}}>
                    <Icon type="MaterialIcons" name="location-on"/>
                    <Text style={styles.locationText}>Nick sports</Text>    
                </TouchableOpacity>
            </View>
            <View style={{alignItems: "center", justifyContent: "center", paddingTop: 10, flexDirection: "row"}}>
                <View style={{paddingRight: 40, justifyContent: "center", alignItems: "center"}}>
                    <Icon name="people"/>
                </View>
                <View style={{justifyContent: "center"}}>
                    <Text note style={styles.playerText}>Josep Tarradellas</Text>
                    
                </View>
            </View>   
        </TouchableOpacity>
    }

    renderLaterCourts = (match, header = false) => {
        return <TouchableOpacity 
            key={match.id} 
            style={ header ? styles.pendingMatchHeader : styles.pendingMatchContainer}
            onPress={() => this.goToMatch(match)}>
            <View style={{flex:1, alignItems: "center", flexDirection: "row"}}>
                <View style={{paddingLeft: 10, flex:1, alignItems: "center", justifyContent: "center"}}>
                    <Text>20/10/20</Text>
                    <Text style={styles.timeText}>20:00 - 21:00</Text>
                </View>
                <TouchableOpacity
                    onPress={this.goToMaps}
                    style={{flex: 1, justifyContent: "center", alignItems:"center", flexDirection: "row", paddingRight: 20}}>
                    <Icon type="MaterialIcons" name="location-on"/>
                    <Text style={styles.locationText}>Nick sports</Text>    
                </TouchableOpacity>
            </View>
            <View style={{alignItems: "center", justifyContent: "center", paddingTop: 10, paddingBottom: 20}}>
                <Text note style={styles.playerText}>Josep Tarradellas</Text>
            </View>   
        </TouchableOpacity>
    }

    renderPendingMatches = (matches) => {

        if ( false ){

            return <Text>{translate("info.no pending matches")}</Text>

        } else {

            let hiddenMatches = matches.slice(1).map(match => this.renderLaterCourts(match))

            return (
                <View>
                    {this.renderCourtView(matches[0], true)}
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
                titleIcon="book"
                titleIconProps={{type: "AntDesign"}}
                title={translate("tabs.your courts")}
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

export default connect(mapStateToProps, mapDispatchToProps)(Courts);

const styles = StyleSheet.create({

    pendingMatchHeader: {
        minHeight: h(10),
    },

    pendingMatchContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 10,
        borderColor: "black",
        //borderWidth: 1,
        ...elevation(2),
        backgroundColor: "#f5f5f5",
        borderRadius: 3,
        height: h(15),
    },

    pendingMatchPad: {
        width: 6,
        height: "90%",
        marginRight: 15,
        borderRadius: 3
    },

    timeText: {
        fontFamily: "bold"
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