import { Notifications} from 'expo';
import * as Permissions from "expo-permissions";

import Firebase from "./Firebase"
import { translate } from '../assets/translations/translationManager';

class NotificationManager {

    constructor(){
        
        this.createCategories()
    }

    registerForPushNotificationsAsync = async (uid) => {
        const {status: existingStatus} = await Permissions.getAsync(
            Permissions.NOTIFICATIONS
        );
        let finalStatus = existingStatus;
    
        // only ask if permissions have not already been determined, because
        // iOS won't necessarily prompt the user a second time.
        if (existingStatus !== 'granted') {
            // Android remote notification permissions are granted during the app
            // install, so this will only ask on iOS
            const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
            finalStatus = status;
    
        }
    
        // Stop here if the user did not grant permissions
        if (finalStatus !== 'granted') {
            return;
        }
    
        // Get the token that uniquely identifies this device
        let token = await Notifications.getExpoPushTokenAsync();
    
        let updates = {};
        updates["expoToken"] = token;
        Firebase.userRef(uid).update(updates);
    
    };

    createCategories(){

        Notifications.createCategoryAsync('chatNotification', [
            {
              actionId: 'reply',
              buttonTitle: translate("actions.reply"),
              textInput: { submitButtonTitle: 'Send', placeholder: translate("actions.write your reply") + "..."},
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          ]);
    }

    listenToNotifications = (navigation, states = {}, actions = {}) => {
        Notifications.addListener( notif => {

            if (notif.origin == "selected"){

                //Handle chat notifications
                if (notif.data && notif.data.categoryId == "chatNotification"){

                    if (notif.actionId == "reply" && notif.userText && states.currentUser){

                        let newMessage = {user: {_id: states.currentUser.id }, text: notif.userText}

                        Firebase.addNewMessage(notif.data.messagesPath, newMessage, () => {
                            navigation.navigate("Chat")
                        })

                    } else {
                        navigation.navigate("Chat")
                    }
                    
                }
                //Go to the corresponding chat
                //if notif.data = "Chat"
            }
            //If remote == false, the notification has been triggered on purpose from the device.
            //If remote == true, we are recieving the notification from the server, and we need to render it as we wish
            if ( notif.remote ){

                if (notif.data && notif.data.categoryId){
                    Notifications.dismissNotificationAsync(notif.notificationId)
                    Notifications.presentLocalNotificationAsync({...notif, ...notif.data})
                }
                
            } 

        })
    }

    _sendNotifications = (messages) => {

        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages)

        });

    }

}

export default new NotificationManager()
