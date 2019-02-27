import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Picker} from 'react-native';
import {firebase , firestore} from "../../Firebase"
import 'firebase/functions'

export default class EndingPeriodModal extends React.Component {

    state = {
        nextTypeOfComp: "Grups",
    }

    updateComp = () => {
        var addMessage = firebase.functions().httpsCallable('addMessage');
        addMessage().then(function(result) {
            // Read result of the Cloud Function.
            var text = result.data.text;
            alert(text)
        });
    }

    render() {
        return (
        <View style={styles.matchModalContainer}>
            <View style={styles.matchModalView}>
                <View style = {styles.questionView}>
                    <Text style = {styles.questionText}>Selecciona el tipus de competició que vols per al pròxim periode</Text>
                </View>
                <Picker
                    selectedValue={this.state.nextTypeOfComp}
                    onValueChange={(itemValue, itemIndex) => this.setState({nextTypeOfComp: itemValue})}>
                    <Picker.Item label="Grups" value="Grups" />
                    <Picker.Item label ="Reptes" value = "Reptes" />
                    <Picker.Item label="Torneig" value="Torneig" />
                </Picker>
                <TouchableOpacity style={styles.hideModalButton} onPress={this.updateComp}>
                    <Text style={styles.addMatchText}>Actualitzar competició</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.hideModalButton} onPress={this.props.toggleEndingPeriodModal}>
                    <Text style={styles.dismissText}>Tornar enrere</Text>
                </TouchableOpacity>
            </View>
        </View>
        
        );
    }
}
  
const styles = StyleSheet.create({
  matchModalContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#00000066",
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 50,
  },
  matchModalView: {
    paddingVertical: 30,
    paddingHorizontal:20,
    borderRadius: 2,
    backgroundColor: "white"
  },
  hideModalButton: {
    paddingTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  questionView: {
      justifyContent: "center",
      alignItems: "center"
  },
  questionText: {
      textAlign: "center",
      fontFamily: "bold"
  },
  addMatchText: {
    color:"green",
    fontSize: 15
  },
  dismissText: {
    color:"darkred",
    fontSize: 15
  },
});