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

//Redux stuff
import { connect } from 'react-redux'

import { translate } from '../assets/translations/translationManager';
import {renderName} from '../assets/utils/utilFuncs'
import moment from 'moment';
import { h, totalSize } from '../api/Dimensions';
import ChatsCarousel from '../components/chat/ChatsCarousel';
import { COMPSETTINGS } from '../constants/Settings';
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
                        name: renderName(this.props.IDsAndNames[message.user._id], COMPSETTINGS.general.nameDisplay )
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
            Firebase.addNewMessage(this.state.context.messagesPath, message)
        })
    }

    renderHeaderContent(){

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
    IDsAndNames: state.IDsAndNames
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