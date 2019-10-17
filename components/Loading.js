import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import Firebase from "../api/Firebase"
import {Collections} from "../constants/CONSTANTS";
import { translate } from '../assets/translations/translationManager';

export default class Loading extends React.Component {

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
              this.props.navigation.navigate('App');
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
                this.props.navigation.navigate('Auth');
            }
        });
    }


    render() {
        return (
            <ImageBackground style={{flex: 1}} source={this.status.bg}>
                <View style={styles.container}>
                    <Text style={styles.userCheck}>{this.status.msg}</Text>
                    <ActivityIndicator size="large" color="#FFFFFF"/>
                    <StatusBar barStyle="default"/>
                </View>
            </ImageBackground>
        )
    }
}
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
