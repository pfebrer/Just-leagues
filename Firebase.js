import * as firebase from "firebase";
import 'firebase/firestore';
import 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyAHqGQDf55s2jACqlyn3ejicyk9ESrU3KM",
    authDomain: "squash-leagues-94b68.firebaseapp.com",
    databaseURL: "https://squash-leagues-94b68.firebaseio.com",
    projectId: "squash-leagues-94b68",
    storageBucket: "squash-leagues-94b68.appspot.com"
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = app.firestore();
const functions = app.functions();
const auth = app.auth();

//firestore.settings({timestampsInSnapshots:true})
console.log("USING FIREBASE FUNCTIONS IN LOCAL SERVER");
//functions.useFunctionsEmulator('http://192.168.1.43:5000');

export {firebase,firestore,functions,auth};