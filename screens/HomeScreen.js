import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Animated,
    ScrollView
} from 'react-native';

import { Icon, Text} from 'native-base';

import Firebase from "../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { totalSize, w, h } from '../api/Dimensions';

import { translate } from '../assets/translations/translationManager';
import { convertDate, sortMatchesByDate } from "../assets/utils/utilFuncs";

import Table from '../components/groups/Table';
import { USERSETTINGS } from "../constants/Settings"
import HeaderIcon from "../components/header/HeaderIcon"


class HomeScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.props.navigation.setParams({backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor})

    }

    componentDidUpdate(prevProps){

        let currentbackCol = this.props.currentUser.settings["General appearance"].backgroundColor

        //Update the header color when the background color is updated :)
        if ( prevProps.currentUser.settings["General appearance"].backgroundColor !== currentbackCol){
            this.props.navigation.setParams({backgroundColor: currentbackCol})
        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                elevation: 2,
                backgroundColor: navigation.getParam("backgroundColor")
              },
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    renderCompetitionStates = (activeCompetitions) =>{

        if (!activeCompetitions) {return null}
        return activeCompetitions.map(comp => (
            <CompetitionState
                key={comp.competitionID}
                uid={this.props.currentUser.id} 
                competition={comp}
                navigation={this.props.navigation}
                setCurrentCompetition={this.props.setCurrentCompetition}/>
        ))
    }

    render() {

        return (
            <ScrollView style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <View style={styles.gridRow}>
                    <Notifications/>
                </View>
                <View style={styles.gridRow}>
                    <PendingMatches 
                        uid={this.props.currentUser.id}
                        activeCompetitions={this.props.currentUser.activeCompetitions}/>
                </View>
                {this.renderCompetitionStates(this.props.currentUser.activeCompetitions)}
            </ScrollView>
        )
    }

}

class Notifications extends Component {

    render(){

        return <Animated.View style={{...styles.gridItem, ...styles.notifications, flex: 1}}>
                    <View style={styles.itemTitleView}>
                        <Icon name="notifications" style={{...styles.titleIcon,color: "green"}}/>
                        <Text style={{...styles.titleText, color: "green", fontFamily: "bold"}}>{translate("vocabulary.notifications")}</Text>
                    </View>
                    <Text>Et reclamen com a jugador de la lliga del nick!</Text>

                </Animated.View>
    }
}

class PendingMatches extends Component {

    constructor(props){
        super(props)
        
        this.state = {}

        //this.contentMaxHeight = new Animated.Value(0)

    }

    componentDidMount(){
        this.listener = Firebase.onPendingMatchesSnapshot(this.props.uid, 
            matches => {

                matches = matches.map( match => ({
                    ...match,
                    competition: this.props.activeCompetitions.filter(comp => comp.id == match.compID )[0]
                }) )

                matches = sortMatchesByDate(matches)

                this.setState({matches})
            }
        )
    }

    componentWillUnmount(){
        this.listener()
    }

    toggleContent = () => {

        Animated.timing(this.contentMaxHeight, {
            toValue: 70
        }).start()

    }

    renderPendingMatches = (matches) => {

        if ( !matches || matches.length == 0 ){

            return <Text>No tens cap partit pendent. Pots relaxar-te :)</Text>

        } else {

            return (
                <View>
                    <View style={{flexDirection: "row"}}>
                        <View style={{flex: 2}}>
                            <Text style={{}}>Juanito Casas</Text>
                            <Text note>Lliga social esquaix</Text>
                        </View>
                        <View style={{flex: 1, alignItems: "flex-end"}}>
                            <Text note>21:45</Text>
                        </View>
                             
                    </View>
                    <View style={{backgroundColor: "gray", height: this.contentMaxHeight}}>
                    </View>
                </View>
            )

            return matches.map( match => {

                var matchInfo;

                //Determine the match information that should be displayed
                if (match.playersIDs.length == 2){
                    //then we need to display just the rival
                    let rival = match.playersNames.filter( (name, i) => match.playersIDs[i] != this.props.uid )[0]

                    matchInfo = <Text>{rival}</Text>
                }

                //Determine how the time information should be rendered
                var timeInfo;

                if (match.scheduled) {

                    let {time, location} = scheduled

                    time = convertDate(time.toDate(), "dd/mm hh:mm")

                    timeInfo = <View>
                                    <Text>{time}</Text>
                                    <Text>{location}</Text>
                                </View>

                } else {

                    const matchDue = convertDate(match.due.toDate(), "dd/mm")

                    timeInfo = <Text>{matchDue}</Text>
                }

                

                return <View style={{flexDirection: "row"}}>
                            {matchInfo}
                            {timeInfo}
                            <Text>{match.competition.name}</Text>
                        </View>
            }
                
            )

        }
    }

    render(){

        return <Animated.View style={{...styles.gridItem, flex: 1}}>
                    <TouchableOpacity style={styles.itemTitleView} >
                        <Icon name="time" style={styles.titleIcon}/>
                        <Text style={styles.titleText}>{translate("vocabulary.pending matches")}</Text>
                        <View style={styles.actionIconView}>
                            <Icon name="arrow-dropdown" style={{...styles.actionIcon}}/>
                        </View>
                    </TouchableOpacity>
                    {this.renderPendingMatches(this.state.matches)}
                </Animated.View>
    }
}

class CompetitionState extends Component {

    constructor(props){
        super(props)

        this.state = {
        }
    }

    componentDidMount(){

        const {competition} = this.props
        const {gymID, id: compID} = competition

        if (competition.type == "groups"){

            this.listener = Firebase.onPlayerGroupSnapshot(gymID, compID, this.props.uid,
                group => this.setState({compStateInfo: group})
            );

        }
        
    }

    componentWillUnmount(){
        if (this.listener) this.listener()
    }

    renderCompetitionState = (typeOfComp, compStateInfo) => {

        if (!compStateInfo) return null

        if (typeOfComp == "groups"){
            return <Table
                        ranks={compStateInfo.ranks}
                        players={compStateInfo.players}
                        scores={compStateInfo.results}
                        playersIDs={compStateInfo.playersRef}
                        goToUserProfile={this.props.goToUserProfile} 
                    />
        }
    }

    goToCompetition = () => {

        //Set the current competition so that the competition screen can know what to render
        const {gymID, competitionID, name, type} = this.props.competition
        this.props.setCurrentCompetition(gymID, competitionID, name, type)

        this.props.navigation.navigate("CompetitionScreen")
    }

    render(){

        return (
            <View style={styles.gridRow}>           
                <Animated.View style={{...styles.gridItem, flex: 1}}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={{...styles.itemTitleView}} onPress={this.goToCompetition}>
                            <Icon name="trophy" style={styles.titleIcon}/>
                            <Text style={styles.titleText}>{this.props.competition.name}</Text>
                            <View style={styles.actionIconView}>
                                <Icon name="add" style={{...styles.actionIcon}}/>
                            </View>
                        </TouchableOpacity>
                        {this.renderCompetitionState(this.props.competition.type, this.state.compStateInfo)}
                    </View>
                </Animated.View>
            </View>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
    setCurrentCompetition: (gymID, competitionID, compName, typeOfComp) => dispatch(setCurrentCompetition(gymID, competitionID, compName, typeOfComp))
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

    gridRow: {
        flexDirection: "row",
        marginVertical: 10
    },

    gridItem : {
        elevation: 5,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    notifications: {
        backgroundColor: "lightgreen"
    },

    itemTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 20,
    },

    titleIcon: {
        paddingRight: 15,
        color: "gray"
    },

    actionIconView: {
        flex: 1,
        alignItems: "flex-end",
    },
    
    actionIcon: {
        color: "gray"
    },

    titleText: {
        fontSize: totalSize(1.8),
        color: "gray"
    },

});