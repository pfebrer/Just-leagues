import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import Firebase from "../api/Firebase";

import { TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';


export default class SettingsScreen extends React.Component {

    constructor(props) {
        super(props);

    }

    componentDidMount() {

    }

    render() {

        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={Firebase.signOut}>
                    <Text> Sign Out </Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "white",
        paddingTop: 30,
    }
});