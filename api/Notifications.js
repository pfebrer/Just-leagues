import * as Notifications from 'expo-notifications';
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

        Notifications.setNotificationCategoryAsync('chatNotification', [
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
        Notifications.addNotificationReceivedListener( notif => {

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
            }
        })

        // Handle notifications that arrive while the app is in the foreground.
        Notifications.setNotificationHandler({
            handleNotification: async (notif) => {
                const notify = Boolean(notif.remote && notif.data && notif.data.categoryId)
                return {
                    shouldPlaySound: notify,
                    shouldSetBadge: notify,
                    shouldShowAlert: notify
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
