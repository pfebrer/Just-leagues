import React, { Component } from 'react'
import { Text, StyleSheet, View } from 'react-native'

export default class ChatMessage extends Component {

    convertDate = (inputFormat) => {
        function pad(s) { return (s < 10) ? '0' + s : s; };
        var d = new Date(Number(inputFormat));
        let formattedDate;
        if (Date.now()-d < 24*3600*1000){
            formattedDate = [pad(d.getHours()), pad(d.getMinutes())].join(':')
        } else {
            formattedDate = [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/')
        }
        return formattedDate;
      }


    render() {
        const {loggedInUser, playerName} = this.props
        let isSelfMessage = loggedInUser == playerName;
        let displayedName = isSelfMessage ? "Jo" : playerName;
        let addStyles = isSelfMessage ? [styles.selfMessageRowView,styles.selfMessageCont, styles.selfNameView,styles.selfDateView] 
        : [styles.otherPersonMessageRowView, styles.otherPersonMessageCont, styles.otherPersonNameView,styles.otherPersonDateView];

        let fullMessage = this.props.message;
        let date = this.convertDate(fullMessage[0]);

        let renderedFullMessage = fullMessage.slice(1,fullMessage.length).map((message) => {
            return(
                <View key={Math.random()} style={[styles.messageView, addStyles[2]]}>
                    <Text>{message}</Text>
                </View>
            );  
        });

        return (
            <View style={[styles.messageRowView,addStyles[0]]}>
                <View style={[styles.messageCont,addStyles[1]]}>
                    <View style={[styles.nameView,addStyles[2]]}>
                        <Text style={styles.nameText}>{displayedName}</Text>
                    </View>
                    {renderedFullMessage}
                    <View style={[styles.dateView,addStyles[3]]}>
                        <Text>{date}</Text>
                    </View>
                </View>
            </View>
            
        )
    }
}

const styles = StyleSheet.create({
    messageRowView: {
        paddingBottom:25,
    },
    selfMessageRowView: {
        paddingLeft: 70,
        paddingRight: 10,
        alignItems: "flex-end",
    },
    otherPersonMessageRowView: {
        paddingLeft: 10,
        paddingRight: 70,
    },
    messageCont:{
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 3
    },
    selfMessageCont: {
        backgroundColor: "#52c957",
        borderBottomRightRadius: 0,
    },
    otherPersonMessageCont: {
        backgroundColor:"white",
        borderBottomLeftRadius: 0,
    },
    nameView: {
        paddingBottom:5,
    },
    selfNameView: {
        alignItems: "flex-end"
    },
    nameText: {
        fontFamily: "bold"
    },
    messageView: {
        paddingVertical: 1,
    },
    dateView: {
        position:"absolute",
        bottom:-21,
        paddingHorizontal:5,
        paddingBottom:2,
        borderBottomLeftRadius:1,
        borderBottomRightRadius:1
    },
    selfDateView:{
        backgroundColor:"#52c95780",
        right:0,
    },
    otherPersonDateView: {
        backgroundColor:"#ffffff80",
        left: 0,
    }
})

