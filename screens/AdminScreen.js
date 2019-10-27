import React from 'react';
import {Button, StyleSheet, Text, View, Picker} from 'react-native';
import Firebase from "../api/Firebase";
import EndingPeriodModal from "../components/editing/EndingPeriodModal";
import Spinner from 'react-native-loading-spinner-overlay';
import {Constants} from "../constants/CONSTANTS";

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"
import { translate } from '../assets/translations/translationManager';

class AdminScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            endingPeriodModal: false,
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

        this.compListeners = [];

        this.props.currentUser.gymAdmin.forEach(gymID => {

            this.compListeners.push(Firebase.onCompetitionsSnapshot(gymID,
                    //THIS LINE DOES NOT REALLY SUPPORT DIFFERENT GYMS, YOU WILL GET THE COMPETITIONS OF THE LAST GYM
                    competitions => this.setState({competitions})
                )
            )

        });
        
    }

    componentWillUnmount(){
        //Dessubscribirse de listeners
        if (this.compListener) this.compListeners.forEach(listener => listener())
    }

    renderCompPicker = (competitions) => {

        let pickerItems = competitions.map(comp => <Picker.Item label={comp.name} value={comp} /> )

        return (
            <View>
                <Text>Tria la competició que vols editar</Text>
                <Picker
                    selectedValue={this.state.competitions[0]}
                    style={styles.compPicker}
                    onValueChange={(itemValue, itemIndex) =>
                        this.props.setCurrentCompetition(itemValue)
                    }>
                        {pickerItems}
                </Picker>
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
                            onPress={()=>{}}
                            title="Configuració de la competició"
                            color="#303030"
                            accessibilityLabel="Tancar Mes"
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            onPress={() => {
                                this.props.navigation.navigate("EditRankingScreen")
                            }}
                            title="Editar el ranking manualment"
                            color="#303030"
                            accessibilityLabel="Editar el ranking manualment"
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            onPress={this.tancarMes}
                            title="Finalitzar periode de competició"
                            color="#303030"
                            accessibilityLabel="Finalitzar periode de competició"
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            onPress={() => {
                            }}
                            title="Modificar partits"
                            color="#303030"
                            accessibilityLabel="Modificar partits"
                        />
                    </View>
                    <View style={styles.buttonRow}>
                        <Button
                            onPress={()=>{}}
                            title="Anar a pantalla de competició"
                            color="#303030"
                            accessibilityLabel="Tancar Mes"
                        />
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

    tancarMes = () => {
        /*S'hauria de fer per passos:
            - Comprovar que tots els grups estan bé (mostrant la pantalla de la competició.
            - Tancar mes i generar automàticament el nou ranking (avisant de amb quines opcions es generarà)
            - Modificar manualment el rànquing si es vol
            - Generar els nous grups
        */
        this.callFunction('updateRanking', this.callFunction('updateGroups'));
    };

    callFunction = (functionName, callback, errorFn) => {

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

        Firebase.functions.httpsCallable(functionName)({dbPrefix: Constants.dbPrefix}).then(callback).catch(errorFn);
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
                {this.renderCompPicker(this.state.competitions)}
                {this.renderEditingOptions(this.props.currentComp)}
                {endingPeriodModal}
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: state.competition
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
        paddingTop: 30,
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
    }
});