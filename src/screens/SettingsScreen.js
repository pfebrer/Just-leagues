import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, BackHandler, Alert} from 'react-native';
import Firebase from "../api/Firebase";

import { translate } from '../assets/translations/translationWorkers';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS, COMPSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'
import { List, ListItem, Body, Right, Icon, Text, Button, Form, Item, Label, Input} from 'native-base';

import HeaderIcon from "../components/UX/HeaderIcon"

import {deepClone} from "../assets/utils/utilFuncs"

import _ from "lodash"
import { selectCurrentCompetition } from '../redux/reducers';

import SettingField from '../components/configs/settingField';

class SettingsScreen extends React.Component {

    constructor(props){
        super(props)

        this.state = {}
    }

    static navigationOptions = ({navigation}) => {

        return {
            title: navigation.getParam("title", translate("tabs.settings")),
            headerLeft: <HeaderIcon name="arrow-back" onPress={navigation.getParam("goBack")}/>,
            headerRight: <View style={{flexDirection: "row"}}>
                            {navigation.getParam("restoreButton", true) ? <HeaderIcon name="refresh" onPress={navigation.getParam("restoreDefaults")}/> : null }
                            <HeaderIcon name="checkmark" onPress={navigation.getParam("submitSettings")}/>
                        </View>
        }
    };

    // componentDidUpdate(prevProps) {

    //     //When the screen is focused change the state
    //     if ( this.props.isFocused && !prevProps.isFocused ) {

    //         this.setUpComponent()
            
    //     }
    // }

    componentDidMount() {

        this.setUpComponent()

        this.props.navigation.setParams({submitSettings: this.submitSettings, goBack: this.goBack, restoreDefaults: this.restoreDefaults})

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.goBack );
    }

    setUpComponent = () => {

        //Decide which type of settings is going to be displayed

        let configurableDoc = this.props.navigation.getParam("configurableDoc", "user")

        if (configurableDoc == "user"){
            this.setState({
                settings: deepClone(this.props.currentUser.settings),
                settingsTemplate: USERSETTINGS,
                translateRoot: "settings",
                submitFunction: (settings, callback) => Firebase.updateUserSettings(this.props.currentUser.id, settings, callback),
                restoreFunction: (settingsToKeep, callback) => Firebase.restoreDefaultUserSettings(this.props.currentUser.id, settingsToKeep, callback)
            })

        } else if (configurableDoc == "competition") {

            this.props.navigation.setParams({title: this.props.currentComp.name, restoreButton: false})

            this.setState({
                settings: deepClone(this.props.currentComp.settings),
                settingsTemplate: COMPSETTINGS,
                translateRoot: "compsettings",
                submitFunction: (settings, callback) => Firebase.updateCompSettings(this.props.currentComp.gymID, this.props.currentComp.id, settings, callback)
            })

        }
    }

    componentWillUnmount() {
        this.backHandler.remove()
    }

    restoreDefaults = () => {

        reallyRestore = () => {
            this.state.restoreFunction(_.pick(this.props.currentUser.settings, ["Profile"]), this.setUpComponent)
        }

        Alert.alert(
            translate("vocabulary.attention"),
            translate("settings.you are about to restore default settings"),
            [
            {
                text: translate('vocabulary.cancel'),
                style: 'cancel',
            },
            {text: translate('vocabulary.OK'), onPress: reallyRestore},
            ],
            {cancelable: true},
        );
    }

    updateStateSettings = (type, key, newValue, config) => {

        let newSettings = deepClone(this.state.settings)

        newSettings[type][key] = newValue

        this.setState({
            settings: newSettings,
            modalComponent: undefined
        })
    }

    goBack = () => {

        this.props.navigation.goBack()

    }

    submitSettings = () => {

        this.state.submitFunction(this.state.settings, this.props.navigation.goBack)

    }

    renderSettingFields = (settings, values, settingsType) => {

        return Object.keys(settings).map( key => {
            
            let setting = settings[key]

            // let rightContent = this.getRightContent(setting.control, values[key], settingsType, key)

            return <SettingField 
                type={setting.control.type} 
                value={values[key]}
                onValueChange={(value) => this.updateStateSettings(settingsType, key, value)}
                {...setting}
            />

        })
    }

    renderSettings = (settingsObject, currentValues) => {

        let list = []

        Object.keys(settingsObject).forEach( settingsType => {

            list.push(
                <ListItem key={settingsType} itemDivider>
                    <Text>{translate( [this.state.translateRoot, settingsType].join(".") )}</Text>
                </ListItem>
            )

            this.renderSettingFields(settingsObject[settingsType], currentValues[settingsType], settingsType).forEach(
                listitem => list.push( listitem )
            )
            
        })

        return list
        
    }

    render() {

        if (!this.state.settingsTemplate || !this.state.settings) return null

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={{justifyContent: "center",alignItems: "center"}} nestedScrollEnabled>
                    <List style={styles.settingsList}>
                        {this.renderSettings(this.state.settingsTemplate, this.state.settings)}
                    </List>
                    <TouchableOpacity 
                        onPress={Firebase.signOut} 
                        transparent 
                        style={styles.signOutButton}>
                        <Text style={styles.signOutText}> {translate("auth.sign out")}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
            
        );
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: selectCurrentCompetition(state),
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

    rightView: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },

    signOutButton: {
        paddingVertical: 20
    },

    /*signOutButton: {
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        width: w(60),
        height: h(6),
        borderRadius: h(3),
        marginTop: 20,
        elevation: 5
    },*/

    signOutText: {
        color: "darkred",
        fontSize: totalSize(1.7),
        fontFamily: "bold"
    },
});