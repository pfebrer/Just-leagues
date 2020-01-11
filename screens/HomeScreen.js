import React, {Component} from 'react';
import {
    StyleSheet,
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
import Card from "../components/home/Card"
import GroupsCompetition from '../Useful objects/competitions/groups';

import _ from "lodash"

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

        if ( ! _.isEqual(prevProps.currentUser.gymAdmin, this.props.currentUser.gymAdmin)
            || ( prevProps.currentUser.admin != this.props.currentUser.admin) ) {

            this.props.navigation.setParams({
                isAdmin: (this.props.currentUser.gymAdmin && this.props.currentUser.gymAdmin.length > 0) || this.props.currentUser.admin
            })
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
        return activeCompetitions.map(compID => {

            if (!this.props.competitions[compID]) return <Card loading/>
            
            return <CompetitionState
                key={compID}
                uid={this.props.currentUser.id} 
                competition={this.props.competitions[compID]}
                navigation={this.props.navigation}
                setCurrentCompetition={this.props.setCurrentCompetition}/>
        })
    }

    render() {

        return (
            <ScrollView 
                style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}
                contentContainerStyle={{paddingVertical: 20}}>

                <Notifications/>

                {false ? <PendingMatches navigation={this.props.navigation}/> : null }

                {this.renderCompetitionStates(this.props.currentUser.activeCompetitions)}

            </ScrollView>
        )
    }

}

class CompetitionState extends Component {

    constructor(props){
        super(props)

        /*this.state = {
            listenerResult: undefined
        }*/
    }

    /*componentDidMount(){

        this.listener = this.props.competition.compStateListener(this.props.uid,
            listenerResult => this.setState({listenerResult})
        );
        
    }

    componentWillUnmount(){
        if (this.listener) this.listener()
    }*/

    goToCompetition = () => {

        //Set the current competition so that the competition screen can know what to render
        this.props.setCurrentCompetition(this.props.competition)

        this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name})
    }

    render(){

        if (!this.props.competition) return null

        return (
            <Card
                titleIcon="trophy"
                title={this.props.competition.name}
                onHeaderPress={this.goToCompetition}
                actionIcon="add">
                    <GroupsCompetition what="compState" competition={this.props.competition} navigation={this.props.navigation}/>
            </Card>
        )

        return (
            <Card
                titleIcon="trophy"
                title={this.props.competition.name}
                onHeaderPress={this.goToCompetition}
                actionIcon="add">

                {this.props.competition.renderCompState({ navigation: this.props.navigation, listenerResult: this.state.listenerResult})}
            </Card>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competitions: state.competitions
})

const mapDispatchToProps = dispatch => ({
    setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

});