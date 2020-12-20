import React from 'react';
import {
    KeyboardAvoidingView,
    SafeAreaView,
    StyleSheet,
    View,
    Platform,
    StatusBar,
} from 'react-native';
import {Text} from 'native-base'

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
import { selectCurrentCompetition } from '../redux/reducers';
import {setCurrentCompetition} from '../redux/actions'
import { selectUserSetting } from '../redux/reducers';

class ChatScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            target: {particularChat: true},
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

        else {
            this.props.setCurrentCompetition(this.props.currentUser.activeCompetitions[0])
        }
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

        if (!this.props.currentComp) return null

        let particularInfo = this.state.target.particularChat ? this.props.currentComp.getPlayerGroup(this.props.currentUser.id) : null;
        let users;

        if (particularInfo){
            
            //Get the names of the users, except own name
            users = particularInfo.playersIDs.reduce((users,uid) => {
                if (uid != this.props.currentUser.id) users.push(this.props.currentComp.renderName(this.props.relevantUsers[uid].names))
                return users
            }, [])

        }

        

        return (
            <View style={{flex: 1}}>
                <SafeAreaView style={{ flex:0, backgroundColor: 'white' }} />
                <View style={ {...styles.container, backgroundColor: this.props.backgroundColor}}>
                    <View style={{...styles.chatCarousel}}>
                        <ChatsCarousel
                            setNewMessagesTarget={this.setNewMessagesTarget}
                            messagesTarget={this.state.target}
                            titleTextStyle={styles.carouselItemTitleText}
                            chatSelectorTextStyle={styles.chatSelectorText}/>
                    </View>
                    {particularInfo ? <View style={styles.usersView}>
                        <Text note style={styles.usersText}>{users.join(", ")}</Text>
                    </View> : null}
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
            </View>
            
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    currentComp: selectCurrentCompetition(state),
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor"),
    relevantUsers: state.relevantUsers
})

const mapDispatchToProps = {
    setCurrentCompetition
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);

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

    usersView: {
        justifyContent: "center",
        paddingVertical: 5,
        alignItems: "center"
    },

    usersText: {

    }


});