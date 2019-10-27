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

        this.unasignedListener = Firebase.usersRef.where("asigned", "==", false).where("email", "==", "pfebrer96@gmail.com").onSnapshot(
            query => this.setState({ 
                unasignedUsers: query.docs.map(doc => ({ ...doc.data(), id: doc.id}) )
            })
        )

    }

    mergeUnasignedUser = (uid, unasignedUser) => {

        let {gymID, id: compID} = unasignedUser.activeCompetitions[0]

        //CHANGE ALL ID REFERENCES IN THE DATABASE
        //Define the references where there is an array of playersIDs that needs to be modified
        IDstoringRefs = [
            Firebase.compRef(gymID, compID), //The competition's ref
            Firebase.pendingMatchesRef(gymID, compID).where("playersIDs", "array-contains", unasignedUser.id), //The competition's pending matches ref
            Firebase.groupsRef(gymID, compID).where("playersIDs", "array-contains", unasignedUser.id) //The competition's group ref
        ]

        //Loop over all the references to modify the playersIDs array
        IDstoringRefs.forEach(ref => {
            ref.get().then( snap => {
                
                if (snap.docs){
                    //The snap is a query snapshot
                    snap.forEach( doc => {

                        var newPlayersIDs = doc.get("playersIDs").map( id => id == unasignedUser.id ? uid : id)

                        if (snap.docs.length == 2){
                            doc.ref.set({playersIDs: newPlayersIDs}, {merge: true})
                        } else {
                            doc.ref.set({newPlayersIDs}, {merge: true})
                        }
                        

                    })

                } else {
                    
                    var newPlayersIDs = snap.get("playersIDs").map( id => id == unasignedUser.id ? uid : id)
                    ref.set({newPlayersIDs}, {merge: true})
                }

                
            })
        });

        //PASS THE ACTIVE COMPETITION TO THE USER REQUESTING THE MERGE
        Firebase.userRef(uid).get().then(
            doc => {

                let activeCompetitions = doc.get("activeCompetitions") || []
                
                doc.ref.set({
                    activeCompetitions: [...activeCompetitions, unasignedUser.activeCompetitions[0]]
                }, {merge:true})
            }
        )
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
                        onPress={() => {this.mergeUnasignedUser(this.props.currentUser.id, user)}}>
                        <Icon name="checkmark" style={{...styles.unasignedUserAcceptIcon}}/>
                    </TouchableOpacity>
                    <View style={{justifyContent: "center", alignItems: "center", flex: 1}}>
                        <Text style={{fontFamily: "bold"}}>Lliga social esquaix</Text>
                        <Text>Pol Febrer</Text>
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
            <Text>Hi ha competicions que t'estan esperant!</Text>
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