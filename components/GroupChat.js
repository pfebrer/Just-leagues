import React from 'react';
import {
    BackHandler,
    ImageBackground,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import ChatMessage from "./chat/ChatMessage"
import Firebase from "../api/Firebase"
import {MaterialIcons} from '@expo/vector-icons';
import {ChatWorkMode, Collections, Documents, Constants} from "../constants/CONSTANTS";

export default class GroupChat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            messages: [],
        };

        this.textInputRef = React.createRef()
    }

    componentDidMount() {
        //BackHandler.addEventListener('hardwareBackPress', ()=>{return true;});
        this.userId = Firebase.auth.currentUser.uid;
        this.groupsRef = Firebase.firestore.collection(Collections.GROUPS);
        this.playerRef = Firebase.firestore.collection(Collections.PLAYERS).doc(this.userId);
        this.playerRef.get().then((docSnapshot) => {
            const {playerName, currentGroup} = docSnapshot.data();
            debugger;
            let title = "";
            let workMode = this.props.navigation.getParam('workMode', 'group');
            if (workMode === ChatWorkMode.group) {
                title = "Xat del grup " + currentGroup;
            } else {
                title = "Xat general";
            }
            this.props.navigation.setParams({title: title});
            this.setState({
                workMode: workMode,
                group: currentGroup,
                title: title,
                playerName
            });
        }).catch(err => alert("No s'ha pogut determinar de quin grup ets.\nError: " + err.message));

    }

    componentDidUpdate(prevProps, prevState) {
        let groupCollection = this.state.workMode === ChatWorkMode.group ? String(this.state.group) : Documents.GROUPS.generalMessages;
        if (prevState.group !== this.state.group) {
            this.unsub = this.groupsRef.doc(groupCollection).collection(Documents.GROUPS.chatMessages).orderBy("date").onSnapshot((querySnapshot) => {
                let messages = this.state.messages;
                querySnapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const {playerName, message, date} = change.doc.data();
                        messages.push([playerName, message, date])
                    }
                });
                this.setState({
                    messages
                });
            }, err => {
                console.error(err)
            });
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => {
        });
        this.unsub()
    }

    renderMessages = () => {
        let messages = this.state.messages;
        let renderedMessages = [];
        let fullMessage = [];
        let timeToSplit = 1800 * 1000;
        messages.forEach(([playerName, message, date], index) => {
            let lastMessage = messages[index - 1] || false;
            let nextMessage = messages[index + 1] || false;

            //Anem construint el missatge
            if (lastMessage[0] != playerName || date - lastMessage[2] > timeToSplit) {
                fullMessage = [];
            }
            fullMessage.push(message);//El renderitzem quan ja el tenim tot
            if (nextMessage[0] != playerName || nextMessage[2] - date > timeToSplit) {
                fullMessage.unshift(date)
                renderedMessages.push(
                    <ChatMessage key={"message" + index} loggedInUser={this.state.playerName}
                                 playerName={playerName} message={fullMessage}/>
                );
            }
        })

        return renderedMessages;
    }

    sendMessage = () => {
        let groupCollection = this.state.workMode === ChatWorkMode.group ? String(this.state.group) : Documents.GROUPS.generalMessages;
        if (this.state.newMessage) {
            const date = Date.now()
            this.groupsRef.doc(groupCollection).collection(Documents.GROUPS.chatMessages).doc(String(date)).set({
                date,
                playerName: this.state.playerName,
                message: this.state.newMessage.trim()
            }).then(() => {
                this.textInputRef.current.clear();
            }).catch(err => alert("No s'ha pogut enviar el missatge\nError: " + err.message))
        }

    }

    //This function determines where is the title located in the Y dimension to provide the vertical offset
    //for the keyboard avoiding view (otherwise it doesn't take the header into account)
    handleLayoutChange() {
        this.titleRef.measure( (fx, fy, width, height, px, py) => {
          this.setState({verticalOffset: py - Constants.paddingTopHeader})
        })
    }

    render() {

        let bgResourceId = this.state.workMode === ChatWorkMode.group ? require("../assets/images/loginBG.jpg") : require("../assets/images/loginBG2.jpg")
        return (
            <ImageBackground style={{flex: 1}} source={bgResourceId}>
                <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={this.state.verticalOffset} enabled>
                    <View style={styles.chatTitleView} onLayout={(event) => {this.handleLayoutChange() }} 
                        ref={view => { this.titleRef = view; }}>
                        <Text style={styles.chatTitleText}>{this.state.title}</Text>
                    </View>
                    <ScrollView style={styles.chatContainer}
                                ref={ref => this.scrollView = ref}
                                onContentSizeChange={(contentWidth, contentHeight) => {
                                    this.scrollView.scrollToEnd({animated: true});
                                }}>
                        {this.renderMessages()}
                    </ScrollView>
                    <View style={{flexDirection: "row"}}>
                        <TextInput style={styles.textInput}
                                   onChangeText={(text) => this.setState({newMessage: text})}
                                   ref={this.textInputRef}
                                   placeholder="Escriu aquí el teu missatge..."
                                   multiline={true}/>
                        <TouchableOpacity style={styles.sendButton} onPress={() => {
                            this.sendMessage()
                        }}>
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
        flex: 1,
        paddingTop: 20,
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
        flex: 1,
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
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    }
});