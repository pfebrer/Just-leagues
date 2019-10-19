import firebase from "firebase";
import 'firebase/firestore';
import 'firebase/functions';

import { Toast } from 'native-base'
import {Collections, Subcollections, Constants, Documents} from "../constants/CONSTANTS";

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

    console.log(Collections.CHALLENGE)
  }

  //AUTHENTICATION STUFF
  userLogin = (email, password) => {
    let me = this;
    email += "@" + Constants.dbPrefix.replace("_", ".") + "nickspa.cat";
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
      });
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
      });
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

  //DATABASE REFERENCES (Only place where they should be declared in the whole app)
  /*get playersRef() {
    return this.firestore.collection(Collections.PLAYERS)
  }

  get rankingsRef() {
    return this.firestore.collection(Collections.RANKINGS).doc(Documents.RANKINGS.squashRanking);
  }

  get matchesRef() {
    return this.firestore.collection(Collections.MATCHES);
  }

  get groupsRef() {
    return this.firestore.collection(Collections.GROUPS);
  }

  get typeOfCompRef() {
    return this.firestore.collection(Collections.MONTH_INFO).doc(Documents.MONTH_INFO.typeOfComp)
  }

  userRef = (uid) => {
    return this.playersRef.doc(uid)
  }*/

  //V3 database references
  get usersRef() {
    return this.firestore.collection(Collections.USERS)
  }

  userRef = (uid) => this.usersRef.doc(uid)

  get gymsRef() {
    return this.firestore.collection(Collections.GYMS)
  }

  gymRef = (gymID) => this.gymsRef.doc(gymID);

  sportRef = (gymID, sportID) => this.gymRef(gymID).collection(Subcollections.SPORTS).doc(sportID);

  groupsRef = (gymID, sportID) => this.sportRef(gymID, sportID).collection(Subcollections.GROUPS);

  groupRef = (gymID, sportID, groupID) => this.groupsRef(gymID, sportID).doc(groupID);
  
}

Firebase.shared = new Firebase();

export default Firebase.shared;

