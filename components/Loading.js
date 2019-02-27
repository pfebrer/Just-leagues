import React from 'react'
import {ActivityIndicator, ImageBackground, StatusBar, StyleSheet, Text, View,} from 'react-native';
import {firebase, firestore} from "../Firebase"

export default class Loading extends React.Component {
    constructor(props) {
        super(props)
        this.onConstruct()

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
            <ImageBackground style={{flex: 1}} source={require("../assets/images/loginBG2.jpg")}>
                <View style={styles.container}>
                    <Text style={styles.userCheck}>Comprovant usuari</Text>
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
