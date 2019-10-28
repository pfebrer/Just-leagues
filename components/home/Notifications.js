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

class Notifications extends Component {

    constructor(props){
        super(props)

        this.state={
            unasignedUsers: []
        }
    }

    componentDidMount() {

        this.unasignedListener = Firebase.onUnasignedUsersSnapshot(this.props.currentUser.email,
            unasignedUsers => this.setState({unasignedUsers})
        )

        createUnasignedUser = (displayName, email, comp) => {
            Firebase.usersRef.add({
                displayName,
                email,
                activeCompetitions: [comp],
                asigned: false
            }).then(() => {}).catch(err => console.log(error))
        }

        /* createUnasignedUser("Pol Febrer", "pfebrer96@gmail.com", {
            gymID: "nickspa",
            id: "UmtaUDr98rdx5pFKrygI",
            name: "Lliga social esquaix",
            type: "groups",
          }
        ) */

    }

    mergeUnasignedUser = (unasignedUser, requestingUser) => {

        Firebase.mergeUsers(unasignedUser, requestingUser)

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
                        <Text style={{fontFamily: "bold"}}>{user.activeCompetitions[0].name}</Text>
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

        console.log("UNASSIGNED USERS:", this.state.unasignedUsers)

        let unasignedUsersMessage = this.state.unasignedUsers.length > 0 ? (
            <Text>{translate("info.there are competitions waiting for you")}</Text>
        ) : null;

        return <Animated.View style={{...this.props.homeStyles.gridItem, ...this.props.homeStyles.notifications, flex: 1}}>
                    <View style={this.props.homeStyles.itemTitleView}>
                        <Icon name="notifications" style={{...this.props.homeStyles.titleIcon,color: "green"}}/>
                        <Text style={{...this.props.homeStyles.titleText, color: "green", fontFamily: "bold"}}>{translate("vocabulary.notifications")}</Text>
                    </View>
                    {unasignedUsersMessage}
                    {this.renderUnasignedUsers(this.state.unasignedUsers)}
                    

                </Animated.View>
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    IDsAndNames: state.IDsAndNames
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