import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView} from 'react-native'
import {firebase,firestore} from "../Firebase"

export default class ChangePWModal extends Component {

    state = {

    }

    anyMistakes = () => {
        let mistake = false;
        let {oldPW,newPW,rnewPW} = this.state
        if (!(oldPW && newPW && rnewPW)){
            mistake = "No has omplert tots els camps!"
        } else if (newPW != rnewPW) {
            mistake = "Les contrasenyes no coincideixen."
        } else if (newPW.length < 6) {
            mistake = "La contrasenya ha de tenir com a mínim 6 caràcters"
        }

        return mistake;
    }
    reauthenticate = (currentPassword) => {
        var user = firebase.auth().currentUser;
        var cred = firebase.auth.EmailAuthProvider.credential(
            user.email, currentPassword);
        return user.reauthenticateAndRetrieveDataWithCredential(cred);
    }
    
    changePassword = () => {
        let mistake = this.anyMistakes()
        if (mistake) {
            alert(mistake)
        } else {
            let currentPassword = this.state.oldPW;
            let newPassword = this.state.newPW;
            this.reauthenticate(currentPassword).then(() => {
                var user = firebase.auth().currentUser;
                user.updatePassword(newPassword).then(() => {
                alert("Contrasenya actualitzada :)");
                this.props.hidePWModal()
                }).catch((error) => { alert("No s'ha pogut actualitzar la contrasenya\n"+error); });
            }).catch((error) => { alert("Pot ser que la contrasenya antiga no sigui correcta?\n"+error); });
        }  
    }

  render() {
    return (
      <KeyboardAvoidingView style = {styles.modalContainer} enabled behavior="padding" >
        <View style={styles.modalView}>
          <View style={styles.formView}>
            <Text>Contrasenya antiga:</Text>
            <TextInput placeholder="La teva contrasenya..." onChangeText={(oldPW)=>{this.setState({oldPW})}} secureTextEntry={true}/>
            <Text>Contrasenya nova:</Text>
            <TextInput placeholder="Nova contrasenya..." onChangeText={(newPW)=>{this.setState({newPW})}} secureTextEntry={true}/>
            <Text>Repeteix la nova contrasenya:</Text>
            <TextInput placeholder="Repeteix la contrasenya..." onChangeText={(rnewPW)=>{this.setState({rnewPW})}} secureTextEntry={true} />
          </View>
          <View style={styles.sessionOptions}>
            <TouchableOpacity style={styles.logOutButton} onPress={()=>{this.props.hidePWModal()}}>
                  <Text style={styles.logOutText}>Torna</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={()=>{
                this.changePassword()
                }}>
                  <Text style={styles.confirmText}>Confirma</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
    modalContainer:{
        position:"absolute",
        top:0,
        left:0,
        right:0,
        bottom:0,
        justifyContent: "center",
        backgroundColor: "#00000080"
    },
    modalView:{
        backgroundColor: "white",
    },
    formView: {
        paddingHorizontal:10,
        paddingVertical:20
    },
    confirmButton:{
        flex:1,
        backgroundColor: "green",
        alignItems: "center",
        justifyContent:"center",
    },
    confirmText:{
        color: "white",
        fontFamily:"bold"
    },
    logOutButton:{
        flex:1,
        alignItems: "center",
        justifyContent:"center",
        backgroundColor: "red"
    },
    logOutText:{
        color:"white",
        fontFamily: "bold"
    },
    sessionOptions:{
        height:40,
        flexDirection: "row"
    },
})
