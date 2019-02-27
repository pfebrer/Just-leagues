import * as firebase from "firebase"
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAHqGQDf55s2jACqlyn3ejicyk9ESrU3KM",
    authDomain: "squash-leagues-94b68.firebaseapp.com",
    databaseURL: "https://squash-leagues-94b68.firebaseio.com",
    projectId: "squash-leagues-94b68",
    storageBucket: "squash-leagues-94b68.appspot.com",
}
  
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore()
//firestore.settings({timestampsInSnapshots:true})

export {firebase,firestore}