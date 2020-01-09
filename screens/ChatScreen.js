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
    Platform,
    StatusBar
} from 'react-native';

import { GiftedChat, Bubble, Send} from 'react-native-gifted-chat'

import _ from "lodash"

import Firebase from "../api/Firebase"
import NotificationManager from "../api/Notifications"

//Redux stuff
import { connect } from 'react-redux'

import { translate } from '../assets/translations/translationManager';
import {getCompetitionName} from '../assets/utils/utilFuncs'
import moment from 'moment';
import { h, totalSize } from '../api/Dimensions';
import ChatsCarousel from '../components/chat/ChatsCarousel';
import { Icon } from 'native-base';

class ChatScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            target: {particularChat: false},
            messages: [],
        };

    }

    listenToMessages = () => {

        let {gymID, id: compID} = this.props.currentComp

        let target = {
            ...this.state.target,
            compType: this.props.currentComp.type,
            uid: this.props.currentUser.id
        }

        this.messagesListener = Firebase.onChatMessagesSnapshot(gymID, compID, target , ({context, messages}) => {

            messages = messages.map(message => {
                return {
                    ...message,
                    createdAt: message.createdAt.toDate(),
                    user: {
                        ...message.user,
                        name: this.props.currentComp.renderName(this.props.relevantUsers[message.user._id].names)
                    }
                }
            })

            this.setState({
                context,
                messages
            })

        })
    }

    componentDidMount() {
        if (this.props.currentComp) this.listenToMessages()
    }

    componentDidUpdate(prevProps, prevState) {
        if ( ! _.isEqual(prevProps.currentComp, this.props.currentComp) || ! _.isEqual(prevState.target, this.state.target) ) {

            this.listenToMessages()
        }
    }

    setNewMessagesTarget = (newTarget) => {
        //Target must be an object as following {particularChat: bool}

        if (  ! _.isEqual(newTarget, this.state.target) ){
            this.setState({target: newTarget})
        }

    }

    componentWillUnmount() {
        if (this.messagesListener) this.messagesListener()
    }

    sendMessages = (messages) => {
        messages.forEach( message => {
            Firebase.addNewMessage(this.state.context.messagesPath, message, () => {

                //After the message has been added, send the corresponding notifications
                let messages = []

                if (this.state.target.particularChat){

                    let authorName = this.props.currentComp.renderName(this.props.relevantUsers[this.props.currentUser.id].names)

                    this.state.context.playersIDs.forEach(uid => {

                        let user = this.props.relevantUsers[uid]
                        let title = translate("info.new group message") + " ("+getCompetitionName(this.props.currentComp)+")"
                        let body = authorName + ": "+ message.text

                        if (user && user.expoToken) {

                            
                            messages.push({
                                "to": user.expoToken,
                                "sound": "default",
                                title,
                                body,
                                "data": {"categoryId": "chatNotification", title, body, messagesPath: this.state.context.messagesPath},
                            });
                        }
                    })
                    
                }

                NotificationManager._sendNotifications(messages)
                
            })


        })
    }

    renderBubble(props){
        return (
            <Bubble
            {...props}
            wrapperStyle={{
                left: {
                    backgroundColor: "white",
                    elevation: 2
                },
                right: {
                    elevation: 2
                }
            }}
            />
        ) 
    }

    renderSend(props) {
        return (
            <Send
                {...props}
            >
                <View style={{paddingBottom: 10, paddingRight: 10, justifyContent: "center", alignContent: "center"}}>
                    <Icon name="send" style={{color: "#147efb"}}/>
                </View>
            </Send>
        );
    }

    /* renderFooter(props) {
        if (props.messages.length == 0) {
          return (
              <Text>{translate("info.no messages yet")}</Text>
          );
        }
        return null;
      } */

    render() {

        return (
            <View style={ {...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <View style={{...styles.chatCarousel}}>
                    <ChatsCarousel
                        setNewMessagesTarget={this.setNewMessagesTarget}
                        messagesTarget={this.state.target}
                        titleTextStyle={styles.carouselItemTitleText}
                        chatSelectorTextStyle={styles.chatSelectorText}/>
                </View>
                <GiftedChat
                    //Functionality
                    messages={this.state.messages}
                    user={{
                        _id: this.props.currentUser.id,
                    }}
                    onSend={(messages) => {this.sendMessages(messages)}}
                    loadEarlier={false}
                    renderBubble={this.renderBubble}
                    renderSend={this.renderSend}
                    //Aestethics
                    locale={moment.locale()}
                    placeholder={translate("actions.type a message") + "..."}
                    renderUsernameOnMessage
                    />
                {
                    Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
                }
            </View>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: state.competition,
    relevantUsers: state.relevantUsers
})

export default connect(mapStateToProps)(ChatScreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    chatCarousel: {
        height: h(20),
        elevation: 5,
        backgroundColor: "white",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },

    carouselItemTitleText: {
        fontSize: totalSize(2),
        fontFamily: "bold"
    },

    chatSelectorText: {
        fontSize: totalSize(1.6),
        textTransform: "uppercase"
    },


});