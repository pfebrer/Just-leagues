import React from 'react';
import {Button, StyleSheet, Text, View} from 'react-native';
import {auth, functions} from "../Firebase";
import EndingPeriodModal from "./editingComponents/EndingPeriodModal";
import Spinner from 'react-native-loading-spinner-overlay';


export default class EditingScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            endingPeriodModal: false,
            spinner: false
        };
        // this.playersRef = firestore.collection("players");
        // this.userId = auth.currentUser.uid;
        // this.matchesRef = firestore.collection("matches");
        // this.rankingRef = firestore.collection("rankings");
    }

    componentDidMount() {

        // this.rankingRef.onSnapshot((querySnapshot) => {
        //     querySnapshot.forEach((doc) => {
        //             let {ranking} = doc.data();
        //             this.setState({
        //                 ranking: ranking,
        //             })
        //         }
        //     )
        // });
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
        this.callFunction('updateRanking', this.callFunction('updateGroups'));
    };

    callFunction = (functionName, callback, errorFn) => {

        if (callback === undefined || callback === null) {
            callback = (data) => {
                console.log("EditingScreen::callFunction::callback", data); // hello world
                this.setState({spinner: false});
            };
        }
        if (errorFn === undefined || errorFn === null) {
            errorFn = (httpsError) => {
                console.log("EditingScreen::callFunction::errorFn", httpsError); // bar
                this.setState({spinner: false});
            };
        }
        console.log("EditingScreen::callFunction functionName[" + functionName + "]");

        functions.httpsCallable(functionName)().then(callback).catch(errorFn);
    };

    render() {
        let endingPeriodModal = this.state.endingPeriodModal ? (
            <EndingPeriodModal toggleEndingPeriodModal={this.toggleEndingPeriodModal}/>
        ) : null;

        return (
            <View style={styles.container}>
                <Spinner
                    visible={this.state.spinner}
                    textStyle={styles.spinnerTextStyle}
                />
                <View style={styles.titleView}>
                    <Text style={styles.titleText}>GESTIÓ COMPETICIÓ</Text>
                </View>
                <View style={styles.questionView}>
                    <Text style={styles.questionText}>Estàs a la pantalla d'edició de la competició. Què vols
                        fer?</Text>
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={() => {
                            console.log('[PRESS] Editar el ranking manualment')
                        }}
                        title="Editar el ranking manualment"
                        color="#303030"
                        accessibilityLabel="Editar el ranking manualment"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={() => {
                            console.log('[PRESS] Afegir/treure jugadors')
                        }}
                        title="Afegir/treure jugadors"
                        color="#303030"
                        accessibilityLabel="Afegir/treure jugadors"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={() => {
                            console.log('[PRESS] Finalitzar periode de competició')
                        }}
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
                        onPress={this.updateRanking}
                        title="Update Ranking"
                        color="#303030"
                        accessibilityLabel="Update Ranking"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={this.updateGroups}
                        title="Update Groups"
                        color="#303030"
                        accessibilityLabel="Update Groups"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={this.tancarMes}
                        title="Tancar Mes"
                        color="#303030"
                        accessibilityLabel="Tancar Mes"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={() => {
                            this.props.navigation.navigate("Classifications")
                        }}
                        title="Torna a Classificacions"
                        color="#303030"
                        accessibilityLabel="Tancar Mes"
                    />
                </View>
                {endingPeriodModal}
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