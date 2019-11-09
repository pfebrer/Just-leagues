import React from 'react';
import {StyleSheet, Text, View, Picker} from 'react-native';
import {Button} from "native-base"
import DatePicker from 'react-native-datepicker'
import Modal from "react-native-modal";
import moment from "moment"

import Firebase from "../api/Firebase";
import EndingPeriodModal from "../components/editing/EndingPeriodModal";
import Spinner from 'react-native-loading-spinner-overlay';
import {Constants} from "../constants/CONSTANTS";

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { translate } from '../assets/translations/translationManager';
import { COMPSETTINGS } from '../constants/Settings';
import { w, totalSize } from '../api/Dimensions';
import { TouchableOpacity } from 'react-native-gesture-handler';

import _ from "lodash"



class AdminScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            endingPeriodModal: false,
            groupGeneratingModal: false,
            newPeriodDue: undefined,
            spinner: false,
            competitions: [],
        };

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: translate("tabs.competitions handling"),
        }
    };

    componentDidMount() {

        let editableComps = _.filter(this.props.competitions, (obj) => this.props.currentUser.gymAdmin.indexOf(obj.gymID) >= 0)

        this.props.setCurrentCompetition(editableComps[0])

        this.setState({
            competitions: editableComps
        })
        
    }

    renderCompPicker = (competitions, currentComp) => {

        let pickerItems = competitions.map(comp=> <Picker.Item key={comp.id} label={comp.name} value={comp.id} /> )

        let selected = currentComp ? currentComp.id : competitions.length > 0 ? competitions.id : null;

        return (
            <View style={styles.compSelectionView}>
                <Text>{translate("info.choose the competition that you would like to edit")}</Text>
                <View style={styles.compPickerView}>
                    <Picker
                        selectedValue={selected}
                        style={styles.compPicker}
                        onValueChange={(itemValue, itemIndex) =>
                            this.props.setCurrentCompetition(competitions[itemIndex])

                        }>
                            {pickerItems}
                    </Picker>
                </View>
            </View>
        )
    }

    renderEditingOptions = (comp) => {

        if (!comp) {
            return null
        } else if (comp.type == "groups"){

            return (
                <View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={()=>{}}
                            disabled
                            >
                            <Text style={styles.buttonText}>{translate("admin.competition settings")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={this.toggleGroupGeneratingModal}
                            >
                            <Text style={styles.buttonText}>{translate("admin.generate groups")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={() => {
                                this.props.navigation.navigate("EditRankingScreen")
                            }}
                            >
                            <Text style={styles.buttonText}>{translate("admin.edit ranking manually")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={this.tancarMes}
                            disabled
                            >
                            <Text style={styles.buttonText}>{translate("admin.end competition period")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={()=>{this.props.navigation.navigate("CompetitionScreen")}}
                            >
                            <Text style={styles.buttonText}>{translate("admin.modify matches")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}   
                            onPress={()=>{this.props.navigation.navigate("CompetitionScreen")}}
                            >
                            <Text style={styles.buttonText}>{translate("admin.go to competition screen")}</Text>
                        </Button>
                    </View>
                </View>
            )
        
        } else {
            return null
        }
    }

    toggleEndingPeriodModal() {
        this.setState({
            endingPeriodModal: !this.state.endingPeriodModal
        });
    };

    updateRanking = () => {
        this.callFunction('updateRankingHttp');
    };

    updateGroups = () => {
        this.callFunction('updateGroups');
    };

    toggleGroupGeneratingModal = () => {
        this.setState({groupGeneratingModal: !this.state.groupGeneratingModal})
    }

    generateGroups = () => {

        let {gymID, id: compID} = this.props.currentComp

        Firebase.generateGroups(gymID, compID, this.props.currentComp.playersIDs, COMPSETTINGS.groups, {due: this.state.newPeriodDue},
            () => {
                this.setState({groupGeneratingModal: false})
                this.props.navigation.navigate("CompetitionScreen")
            }
        )

    }

    tancarMes = () => {
        /*S'hauria de fer per passos:
            - Comprovar que tots els grups estan bé (mostrant la pantalla de la competició.
            - Tancar mes i generar automàticament el nou ranking (avisant de amb quines opcions es generarà)
            - Modificar manualment el rànquing si es vol
            - Generar els nous grups
        */
        this.callFunction('updateRanking', {callback: this.callFunction('updateGroups')} );
    };

    callFunction = (functionName, {callback, errorFn, args}) => {

        this.setState({spinner: true});
        if (callback === undefined || callback === null) {
            callback = (data) => {
                console.log("AdminScreen::callFunction::callback", data); // hello world
                alert("SUCCESS: " + functionName + ", data:" + data.data);
                this.setState({spinner: false});
            };
        }
        if (errorFn === undefined || errorFn === null) {
            errorFn = (httpsError) => {
                console.log("AdminScreen::callFunction::errorFn", httpsError); // bar
                alert("ERROR: " + functionName + ", data:" + data.data);
                this.setState({spinner: false});
            };
        }
        console.log("AdminScreen::callFunction functionName[" + functionName + "]");

        Firebase.functions.httpsCallable(functionName)({dbPrefix: Constants.dbPrefix, ...args}).then(callback).catch(errorFn);
    };

    render() {

        //alert("this.state.isLoadingComplete"+this.state.isLoadingComplete);
        let endingPeriodModal = this.state.endingPeriodModal ? (
            <EndingPeriodModal toggleEndingPeriodModal={this.toggleEndingPeriodModal}/>
        ) : null;

        return (
            <View style={styles.container}>
                <Spinner
                    visible={this.state.spinner}
                    textContent={this.state.spinnerText}
                    textStyle={styles.spinnerTextStyle}
                />
                {this.renderCompPicker(this.state.competitions, this.props.currentComp)}
                {this.renderEditingOptions(this.props.currentComp)}
                {endingPeriodModal}
                <Modal
                    isVisible={this.state.groupGeneratingModal}
                    swipeDirection={["left", "right"]}
                    onSwipeComplete={(swipeDirection) => this.toggleGroupGeneratingModal()}
                    onBackdropPress={this.toggleGroupGeneratingModal}
                    >
                    <View style={styles.modalContent}>
                        <Text>{translate("admin.choose a time limit to play matches")}</Text>
                        <DatePicker
                            minDate={new Date()}
                            date={this.state.newPeriodDue}
                            onDateChange={(date) => {this.setState({newPeriodDue: moment(date, "DD-MM-YYYY HH:mm" ).toDate()})}}
                            style={{paddingHorizontal: 20, marginVertical: 20, width: "100%", justifyContent: "center", alignItems: "center"}}
                            mode="datetime"
                            placeholder={translate("vocabulary.fix a date")}
                            format="DD-MM-YYYY HH:mm"
                            customStyles={{
                                dateInput: {
                                borderWidth: 0,
                                },
                                dateText: {
                                    fontSize: totalSize(2)
                                }
                            }}/>

                        <Button
                            style={{...styles.button, ...styles.modalActionButton}}
                            onPress={this.generateGroups}>
                            <Text style={styles.buttonText}>{translate("admin.generate groups")}</Text>
                        </Button>

                        <Button
                            danger
                            style={{...styles.button, ...styles.modalActionButton}}
                            onPress={this.toggleGroupGeneratingModal}>
                            <Text style={styles.buttonText}>{translate("actions.go back")}</Text>
                        </Button>

                        
                        
                    </View>
                    
                </Modal>
            </View>
        );
    }
    
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: state.competition,
    competitions: state.competitions
})

const mapDispatchToProps = dispatch => ({
    setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(AdminScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "white",
        alignItems: "center",
        paddingTop: 30,
    },

    compSelectionView: {
        justifyContent: "center",
        alignItems: "center"
    },

    compPickerView: {
        width: w(80)
    },

    titleView: {
        justifyContent: "center",
        alignItems: "center"
    },
    titleText: {
        fontSize: 30,
        fontFamily: "bold"
    },
    buttonRow: {
        paddingTop: 30
    },

    button: {
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal: 30
    },

    buttonText: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: "bold",
        fontSize: totalSize(1.6)
    },

    //Group generating modal
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 5
    },

    modalActionButton: {
        marginVertical: 10
    }
});