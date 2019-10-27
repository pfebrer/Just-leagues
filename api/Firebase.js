import firebase from "firebase";
import 'firebase/firestore';
import 'firebase/functions';

import { Toast } from 'native-base'
import {Collections, Subcollections, Constants, Documents} from "../constants/CONSTANTS";

import * as Google from 'expo-google-app-auth';

class Firebase {

  constructor(){

    //Here we initialize the app
    var firebaseConfig = {
      apiKey: "AIzaSyAHqGQDf55s2jACqlyn3ejicyk9ESrU3KM",
      authDomain: "squash-leagues-94b68.firebaseapp.com",
      databaseURL: "https://squash-leagues-94b68.firebaseio.com",
      projectId: "squash-leagues-94b68",
      storageBucket: "squash-leagues-94b68.appspot.com"
    };

    this.app = firebase.initializeApp(firebaseConfig);
    this.firestore = this.app.firestore();
    this.functions = this.app.functions();
    this.auth = this.app.auth();

  }

  //AUTHENTICATION STUFF
  /***Google***/
  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: "524738063553-1tr662gs9strhp1rvljj4qv588mbj254.apps.googleusercontent.com",
        //iosClientId: YOUR_CLIENT_ID_HERE,
        scopes: ['profile', 'email'],
      });
  
      if (result.type === 'success') {

        //Log in to our firebase app
        this.onGoogleSignIn(result)
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }

  onGoogleSignIn = (googleUser) => {

    function isUserEqual(googleUser, firebaseUser) {
      if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
          if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
              providerData[i].uid === googleUser.getBasicProfile().getId()) {
            // We don't need to reauth the Firebase connection.
            return true;
          }
        }
      }
      return false;
    }

    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = this.auth.onAuthStateChanged(function(firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        );
        // Sign in with credential from the Google user.
        this.auth.signInWithCredential(credential)
        .then( result => {

          let userProfile = {
            profilePic: result.additionalUserInfo.profile.picture,
            firstName: result.additionalUserInfo.profile.given_name,
            lastName: result.additionalUserInfo.profile.family_name,
          }
          this.userRef(result.user.uid)
            .set( userProfile, {merge: true})
            .then(function(snapshot) {

            });
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          console.log(errorMessage)
        });
      } else {
        console.log('User already signed-in Firebase.');
      }
    }.bind(this));
  }

  /***Email***/
  userLogin = (email, password) => {
    let me = this;
    email += "@" + "nickspa.cat"; //+ Constants.dbPrefix.replace("_", ".") +
    return new Promise(resolve => {
      me.auth.signInWithEmailAndPassword(email, password)
        .catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
                Toast.show({
                  text: 'Invalid email address format.',
                  buttonText: 'Okay'
                })
              break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              Toast.show({
                text: 'Invalid email address or password',
                buttonText: 'Okay'
              })
              break;
            default:
              Toast.show({
                text: 'Check your internet connection',
                buttonText: 'Okay'
              })
          }
          resolve(null);
        }).then(user => {
        if (user) {
          resolve(user);
        }
      }).catch( err => alert(err));
    })
  };

  createFirebaseAccount = (name, email, password) => {
    let me = this;
    return new Promise(resolve => {
      me.auth.createUserWithEmailAndPassword(email, password).catch(error => {
        switch (error.code) {
          case 'auth/email-already-in-use':
            Toast.show({
              text: 'This email address is already taken',
              buttonText: 'Okay'
            })
            break;
          case 'auth/invalid-email':
            Toast.show({
              text: 'Invalid e-mail address format',
              buttonText: 'Okay'
            })
            break;
          case 'auth/weak-password':
            Toast.show({
              text: 'Password is too weak',
              buttonText: 'Okay'
            })
            break;
          default:
            Toast.show({
              text: 'Check your internet connection',
              buttonText: 'Okay'
            })
        }
        resolve(false);
      }).then(info => {
        if (info) {
          Firebase.auth.currentUser.updateProfile({
            displayName: name
          });
          resolve(true);
        }
      }).catch(err => alert(err));
    });
  };

  sendEmailWithPassword = (email) => {
    let me = this;
    return new Promise(resolve => {
      me.auth.sendPasswordResetEmail(email)
        .then(() => {
          console.warn('Email with new password has been sent');
          resolve(true);
        }).catch(error => {
          switch (error.code) {
            case 'auth/invalid-email':
              console.warn('Invalid email address format');
              break;
            case 'auth/user-not-found':
              console.warn('User with this email does not exist');
              break;
            default:
              console.warn('Check your internet connection');
          }
          resolve(false);
        });
    })
  };

  signOut = () => {
    this.auth.signOut().then().catch((error) => {
      alert(error.message)
    })
  }

  //FUNCTIONS TO OPERATE ON THE DATABASE
  //Generic document updater
  updateDocInfo = (ref, updates, callback, merge = true) => {

    ref.set(updates, {merge}).then(() => {
      if (callback) {callback()}
    })
    .catch((err) => alert(err))
  }
  
  //Update user settings
  updateUserSettings = (uid, newSettings, callback) => {
    this.updateDocInfo( this.userRef(uid), {settings: newSettings}, callback, merge = true )
  }

  //Set default settings
  restoreDefaultUserSettings = (uid, callback) => {
    this.updateUserSettings(uid, {}, callback)
  }

  //Listen to changes on the current user's data
  //The callback recieves the user's complete data if getData = true, else the documentSnapshot
  onUserSnapshot = (uid, callback, getData = true) => {
    return this.userRef(uid).onSnapshot(
      docSnapshot => callback( getData ? docSnapshot.data() : docSnapshot)
    )
  }

  //Listener to changes on the group where the player is in a competition
  //The callback recieves the group data if getData = true, otherwise it recieves the document snapshot
  onPlayerGroupSnapshot = (gymID, compID, uid, callback, getData = true) => {

    return this.groupsRef(gymID, compID).where("playersRef", "array-contains", uid )
    .onSnapshot( querySnapshot =>{
        querySnapshot.forEach(doc => callback( getData ? doc.data() : doc ) )
    });

  }

  //Listen to changes in the pendingMatches of a given user
  //Callback recieves an array with all the pendings matches complete info if getData = true,
  //else it recieves the querySnapshot
  onPendingMatchesSnapshot = (uid, callback, getData = true) => {

    return this.firestore.collectionGroup(Subcollections.PENDINGMATCHES).where("playersIDs", "array-contains", uid )
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => ({
          ...doc.data(),
          gymID: doc.ref.parent.parent.parent.parent.id,
          compID: doc.ref.parent.parent.id
        })
      ))

    })

  }

  //Listen to competitions for a certain gym (thought in principle for gym admins)
  onCompetitionsSnapshot = (gymID, callback, getData = true) => {

    return this.compsRef(gymID)
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })
      ))

    })
  }

  //Listen to changes in groups in a competition
  //the callback recieves an array with each group complete info if getData = true, else it recieves the querySnapshot
  onGroupsSnapshot = (gymID, compID, callback, orderBy = "order", getData = true) => {

    return this.groupsRef(gymID, compID).orderBy(orderBy).onSnapshot((querySnapshot) => {
      
      if (getData){

        let groups = querySnapshot.docs.map((group) => {
          return {...group.data(), iGroup: group.get("order")}
        });

        callback(groups)

      } else {
        callback(querySnapshot)
      }
      

  })

  }


  //DATABASE REFERENCES (Only place where they should be declared in the whole app)
  //V3 database references
  get usersRef() {
    return this.firestore.collection(Collections.USERS)
  }

  userRef = (uid) => this.usersRef.doc(uid)

  get gymsRef() {
    return this.firestore.collection(Collections.GYMS)
  }

  gymRef = (gymID) => this.gymsRef.doc(gymID);

  compsRef = (gymID) => {
    return this.gymRef(gymID).collection(Subcollections.COMPETITIONS)
  }

  compRef = (gymID, compID) => {
    return this.compsRef(gymID).doc(compID)
  }

  groupsRef = (gymID, compID) => this.compRef(gymID, compID).collection(Subcollections.GROUPS);

  groupRef = (gymID, compID, groupID) => this.groupsRef(gymID, compID).doc(groupID);
  
}

Firebase.shared = new Firebase();

export default Firebase.shared;

