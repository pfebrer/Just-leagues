import React from 'react';
import {Button, StyleSheet, Text, View, ScrollView} from 'react-native';
import Firebase from "../api/Firebase";

import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import { translate } from '../assets/translations/translationManager';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'
import { List, ListItem } from 'native-base';


class SettingsScreen extends React.Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {

    }

    renderSettingFields = (settings, values) => {

        return Object.keys(settings).map( key => {
            
            let setting = settings[key]

            return (
                <ListItem key={key}>
                    <Text>{translate(setting.name) + "  " + values[key]}</Text>
                </ListItem>
            )
        })
    }

    renderSettings = (settingsObject, currentValues) => {

        let list = []

        Object.keys(settingsObject).forEach( settingsType => {

            list.push(
                <ListItem key={settingsType} itemDivider>
                    <Text>{settingsType}</Text>
                </ListItem>
            )

            this.renderSettingFields(settingsObject[settingsType], currentValues[settingsType]).forEach(
                listitem => list.push( listitem )
            )
            
        })

        return list
        
    }

    render() {

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={{justifyContent: "center",alignItems: "center"}}>
                    <List style={styles.settingsList}>
                        {this.renderSettings(USERSETTINGS, this.props.currentUser.settings)}
                    </List>
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
        backgroundColor: "white",  
    },

    scrollView: {
        flex: 1,
    },

    settingsList: {
        width: w(100),
    },

    signOutButton: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        width: w(60),
        height: h(6),
        borderRadius: h(3),
        marginTop: 20,
        elevation: 5
    },

    signOutText: {
        color: "white",
        fontSize: totalSize(1.8),
        fontFamily: "bold"
    },
});