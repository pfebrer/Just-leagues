import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import Firebase from "../api/Firebase"
import { translate } from '../assets/translations/translationManager';
import { Toast } from 'native-base';
import {Notifications} from "expo";
import * as Permissions from "expo-permissions";

import { updateSettings } from "../assets/utils/utilFuncs"
import { USERSETTINGS } from "../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'
import { storeUserData } from "../redux/actions"

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
            //If there is a logged in user, go to the main page
            if (user) {

                this.registerForPushNotificationsAsync(user.uid)

                Firebase.userRef(user.uid).get()
                .then((docSnapshot) => {

                    let userData = docSnapshot.data()

                    let newSettings = updateSettings(userData.settings, USERSETTINGS)

                    if (newSettings) {
                        userData = { ...userData, settings: newSettings}
                    }

                    this.props.storeUserData(user.uid, userData)

                    if (newSettings){
                        Firebase.userRef(user.uid).set({settings:newSettings},{merge: true});
                    }

                    /*Toast.show({
                        text: 'Benvingut, ' + userData.firstName + '!',
                        duration: 3000
                    })*/
                    console.log("User signed in ---> Redirect to the home screen")
                    this.props.navigation.navigate('App');

                })
                .catch((err)=> {this.props.navigation.navigate('App');})
              
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
    storeUserData: (uid, userData) => dispatch(storeUserData(uid, userData))
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
