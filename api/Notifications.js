import { Notifications} from 'expo';
import * as Permissions from "expo-permissions";

import Firebase from "./Firebase"

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

        Notifications.createCategoryAsync('myCategoryName', [
            {
              actionId: 'vanillaButton',
              buttonTitle: 'Plain Option',
              isDestructive: false,
              isAuthenticationRequired: false,
            },
            {
              actionId: 'highlightedButton',
              buttonTitle: 'Destructive!!!',
              isDestructive: true,
              isAuthenticationRequired: false,
            },
            {
              actionId: 'requiredAuthenticationButton',
              buttonTitle: 'Click to Authenticate',
              isDestructive: false,
              isAuthenticationRequired: true,
            },
            {
              actionId: 'textResponseButton',
              buttonTitle: 'Click to Respond with Text',
              textInput: { submitButtonTitle: 'Send', placeholder: 'Type Something' },
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          ]);
    }

    listenToNotifications = (navigation, states = {}, actions = {}) => {
        Notifications.addListener( notif => {

            if (notif.origin == "selected"){
                //Go to the corresponding chat
                //if notif.data = "Chat"
                //navigation.navigate("Chat")
            }
            //If remote == false, the notification has been triggered on purpose from the device.
            //If remote == true, we are recieving the notification from the server, and we need to render it as we wish
            if ( notif.remote ){
                //Notifications.dismissNotificationAsync(notif.notificationId)
                //Notifications.presentLocalNotificationAsync({title: "Test", body: "This is a very long testThis is a very long testThis is a very long testThis is a very long testThis is a very long test", categoryId: 'myCategoryName' })
            } 

        })
    }


}

export default new NotificationManager()
