import React from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {firebase, firestore} from "../Firebase"
import EndingPeriodModal from "./editingComponents/EndingPeriodModal"

export default class EditingScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            endingPeriodModal: false,
        }
        this.playersRef = firestore.collection("players");
        this.userId = firebase.auth().currentUser.uid;
        this.matchesRef = firestore.collection("matches");
        this.rankingRef = firestore.collection("rankings");
    }

    componentDidMount() {

        this.rankingRef.onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                    let {ranking} = doc.data()
                    this.setState({
                        ranking: ranking,
                    })
                }
            )
        });
    }

    toggleEndingPeriodModal() {
        this.setState({
            endingPeriodModal: !this.state.endingPeriodModal
        })
    };

    updateRanking = () => {
        const httpsCallable = firestore.functions().httpsCallable('updateRankingHttp');
        httpsCallable.then((data) => {
            console.log(data); // hello world
        }).catch(httpsError => {
            console.log(httpsError.code); // invalid-argument
            console.log(httpsError.message); // Your error message goes here
            console.log(httpsError.details.foo); // bar
        });
    };

    updateGroups = () => {
        const httpsCallable = firestore.functions().httpsCallable('updateGroups');
        httpsCallable.then((data) => {
            console.log(data); // hello world
        }).catch(httpsError => {
            console.log(httpsError.code); // invalid-argument
            console.log(httpsError.message); // Your error message goes here
            console.log(httpsError.details.foo); // bar
        });
    };

    tancatMes = () => {
        const httpsCallableRanking = firestore.functions().httpsCallable('updateRanking');

        httpsCallableRanking.then((data) => {
            console.log(data); // hello world
            const httpsCallableGroup = firestore.functions().httpsCallable('updateGroups');
            httpsCallableGroup.then((data) => {
                console.log(data); // hello world
            }).catch(httpsError => {
                console.log(httpsError.code); // invalid-argument
                console.log(httpsError.message); // Your error message goes here
                console.log(httpsError.details.foo); // bar
            });
        }).catch(httpsError => {
            console.log(httpsError.code); // invalid-argument
            console.log(httpsError.message); // Your error message goes here
            console.log(httpsError.details.foo); // bar
        });
    };

    render() {

        let endingPeriodModal = this.state.endingPeriodModal ? (
            <EndingPeriodModal toggleEndingPeriodModal={this.toggleEndingPeriodModal}/>
        ) : null;

        return (
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.titleText}>GESTIÓ COMPETICIÓ</Text>
                </View>
                <View style={styles.questionView}>
                    <Text style={styles.questionText}>Estàs a la pantalla d'edició de la competició. Què vols
                        fer?</Text>
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={}
                        title="Editar el ranking manualment"
                        color="#303030"
                        accessibilityLabel="Editar el ranking manualment"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={}
                        title="Inicia sessió"
                        color="#303030"
                        accessibilityLabel="Afegir/treure jugadors"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={}
                        title="Finalitzar periode de competició"
                        color="#303030"
                        accessibilityLabel="Finalitzar periode de competició"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={}
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
                        onPress={this.tancatMes}
                        title="Tancar Mes"
                        color="#303030"
                        accessibilityLabel="Tancar Mes"
                    />
                </View>
                <View style={styles.buttonRow}>
                    <Button
                        onPress={() => {this.props.navigation.navigate("Classifications")}}
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