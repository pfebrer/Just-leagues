import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import Firebase from "../api/Firebase"
import { translate } from '../assets/translations/translationManager';
import { Toast } from 'native-base';

import { updateSettingsFields } from "../assets/utils/utilFuncs"
import { USERSETTINGS } from "../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'
import { storeUserData, updateRelevantUsers, updateCompetitions} from "../redux/actions"

import NotificationManager from "../api/Notifications"

class LoadingScreen extends React.Component {

    status = {
        msg: "",
        bg: null
    };

    constructor(props) {
        super(props);

        if (this.props.checkUser || this.props.checkUser === undefined) {
            this.onConstruct();
        }

        if (this.props.msg !== undefined) {
            this.status.msg = this.props.msg;
        } else {
            this.status.msg = translate("info.checking user");
        }
        if (this.props.bg !== undefined) {
            this.status.bg = this.props.bg;
        } else {
            console.log("Loading::status.bg", this.status.bg);
        }
        // this.setState(status);
    }

    onConstruct = async () => {

        //Listen for any change on the authorization state (even logouts)
        const unsub = Firebase.auth.onAuthStateChanged(user => {

            //Set up the listeners to retrieve all the data about users and competitions that may be needed during the app experience
            [this.usersListeners, this.compListeners, this.gymListeners].forEach(listenersObject => {
                if (listenersObject){
                    //First we need to desubscribe from all previous listeners
                    Object.values(listenersObject).forEach(val => {
                        if (val instanceof Function) val()
                        //There may be nested listeners
                        else {
                            Object.values(val).forEach(nestedVal => nestedVal() )
                        }
                    })
                }
            })

            this.compListeners = {} ; this.usersListeners = {} ; this.gymListeners = {}

            //On sign out remove the previous userListener, otherwise it will crash due to not having permission to read the database 
            if (this.userListener && !user) {this.userListener()}

            //If there is a logged in user, do all the preparatory stuff
            if (user) {

                NotificationManager.registerForPushNotificationsAsync(user.uid)

                this.userListener = Firebase.onUserSnapshot(user.uid,

                    userData => {

                    //In this case, it is just the object coming from google sign in (I don't fully understand the flow)
                    if( !userData) return null

                    //Update the settings fields if some new settings have been produced
                    let newSettings = updateSettingsFields(userData.settings || {}, USERSETTINGS)

                    //Create a listener for each competition in active competitions to retrieve the users ids and names
                    if (userData.activeCompetitions){
                        
                        userData.activeCompetitions.forEach( compID => {

                            if (!this.usersListeners[compID]){

                                this.usersListeners[compID] = Firebase.onCompUsersSnapshot(compID, userData,
                                    relevantUsers => this.props.updateRelevantUsers(relevantUsers)
                                )
                            }

                            if (!this.compListeners[compID]){

                                this.compListeners[compID] = Firebase.onCompetitionSnapshot( compID,
                                    compData => {
                                        this.props.updateCompetitions({ [compID]: compData})
                                    }
                                )
                            }

                        });
                    }

                    //For gym admins, add also the competitions they manage
                    if (userData.gymAdmin && userData.gymAdmin.length > 0) {
                        userData.gymAdmin.forEach(gymID => {

                            if ( ! this.gymListeners[gymID]){

                                this.gymListeners[gymID] = Firebase.onCompetitionsSnapshot(gymID, competitions => {
                                    
                                    competitions.forEach( competition => {

                                        this.props.updateCompetitions({ [competition.id]: competition})

                                        if (!this.usersListeners[competition.id]){

                                            this.usersListeners[competition.id] = Firebase.onCompUsersSnapshot(competition.id, userData,
                                                relevantUsers => this.props.updateRelevantUsers(relevantUsers)
                                            )
                                        }  
    
                                    })
                                })
                            }

                            
                        })
                    }
                    
                    if (newSettings){

                        Firebase.updateUserSettings(user.uid, newSettings)
                        
                    } else {

                        this.props.storeUserData({activeCompetitions: [], email: user.email, id: user.uid,...userData})

                        //Listen to incoming push notifications to do cool stuff in the NotificationManager class
                        if (this.notifListener) this.notifListener()
                        this.notifListener = NotificationManager.listenToNotifications(
                            this.props.navigation,
                            {currentUser: this.props.currentUser}
                        )

                        console.log("User signed in ---> Redirect to the home screen")

                        this.props.navigation.navigate('App');

                        /*Toast.show({
                        text: 'Benvingut, ' + userData.firstName + '!',
                        duration: 3000
                        })*/

                    }

                })

            //Otherwise go to the login page
            } else {

                console.log("USER NOT SIGNED IN --> Redirecting to login Screen")
                this.props.navigation.navigate('Auth');
            }
        });
    }
    
    render() {
        return <View style={styles.container}>
                    <Text style={styles.userCheck}>{this.status.msg}</Text>
                    <ActivityIndicator size="large" color="#000000"/>
                    <StatusBar barStyle="default"/>
                </View>
        
    }
}


const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: state.competition,
})

const mapDispatchToProps = dispatch => ({
    storeUserData: (uid, userData) => dispatch(storeUserData(uid, userData)),
    updateRelevantUsers: (newRelevantUsers) => dispatch(updateRelevantUsers(newRelevantUsers)),
    updateCompetitions: (newCompetitions) => dispatch(updateCompetitions(newCompetitions)),
    setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
})

export default connect( mapStateToProps, mapDispatchToProps )(LoadingScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userCheck: {
        color: '#FFFFFF',
        fontFamily: 'lucidaGrandeBold',
        fontSize: 20,
        fontWeight: 'bold'
    }
});
