import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import Firebase from "../api/Firebase"
import { translate } from '../assets/translations/translationManager';
import { Toast } from 'native-base';
import {Notifications} from "expo";
import * as Permissions from "expo-permissions";

import { updateSettingsFields } from "../assets/utils/utilFuncs"
import { USERSETTINGS } from "../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'
import { storeUserData, updateIDsAndNames, updateCompetitions} from "../redux/actions"

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
            if (this.usersListeners){
                //First we need to desubscribe from all previous listeners
                Object.keys(this.usersListeners).forEach(compID => this.usersListeners[compID]())
            }
            if (this.compListeners){
                //First we need to desubscribe from all previous listeners
                Object.keys(this.compListeners).forEach(compID => this.compListeners[compID]())
            }
            this.compListeners = {} ; this.usersListeners = {} 

            //On sign out remove the previous userListener, otherwise it will crash due to not having permission to read the database 
            if (this.userListener && !user) {this.userListener()}

            //If there is a logged in user, do all the preparatory stuff
            if (user) {

                this.registerForPushNotificationsAsync(user.uid)

                this.userListener = Firebase.onUserSnapshot(user.uid,

                    userData => {

                    //In this case, it is just the object coming from google sign in (I don't fully understand the flow)
                    if( !userData) return null

                    //Update the settings fields if some new settings have been produced
                    let newSettings = updateSettingsFields(userData.settings || {}, USERSETTINGS)

                    if (userData.activeCompetitions){
                        //Create a listener for each competition in active competitions to retrieve the users ids and names
                        userData.activeCompetitions.forEach( comp => {

                            if (!this.usersListeners[comp.id]){

                                this.usersListeners[comp.id] = Firebase.onCompUsersSnapshot(comp, 
                                    IDsAndNames => this.props.updateIDsAndNames(IDsAndNames)
                                )
                            }

                            if (!this.compListeners[comp.id]){

                                this.compListeners[comp.id] = Firebase.onCompetitionSnapshot(comp.gymID, comp.id, 
                                    compData => this.props.updateCompetitions({ [comp.id]: {...compData, gymID: comp.gymID}})
                                )
                            }

                        });
                    }
                    
                    if (newSettings){

                        Firebase.updateUserSettings(user.uid, newSettings)
                        
                    } else {

                        this.props.storeUserData({activeCompetitions: [], email: user.email, id: user.uid,...userData})

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

    registerForPushNotificationsAsync = async (uid) => {
        const {status: existingStatus} = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;
    
        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
    
        }
    
        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            return;
        }
    
        // Get the token that uniquely identifies this device
        let token = await Notifications.getExpoPushTokenAsync();
    
        let updates = {};
        updates["expoToken"] = token;
        Firebase.userRef(uid).update(updates);
    
    };
    
    render() {
        return <View style={styles.container}>
                    <Text style={styles.userCheck}>{this.status.msg}</Text>
                    <ActivityIndicator size="large" color="#000000"/>
                    <StatusBar barStyle="default"/>
                </View>
        
    }
}

const mapDispatchToProps = dispatch => ({
    storeUserData: (uid, userData) => dispatch(storeUserData(uid, userData)),
    updateIDsAndNames: (newIDsAndNames) => dispatch(updateIDsAndNames(newIDsAndNames)),
    updateCompetitions: (newCompetitions) => dispatch(updateCompetitions(newCompetitions))
})

export default connect( null, mapDispatchToProps )(LoadingScreen);

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
