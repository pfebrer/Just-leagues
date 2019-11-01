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
import { storeUserData, updateIDsAndNames } from "../redux/actions"

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
            this.status.bg = require("../assets/images/loginBG2.jpg");
            console.log("Loading::status.bg", this.status.bg);
        }
        // this.setState(status);
    }

    onConstruct = async () => {

        //Listen for any change on the authorization state (even logouts)
        const unsub = Firebase.auth.onAuthStateChanged(user => {

            //We will store here the listeners for all the users that are in our competitions
            if (this.usersListeners){
                //First we need to desubscribe from all previous listeners
                Object.keys(this.usersListeners).forEach(compID => this.usersListeners[compID]())
            }
            this.usersListeners = {} 

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

                        });
                    }
                    
                    if (newSettings){

                        Firebase.updateUserSettings(user.uid, newSettings)
                        
                    } else {

                        this.props.storeUserData({activeCompetitions: [], id: user.uid,...userData})

                        console.log("User signed in ---> Redirect to the home screen")

                        this.props.navigation.navigate('App');

                        /*Toast.show({
                        text: 'Benvingut, ' + userData.firstName + '!',
                        duration: 3000
                        })*/

                        /* Firebase.gymRef("nickspa").collection("matches").get()
                        .then((query) => {

                            query.forEach(doc => {
                                Firebase.gymRef("nickspa").collection("competitions").doc("UmtaUDr98rdx5pFKrygI").collection("matches").doc(doc.id).set(doc.data()).then(()=>{}).catch(()=>{})
                            })
                            
                        }).catch(()=>{}) */

                    }

                    

                    

                })
              
                /*this.usersRef.doc(user.uid).get().then((docSnapshot) => {
                    if(docSnapshot.exists) {
                        this.props.navigation.navigate('App');
                    } else {
                        alert('User not exists in [' + Collections.USERS + '] database');
                    }
                }).catch((err) => {
                    alert('User not exists in ['+ Collections.USERS + '] database\n\nError: ' + err.message)
                });*/

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
                    <ActivityIndicator size="large" color="#FFFFFF"/>
                    <StatusBar barStyle="default"/>
                </View>
        
    }
}

const mapDispatchToProps = dispatch => ({
    storeUserData: (uid, userData) => dispatch(storeUserData(uid, userData)),
    updateIDsAndNames: (newIDsAndNames) => dispatch(updateIDsAndNames(newIDsAndNames))
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
