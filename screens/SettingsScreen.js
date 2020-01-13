import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, BackHandler, Alert} from 'react-native';
import Firebase from "../api/Firebase";

import { translate } from '../assets/translations/translationManager';
import { w, totalSize, h } from '../api/Dimensions';

import { USERSETTINGS, COMPSETTINGS } from "../constants/Settings"
import { connect } from 'react-redux'
import { List, ListItem, Body, Right, Icon, Text, Button, Form, Item, Label, Input} from 'native-base';
import { ColorPicker , fromHsv} from 'react-native-color-picker'

import HeaderIcon from "../components/header/HeaderIcon"
import NumericInput from "../components/settings/NumericInput"

import { withNavigationFocus } from 'react-navigation';

import {deepClone} from "../assets/utils/utilFuncs"

import _ from "lodash"
import { selectCurrentCompetition } from '../redux/reducers';
 
const Picker = (props) => (
    <View style={{height: h(60)}}>
        <ColorPicker
        oldColor={props.currentValue}
        onColorChange={props.onColorChange}
        style={{flex: 1, paddingHorizontal: 30}}/>
    </View>
    
)


class SettingsScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state ={
            modalComponent: undefined,
        }

        //Auxiliary variable to store future changes in settings
        this.temp = null

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

    componentDidUpdate(prevProps) {

        //When the screen is focused change the state
        if ( this.props.isFocused && !prevProps.isFocused ) {

            this.setUpComponent()
            
        }
    }

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

    updateStateSettings = (type, key, newValue) => {

        let newSettings = deepClone(this.state.settings)

        newSettings[type][key] = newValue

        this.setState({
            modalComponent: undefined,
            settings: newSettings
        })
    }

    goBack = () => {

        if(this.state.modalComponent){

            this.setState({modalComponent: undefined})

            return true

        } else {

            //this.setState({settings: deepClone(this.props.currentUser.settings)})
            this.props.navigation.goBack()

            return true
            
        }
    }

    submitSettings = () => {

        if(this.state.modalComponent){

            if (this.temp){

                this.updateStateSettings(this.temp.settingType, this.temp.settingKey, this.temp.value)

                this.temp = null
            } else {

                this.goBack()
            }
            
        } else {

            this.state.submitFunction(this.state.settings, this.props.navigation.goBack)

        }

    }

    renderSettingFields = (settings, values, settingsType) => {

        return Object.keys(settings).map( key => {
            
            let setting = settings[key]

            let rightContent = this.getRightContent(setting.control, values[key], settingsType, key)
            let description = setting.description ? <Text note>{translate(setting.description)}</Text> : null

            /*There are two types of settings: Those that use an input field of the full width, and those whose control is only in
            the right side and the description and name stays at the left side.*/
            if (setting.control.type == "text"){
                return (
                    <ListItem key={key}>
                        <Form style={{width: "100%"}}>
                            <Item inlineLabel style={{marginTop: 0, marginBottom: 10}}>
                                <Label >{translate(setting.name)}</Label>
                                <Input
                                    onChangeText={ text => this.updateStateSettings(settingsType, key, text)}
                                    value={values[key]}/>
                            </Item>
                            <View style={{paddingLeft: 15}}>
                                {description}
                            </View> 
                        </Form>
                    </ListItem>
                )
            } else {
                return (
                    <ListItem key={key}>
                        <Body>
                            <Text>{translate(setting.name)}</Text>
                            {description}
                        </Body>
                        <Right style={styles.rightView}>
                            {rightContent}
                        </Right>
                    </ListItem>
                )
            }
        })
    }

    getRightContent = (settingControl, currentValue, settingType, settingKey) => {

        if (settingControl.type == "colorWheel") {

            return <TouchableOpacity 
                        style={{width: 30, height: 30, backgroundColor: currentValue, elevation: 5}} 
                        onPress={() => this.setState( 
                            {
                                modalComponent: Picker({
                                    currentValue: _.cloneDeep(currentValue),
                                    onColorChange: (color) => {this.temp = {value: fromHsv(color), settingType, settingKey}}
                                }),
                                headerTitle: translate([this.state.translateRoot, settingKey].join("."))
                            })}>
                    </TouchableOpacity>

        } else if (settingControl.type == "integer") {

            return <NumericInput 
                    control={settingControl} 
                    value={currentValue} 
                    onValueChange={(value) => this.updateStateSettings(settingType, settingKey, value)}/>
        } else if (settingControl.type == "text") {

            return null
        }
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

        if (this.state.modalComponent){
            return this.state.modalComponent
        }

        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={{justifyContent: "center",alignItems: "center"}}>
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

export default connect(mapStateToProps)(withNavigationFocus(SettingsScreen));

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