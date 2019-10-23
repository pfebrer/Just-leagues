import React from 'react';
import {Button, StyleSheet, Text, View, ScrollView} from 'react-native';
import Firebase from "../api/Firebase";

import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { translate } from '../assets/translations/translationManager';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'


class SettingsScreen extends React.Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {

    }

    renderSettings = () => {

    }

    render() {

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    {this.renderSettings(this.prop)}
                    <TouchableOpacity onPress={Firebase.signOut} style={styles.signOutButton}>
                        <Text style={styles.signOutText}> {translate("auth.sign out")}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(SettingsScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        backgroundColor: "white",  
        paddingTop: 30,
    },

    scrollView: {
        flex: 1,
    },

    signOutButton: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        height: h(6),
        borderRadius: h(3),
        elevation: 5
    },

    signOutText: {
        color: "white",
        fontSize: totalSize(1.8),
        fontFamily: "bold"
    }
});