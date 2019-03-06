import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import {firebase, firestore} from "../Firebase"

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
            this.status.msg = "Carregant usuari";
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
        this.usersRef = await firestore.collection("players");
        //firebase.auth().signOut();
        console.log('Loading::[START] checking checking user');
        const unsub = await firebase.auth().onAuthStateChanged(user => {
            // references to App and Login where declared in AppNavigator
            console.log('Loading::[STOP] checking user GoTo-> ', user ? 'App' : 'Auth');
            this.props.navigation.navigate(user ? 'App' : 'Auth');

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
