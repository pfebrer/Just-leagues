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

import _ from "lodash"

//Redux stuff
import { connect } from 'react-redux'

import { totalSize, w, h } from '../../api/Dimensions';

import { translate } from '../../assets/translations/translationManager';
import Card from './Card';

class Notifications extends Component {

    constructor(props){
        super(props)

        this.state={
            unasignedUsers: []
        }
    }

    componentDidMount() {

        this.unasignedListener = Firebase.onUnasignedUsersSnapshot(this.props.currentUser.email,
            unasignedUsers => {

                
                let promises = unasignedUsers.map( unasignedUser => Firebase.getCompetition( unasignedUser.activeCompetitions[0]))

                Promise.all(promises).then( querysnapShots => {
                    this.setState({
                        unasignedUsers: unasignedUsers.map( (user, i) => ({
                            ...user,
                            competition: {
                                ...querysnapShots[i].docs[0].data(),
                                gymID: querysnapShots[i].docs[0].ref.parent.parent.id
                            }
                        }) )
                    })
                }).catch(err => alert("Could not retrieve competition data from unasigned users:", err))
            }
        )

    }

    mergeUnasignedUser = (unasignedUser, requestingUser) => {
        
        Firebase.mergeUsers(_.omit(unasignedUser, ["competition"]), requestingUser, {[unasignedUser.competition.id]: unasignedUser.competition})

    }

    componentWillUnmount() {
        this.unasignedListener()
    }

    renderUnasignedUsers = (users) => {

        return users.map( user =>
            <View key={user.id} style={styles.unasignedUserView}>
                <View style={styles.unasignedUserViewHeader}>
                    <TouchableOpacity 
                        style={{...styles.unasignedUserAction, ...styles.unasignedUserAccept}}
                        onPress={() => {this.mergeUnasignedUser(user, this.props.currentUser)}}>
                        <Icon name="checkmark" style={{...styles.unasignedUserAcceptIcon}}/>
                    </TouchableOpacity>
                    <View style={{justifyContent: "center", alignItems: "center", flex: 1}}>
                        <Text style={{fontFamily: "bold"}}>{user.competition.name}</Text>
                        <Text>{user.displayName}</Text>
                    </View>
                    <TouchableOpacity style={{...styles.unasignedUserAction, ...styles.unasignedUserReject}}>
                        <Icon name="close" style={{...styles.unasignedUserRejectIcon}}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.unasignedUserAddInfoView}>
                    
                </View>
                
            </View>
        )
    }

    render(){

        if(this.state.unasignedUsers.length == 0 && this.props.currentUser.activeCompetitions && this.props.currentUser.activeCompetitions.length > 0){
            return null
        }

        let unasignedUsersMessage = this.state.unasignedUsers.length > 0 ? (
            <Text>{translate("info.there are competitions waiting for you")}</Text>
        ) : [
            <Text style={{textAlign: "center", color: "darkred", fontFamily: "bold"}}>{translate("info.you don't have any notifications at the moment")}</Text>,
            <Text style={{textAlign: "center"}}>{translate("info.if you expected to have any, please talk with your competition administrator")}</Text>
        ];


        return (
            <Card
                cardContainerStyles={{backgroundColor: "lightgreen"}}
                titleIcon="notifications"
                titleIconStyles={{color:"green"}}
                title={translate("vocabulary.notifications")}
                titleTextStyles={{color: "green", fontFamily: "bold"}}>

                {unasignedUsersMessage}
                {this.renderUnasignedUsers(this.state.unasignedUsers)}
            </Card>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(Notifications);

const styles = StyleSheet.create({

    unasignedUserView: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: "white",
        elevation: 2,
        borderRadius: 5
    },

    unasignedUserViewHeader: {
        flexDirection: "row",
        alignItems: "center", 
        justifyContent: "center",
    },

    unasignedUserAction: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },

    unasignedUserAccept: {
        backgroundColor: "green",
        marginRight: 10,
    },

    unasignedUserAcceptIcon: {
        color: "white"
    },

    unasignedUserRejectIcon: {
        color: "darkred"
    },

    unasignedUserAddInfoView: {
        paddingHorizontal: 20
    }
})