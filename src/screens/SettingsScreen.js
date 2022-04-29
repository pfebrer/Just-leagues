import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, BackHandler, Alert} from 'react-native';
import Firebase from "../api/Firebase";

import { translate } from '../assets/translations/translationWorkers';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS, COMPSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'
import { Text, Button } from 'native-base';

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

    // componentDidUpdate(prevProps) {

    //     //When the screen is focused change the state
    //     if ( this.props.isFocused && !prevProps.isFocused ) {

    //         this.setUpComponent()
            
    //     }
    // }

    componentDidMount() {

        this.setUpComponent()

        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.goBack );
    }

    setUpComponent = () => {

        //Decide which type of settings is going to be displayed

        let configurableDoc = this.props.route.params?.configurableDoc || "user"

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
                style={styles.settingField}
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
                <View key={settingsType} style={styles.itemDivider}>
                    <Text style={styles.itemDividerText}>{translate( [this.state.translateRoot, settingsType].join(".") )}</Text>
                </View>
            )

            this.renderSettingFields(settingsObject[settingsType], currentValues[settingsType], settingsType).forEach(
                listitem => list.push( listitem )
            )
            
        })

        return list
        
    }

    render() {

        this.props.navigation.setOptions({
            title: this.props.route.params?.title || translate("tabs.settings"),
            headerLeft: () => <HeaderIcon name="arrow-back" onPress={this.goBack}/>,
            headerRight: () => <View style={{flexDirection: "row"}}>
                            {this.props.route.params?.restoreButton ? <HeaderIcon name="refresh" onPress={this.restoreDefaults}/> : null }
                            <HeaderIcon name="checkmark" onPress={this.submitSettings}/>
                        </View>
        })

        if (!this.state.settingsTemplate || !this.state.settings) return null

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={{justifyContent: "center",alignItems: "center"}} nestedScrollEnabled>
                    <View style={styles.settingsList}>
                        {this.renderSettings(this.state.settingsTemplate, this.state.settings)}
                    </View>
                    <Button alignSelf="center" backgroundColor="salmon" style={styles.logOutButton} onPress={Firebase.signOut}>
                        <Text style={styles.signOutText}>
                            {translate("auth.sign out")}
                        </Text>
                    </Button>
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
        marginBottom: 10
    },

    itemDivider: {
        backgroundColor: "#ccc",
        padding: 20,
    },

    itemDividerText: {
        fontWeight: "bold",
    },

    settingField: {
        padding: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
    },

    rightView: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },

    logOutButton: {
        marginVertical: 20,
    },

    signOutText: {
        color: "darkred",
        fontFamily: "bold"
    },
});