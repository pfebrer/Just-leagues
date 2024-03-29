import React from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {Button} from "native-base"
import Modal from "react-native-modal";

import Firebase from "../api/Firebase";
import EndingPeriodModal from "../components/groups/EndingPeriodModal";
import Spinner from 'react-native-loading-spinner-overlay';
import { isError } from '../assets/utils/utilFuncs'
import {Constants} from "../constants/CONSTANTS";

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"

import { translate } from '../assets/translations/translationWorkers';
import { w, totalSize } from '../api/Dimensions';


import _ from "lodash"
import { selectCurrentCompetition, selectSuperChargedCompetitions } from '../redux/reducers';
import InputField from '../components/configs/inputs';

class AdminScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            groupGeneratingModal: false,
            newPeriodDue: undefined,
            spinner: false,
            competitions: [],
        };

    }

    componentDidMount() {

        this.props.navigation.setOptions({headerTitle: translate("tabs.competitions handling")})

        let editableComps = _.filter(this.props.competitions, (obj) => this.props.currentUser.gymAdmin.indexOf(obj.gymID) >= 0)

        if (!this.props.competition){
            this.props.setCurrentCompetition(editableComps[0].id)
        }
        
        this.setState({
            competitions: editableComps
        })
        
    }

    renderCompPicker = (competitions, currentComp) => {

        let pickerItems = competitions.map(comp=> ({label:comp.name, value:comp.id}) )

        let selected = currentComp ? currentComp.id : competitions.length > 0 ? competitions.id : null;

        return (
            <View style={styles.compSelectionView}>
                <Text>{translate("info.choose the competition that you would like to edit")}</Text>
                <View style={styles.compPickerView}>
                    <InputField
                        type="picker"
                        value={selected}
                        style={styles.compPicker}
                        onValueChange={(itemValue, itemIndex) =>
                            this.props.setCurrentCompetition(competitions[itemIndex].id)
                        }
                        items={pickerItems}/>
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
                            onPress={()=>this.props.navigation.navigate("SettingsScreen", {configurableDoc: "competition"})}
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
                                this.props.navigation.navigate("PlayersManagementScreen")
                            }}
                            >
                            <Text style={styles.buttonText}>{translate("admin.manage players")}</Text>
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
                            onPress={() => {
                                this.props.navigation.navigate("EndPeriodScreen")
                            }}
                            >
                            <Text style={styles.buttonText}>{translate("admin.generate new ranking")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}
                            onPress={() => {
                                this.props.navigation.navigate("EndPeriodScreen")
                            }}
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
                            onPress={this.updateAllGroupScores}
                            >
                            <Text style={styles.buttonText}>{translate("admin.update group scores")}</Text>
                        </Button>
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            style={styles.button}   
                            onPress={()=>{this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name})}}
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

    updateRanking = () => {
        this.callFunction('updateRankingHttp');
    };

    updateGroups = () => {
        this.callFunction('updateGroups');
    };

    updateAllGroupScores = () => {
        /*Updates the scores of all groups in the competition, just in case some of them were wrong*/

        const {gymID, id: compID, groups} = this.props.competition
        
        let i = 0
        const maxI = groups.length - 1
        const interval = setInterval(() => {

            if (i > maxI) clearInterval(interval)
            else {
                Firebase.updateGroupScores(gymID, compID, groups[i].id)
                i += 1
            }
        }, 500)
        
    }

    toggleGroupGeneratingModal = () => {
        this.setState({groupGeneratingModal: !this.state.groupGeneratingModal})
    }

    generateGroups = async () => {

        this.setState({groupGeneratingModal: false})

        const groupsGenerated = await Firebase.generateGroups(this.props.competition, {due: this.state.newPeriodDue})
        
        if ( !isError(groupsGenerated)) {
            this.props.navigation.navigate("CompetitionScreen", {competitionName: this.props.competition.name})
        }
        
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
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
                <Spinner
                    visible={this.state.spinner}
                    textContent={this.state.spinnerText}
                    textStyle={styles.spinnerTextStyle}
                />
                {this.renderCompPicker(this.state.competitions, this.props.competition)}
                {this.renderEditingOptions(this.props.competition)}
                {endingPeriodModal}
                <Modal
                    isVisible={this.state.groupGeneratingModal}
                    swipeDirection={["left", "right"]}      
                    onSwipeComplete={(swipeDirection) => this.toggleGroupGeneratingModal()}
                    onBackdropPress={this.toggleGroupGeneratingModal}
                    >
                    <View style={styles.modalContent}>
                        <Text>{translate("admin.choose a time limit to play matches")}</Text>
                        <InputField
                            type="datetime"
                            minimumDate={new Date()}
                            value={this.state.newPeriodDue}
                            onValueChange={(value) => this.setState({newPeriodDue: value})}
                            containerStyle={{flexDirection: "row", padding: 30, justifyContent: "center", alignItems: "center"}}
                            format="DD-MM-YYYY HH:mm"
                            />

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
            </ScrollView>
        );
    }
    
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
    competitions: selectSuperChargedCompetitions(state)
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "white",
        paddingTop: 30,
    },

    scrollViewContent: {
        paddingBottom: 50,
        alignItems: "center",
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