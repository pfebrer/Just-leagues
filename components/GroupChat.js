import React from 'react';
import { StyleSheet, View, Text, ImageBackground, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, BackHandler} from 'react-native';
import ChatMessage from "./chatComponents/ChatMessage"
import {firebase , firestore} from "../Firebase"
import { MaterialIcons } from '@expo/vector-icons';

export default class GroupChat extends React.Component {  

    constructor() {
        super()
        this.state = {
            messages: [],
        };

        this.textInputRef = React.createRef()
    }

    componentDidMount () {
        //BackHandler.addEventListener('hardwareBackPress', ()=>{return true;});
        this.userId = firebase.auth().currentUser.uid;
        this.groupsRef = firestore.collection("groups");
        this.playerRef = firestore.collection("players").doc(this.userId);
        this.playerRef.get().then((docSnapshot) => {
            const {playerName, currentGroup} = docSnapshot.data();
            this.setState({
                group: currentGroup,
                playerName
            });
        }).catch(err => alert("No s'ha pogut determinar de quin grup ets.\nError: "+err.message));
    }

    componentDidUpdate (prevProps, prevState) {
        if (prevState.group != this.state.group){
            this.unsub = this.groupsRef.doc(String(this.state.group)).collection("chatMessages").orderBy("date").onSnapshot((querySnapshot)=> {
                let messages = this.state.messages;
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type == "added") {
                        const {playerName,message,date} = change.doc.data();
                        messages.push([playerName,message,date])
                    }
                });
                this.setState({
                    messages
                });
            },err =>{});
        }
    }

    componentWillUnmount () {
        BackHandler.removeEventListener('hardwareBackPress', ()=>{});
        this.unsub()
    }

    renderMessages = () => {
        let messages = this.state.messages;
        let renderedMessages = [];
        let fullMessage = [];
        let timeToSplit = 1800*1000;
        messages.forEach(([playerName,message,date],index) => {
            let lastMessage = messages[index-1] || false;
            let nextMessage = messages[index+1] || false;

            //Anem construint el missatge
            if (lastMessage[0] != playerName || date - lastMessage[2] > timeToSplit){
                fullMessage = [];
            }
            
            fullMessage.push(message);
            

            //El renderitzem quan ja el tenim tot
            if (nextMessage[0] != playerName || nextMessage[2] - date > timeToSplit){
                fullMessage.unshift(date)
                renderedMessages.push(
                    <ChatMessage key={"message"+index} loggedInUser={this.state.playerName} 
                    playerName={playerName} message={fullMessage}/>
                );
            }        
        })

        return renderedMessages;
    }

    sendMessage = () => {

        if (this.state.newMessage) {
            const date = Date.now()
            this.groupsRef.doc(String(this.state.group)).collection("chatMessages").doc(String(date)).set({
                date,
                playerName: this.state.playerName,
                message: this.state.newMessage.trim()
            }).then(() => {
                this.textInputRef.current.clear();
            }).catch(err => alert("No s'ha pogut enviar el missatge\nError: "+err.message))
        }
    
    }

    render() {
        let group = this.state.group;
        let title = this.state.group ? /^\d+$/.test(this.state.group) ? "Xat del grup "+group : "Xat general" : "";
        return (
            <ImageBackground style = {{flex:1}} source={require("../assets/images/loginBG.jpg")}>
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View style={styles.chatTitleView}>
                    <Text style={styles.chatTitleText}>{title}</Text>
                </View>
                <ScrollView style={styles.chatContainer}
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight)=>{        
                        this.scrollView.scrollToEnd({animated: true});
                    }}>
                    {this.renderMessages()}
                </ScrollView>
                <View style={{flexDirection:"row"}}>
                    <TextInput style={styles.textInput}
                    onChangeText={(text) => this.setState({newMessage:text})}
                    ref={this.textInputRef}
                    placeholder="Escriu aquí el teu missatge..."
                    multiline={true}/>
                    <TouchableOpacity style={styles.sendButton} onPress={()=>{this.sendMessage()}}>
                        <MaterialIcons name="send" size={25} color="white"/>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>    
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingTop:20,
        backgroundColor: "#ffec8b33",
    },
    chatTitleView: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 20,
    },
    chatTitleText: {
        fontSize: 25,
        fontFamily: "bold"
    },
    chatContainer: {
        flex:1,
    },
    textInput: {
        backgroundColor: "white",
        flex: 4,
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 15,
    },
    sendButton: {
        backgroundColor: "green",
        alignItems:"center",
        justifyContent: "center",
        flex: 1,
    }
});