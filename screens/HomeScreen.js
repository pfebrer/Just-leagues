import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Animated,
    Easing,
    ScrollView
} from 'react-native';

import { Icon, Text} from 'native-base';

import Firebase from "../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { totalSize, w, h } from '../api/Dimensions';

import { translate } from '../assets/translations/translationManager';

import Table from '../components/groups/Table';
import { USERSETTINGS } from "../constants/Settings"
import HeaderIcon from "../components/header/HeaderIcon"

import PendingMatches from "../components/home/PendingMatches"
import Notifications from "../components/home/Notifications"


class HomeScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.props.navigation.setParams({
            backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor,
            isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
        })

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
            headerLeft: navigation.getParam("isAdmin") ? <HeaderIcon name="clipboard" onPress={() => {navigation.navigate("AdminScreen")}} /> : null,
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    renderCompetitionStates = (activeCompetitions) =>{

        if (!activeCompetitions) {return null}
        return activeCompetitions.map(comp => (
            <CompetitionState
                key={comp.id}
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
                    <Notifications
                        homeStyles={styles}/>
                </View>
                <View style={styles.gridRow}>
                    <PendingMatches
                        homeStyles={styles}
                        />
                </View>
                {this.renderCompetitionStates(this.props.currentUser.activeCompetitions)}
            </ScrollView>
        )
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
        this.props.setCurrentCompetition(this.props.competition)

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
    setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
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
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    actionHelperText: {
        paddingRight: 10,
    },
    
    actionIcon: {
        color: "gray"
    },

    titleText: {
        fontSize: totalSize(1.8),
        color: "gray"
    },

    pendingMatchContainer: {
        flexDirection: "row",
        height: h(5)
    }

});