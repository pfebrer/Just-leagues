import firebase from "firebase";
import 'firebase/firestore';
import 'firebase/functions';

import { Toast } from 'native-base'
import {Collections, Subcollections, Constants, Documents} from "../constants/CONSTANTS";

import * as Google from 'expo-google-app-auth';
import { translate } from "../assets/translations/translationManager";

import 'lodash.combinations';
import _ from "lodash"

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

  //FUNCTIONS TO MIGRATE (Use for developement)
  migrateUsers = (prefix) => {
    this.usersRef.get().then(snap => {
      snap.forEach(doc => {
          this.firestore.collection(prefix + "_" + Collections.USERS).doc(doc.id).set(doc.data())
      });
    })
  }

  activeCompsToIDs = () => {
    this.usersRef.get().then(snap => {
      snap.forEach(doc => {

        if (doc.get("activeCompetitions")){
          this.firestore.collection(Collections.USERS).doc(doc.id)
          .set({activeCompetitions: doc.get("activeCompetitions").map(comp => comp.id)}, { merge: true})
        }
        
      });
    })
  }
  
  //AUTHENTICATION STUFF
  /***Google***/
  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidStandaloneAppClientId: "524738063553-vn8rk9pmad9gil0gtsbhaf616ng6e0mj.apps.googleusercontent.com",
        androidClientId: "524738063553-1tr662gs9strhp1rvljj4qv588mbj254.apps.googleusercontent.com",
        //iosClientId: YOUR_CLIENT_ID_HERE,
        behavior: "web",
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
            aka: result.additionalUserInfo.profile.name,
            firstName: result.additionalUserInfo.profile.given_name,
            lastName: result.additionalUserInfo.profile.family_name,
          }

          this.userRef(result.user.uid).get()

            .then(docSnapshot => {

              let userSettings = docSnapshot.get("settings") || {}

              docSnapshot.ref.set({
                ...docSnapshot.data(),
                settings: {
                  ...userSettings,
                  ["Profile"]: {
                    ...userProfile,
                    ...userSettings["Profile"],
                  }
                },
                
              }, {merge: true})

            })

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
          this.auth.currentUser.updateProfile({
            displayName: name
          });
          this.userRef(this.auth.currentUser.uid).set({
            displayName: name,
          })
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
  updateDocInfo = (ref, updates, callback, merge = true, params = false, omit = false) => {

    if (typeof ref == "string") {
      ref = this.firestore.doc(ref)
    }

    if (params){
      updates = _.pick(updates, params)
    }

    if (omit){
      updates = _.omit(updates, omit)
    }

    ref.set(updates, {merge}).then(() => {
      if (callback) {callback()}
    })
    .catch((err) => alert(err))
  }

  //Update competition
  updateCompetitionDoc = (gymID, compID, updates, callback) => {
    this.updateDocInfo( this.compRef(gymID, compID), updates, callback)
  }
  
  //Update user settings
  updateUserSettings = (uid, newSettings, callback) => {
    this.updateDocInfo( this.userRef(uid), {settings: newSettings}, callback, merge = true )
  }

  //Set default settings
  restoreDefaultUserSettings = (uid, callback) => {
    this.updateUserSettings(uid, {}, callback)
  }

  //FUNCTIONS TO GET DATA FROM DATABASE ONCE (don't keep listening)
  getCompetition = (compID) => this.compsGroupRef.where("id", "==", compID).get()
  
  //LISTENERS TO THE DATABASE

  onSnapshot = (path, callback, isColection= false) => {
    /*The most generic snapshot method*/
    if (isColection){
      return this.firestore.collection(path).onSnapshot( querySnapshot => callback(querySnapshot))
    } else {
      return this.firestore.doc(path).onSnapshot( docSnapshot => callback(docSnapshot))
    }
    
  }
  
  onUserSnapshot = (uid, callback, getData = true) => {
    /*Listen to changes on the current user's data
    The callback recieves the user's complete data if getData = true, else the documentSnapshot*/

    return this.userRef(uid).onSnapshot(
      docSnapshot => {
        callback( getData ? {...docSnapshot.data(), id: docSnapshot.id} : docSnapshot)
      }
    )
  }

  onUnasignedUsersSnapshot = (userEmail, callback, getData = true) => {
    return this.unasignedUsersRef.where("email", "==", userEmail.toLowerCase()).onSnapshot(
      query => {

        if (getData){
          callback(query.docs.map( doc => ({ ...doc.data(), id: doc.id}) ))
        } else {
          callback(query)
        }
        
      }
    )
  }

  onPendingMatchesSnapshot = (uid, callback, getData = true) => {
    /*Listen to changes in the pendingMatches of a given user
    Callback recieves an array with all the pendings matches complete info if getData = true,
    else it recieves the querySnapshot*/

    return this.firestore.collectionGroup(Subcollections.PENDINGMATCHES).where("playersIDs", "array-contains", uid )
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => {
          let data = doc.data()

          return {
            ...data,
            id: doc.id,
            due: data.due ? data.due.toDate() : null,
            scheduled: data.scheduled ? { ...data.scheduled, time: data.scheduled.time.toDate()} : null,
            gymID: doc.ref.parent.parent.parent.parent.id,
            compID: doc.ref.parent.parent.id
          }
          
        }
      ))

    })

  }

  onPendingMatchSnapshot = (gymID, compID, matchID, callback, getData = true) => {

    return this.pendingMatchRef(gymID,compID, matchID).onSnapshot( docSnapshot => {

      if (!getData){

        callback(docSnapshot)

      } else {

        let data = docSnapshot.data()

        callback({
          ...data,
          due: data.due ? data.due.toDate() : null,
          scheduled: data.scheduled ? { ...data.scheduled, time: data.scheduled.time.toDate()} : null
        }, docSnapshot)

      }

    })
  }

  onUserMatchesSnapshot = (uid, callback, getData = true) => {
    /*Listen to changes in the matches of a given user
    Callback recieves an array with all the matches complete info if getData = true,
    else it recieves the querySnapshot*/

    return this.firestore.collectionGroup(Subcollections.MATCHES).where("playersIDs", "array-contains", uid )
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => {
          let data = doc.data()

          return {
            ...data,
            id: doc.id,
            playedOn: data.playedOn ? data.playedOn.toDate() : null,
          }
          
        }
      ))

    })

  }

  onMatchSnapshot = (gymID, compID, matchID, callback, getData = true) => {

    return this.matchRef(gymID, compID, matchID).onSnapshot( docSnapshot => {

      if (!getData){

        callback(docSnapshot)

      } else {

        let data = docSnapshot.data()

        if (data){
          callback({
            ...data,
            playedOn: data.playedOn ? data.playedOn.toDate() : null,
          }, docSnapshot)
        }
        

      }

    })
  }

  onCompetitionsSnapshot = (gymID, callback, getData = true) => {
    /*Listen to competitions for a certain gym (thought in principle for gym admins)*/

    return this.compsRef(gymID)
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          gymID
        })
      ))

    })
  }

  onCompetitionSnapshot = (compID, callback, getData = true) => {
    /*Listens for changes in a given competition*/
    return this.compsGroupRef.where("id", "==", compID).onSnapshot(
      querySnapshot => {

        let compSnapshot = querySnapshot.docs[0]

        if(!getData) callback(compSnapshot)
        else {
          callback({ ...compSnapshot.data(), gymID: compSnapshot.ref.parent.parent.id})
        }
      }
    )
  }

  onCompUsersSnapshot = (compID, callback) => {
    /*Listen to users that are active in a given competition
    Returns and object like {id1: name1, id2:name2 ....}*/

    return this.usersRef.where("activeCompetitions", "array-contains", compID).onSnapshot(

      querySnapshot => {
        callback( querySnapshot.docs.reduce((IDsAndNames,user) => {

            let userSettings = user.get("settings")

            let names = userSettings && userSettings["Profile"] ? 
              _.pick( userSettings["Profile"] , ["aka", "firstName", "lastName"])
              : {aka: user.get("displayName") , firstName: user.get("displayName"), lastName: ""} //This is just to account for users that may not have their settings updated (or unasigned users)
              
            IDsAndNames[user.id] = names;

            return IDsAndNames;
          }, {})
        )
      }

    )
  }

  onGroupsSnapshot = (gymID, compID, callback, orderBy = "order", getData = true) => {
    /*Listen to changes in groups in a competition
    the callback recieves an array with each group complete info if getData = true, else it recieves the querySnapshot*/

    return this.groupsRef(gymID, compID).orderBy(orderBy).onSnapshot((querySnapshot) => {
      
      if (getData){

        let groups = querySnapshot.docs.map((group) => {
          return {...group.data(), iGroup: group.get("order"), id: group.id}
        });

        callback(groups)

      } else {
        callback(querySnapshot)
      }
      

  })

  }

  onPlayerGroupSnapshot = (gymID, compID, uid, callback, getData = true) => {
    /*Listener to changes on the group where the player is in a competition
    /The callback recieves the group data if getData = true, otherwise it recieves the document snapshot*/

    return this.groupsRef(gymID, compID).where("playersIDs", "array-contains", uid )
    .onSnapshot( querySnapshot =>{
        querySnapshot.forEach(doc => callback( getData ? {...doc.data(), id: doc.id} : doc ) )
    });

  }

  //FUNCTIONS TO DO COMPLEX OPERATIONS
  submitNewPlayedMatch = (matchInfo, callback) => {
    /*Takes a match from pendingMatches and puts it into matches.
    It also deletes the already played pendingMatch. ID of the match is preserved.*/
    let batch = this.firestore.batch()

    //Pick only the relevant info
    let {result, playersIDs, scheduled, context} = matchInfo

    let {matchID, competition} = context
    let {id: compID, gymID, type: typeOfComp} = competition

    let playedOn = scheduled ? scheduled.time : null;
    if (!playedOn) playedOn = new Date()

    batch.set(this.matchRef(gymID, compID, matchID),{
      context: _.omit(context, ["pending", "matchID"]),
      result,
      playersIDs,
      playedOn
    })

    batch.delete(this.pendingMatchRef(gymID, compID, matchID))

    batch.commit().then(callback).catch(err => alert(err))
  }

  mergeUsers = (userToMerge, requestingUser, callback = () => {}) => {

    /*
    Function to merge two users (only tested to merge an unasigned user to a real user of the app,
    but it may work to merge to real users, idk).
    
    The most secure way to merge two users is through a batched write,
    because this ensures that either all changes will be succesfully carried out
    or none will be made.

    These are the operations that we need to do:
        (1) Change all references to the unasignedUser's ID in the database to the requesting user's ID.
        (2) Push the unasignedUser's competition to the list of active competitions of the requesting user.
        (3) Delete the unassigned user.

    Knowing this, we need to:
        1. Create a batch
        2. Add to the batch the operations that we already fully know, that is (2) and (3)
        3. Read all the "playersIDs" arrays that store the ID of the unasignedUser.
        4. For all the "playersIDs" arrays, change the target ID for the new one and submit the update operation to the batch.
        5. Commit the batch and wait for it to complete.
        6. Be happy that one more merge has been succesful :)

    IMPORTANT NOTE: One must ensure that IDstoringRefs contains literally ALL the database references where the ID
    of the unasigned user is stored, otherwise there will be very important problems.

    */

    //Create the batch that we will use
    let batch = this.firestore.batch()

    batch.update(this.userRef(requestingUser.id), { activeCompetitions: [...requestingUser.activeCompetitions, ...userToMerge.activeCompetitions] })
    batch.delete(this.userRef(userToMerge.id))

    //Define all the references where there is an array of playersIDs that needs to be modified
    let IDstoringRefs = [];
    userToMerge.activeCompetitions.forEach( competition => {

      var {gymID, id: compID, type: typeOfComp} = competition

      IDstoringRefs.push(
        //Doc refs
        this.compRef(gymID, compID), //The competition's ref

        //Collection refs
        this.matchesRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id), //The competition's matches ref
        this.pendingMatchesRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id), //The competition's pending matches ref
      )

      if (typeOfComp == "groups"){
        IDstoringRefs.push(
          this.groupsRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id) //The competition's group ref
        )
      }

    })

    //Wait for all the promises to resolve (all the references are read and we get a documentSnapshot or a querySnapshot for each of them).
    Promise.all( IDstoringRefs.map(ref => ref.get()) )
    .then( snaps => {
 
      snaps.forEach(snap => {

        if (snap.docs){
          //A collection was read and this is a querySnapshot
          snap.forEach(doc => {

            batch.update(doc.ref, {playersIDs: doc.get("playersIDs").map(id => id == userToMerge.id ? requestingUser.id : id)} )
          })

        } else {
          //A document was read and this is a documentSnapshot
          batch.update(snap.ref, {playersIDs: snap.get("playersIDs").map(id => id == userToMerge.id ? requestingUser.id : id)})
        }
          
      })

      //Commit the batch operation
      batch.commit()
      .then(result => callback(result))
      .catch(reason => alert( translate("error.unable to merge users") + ":\n" + reason))
        
    }).catch( reason => alert(reason))

  }

  generateGroups = (gymID, compID, ranking, compsettings, {due}, callback = () => {}) => {

    /*Function that, given a ranking, generates groups according to some settings*/

    let batch = this.firestore.batch()

    //Divide the ranking in groups of size determined by the competition settings
    let playersGroups = _.chunk(ranking, compsettings.groupSize)

    //If last group is too small, join the last two groups (maybe it would be good to let the admin choose here)
    if (_.last(playersGroups).length < compsettings.minGroupSize){

      orphans = playersGroups.pop()
      lastGroup = _.concat(playersGroups.pop(), orphans)
      playersGroups.push(lastGroup)

    }

    //And we start to really generate the groups here
    playersGroups.forEach( (playersGroup, i) => {

      var groupRef = this.groupsRef(gymID, compID).doc()

      //Define the name and the order of the group
      let name = String(i + 1), order = i + 1

      //Generate the pendingMatches for this group
      let matches = _.combinations(playersGroup, 2)
      let matchesIDs = []

      //And store them in the pendingMatches collection of the competition
      matches.forEach(match => {

        var matchRef = this.pendingMatchesRef(gymID, compID).doc()
        matchesIDs.push(matchRef.id)

        batch.set(matchRef, {
          context:{
            group: {
              id: groupRef.id,
              name
            }
          },
          playersIDs: match,
          due,
          scheduled: false
        })

      })

      //Finally, store the group
      
      batch.set( groupRef, {
        name, order,
        matchesIDs,
        playersIDs: playersGroup
      })

    })

    return batch.commit().then(()=> callback()).catch(err => alert(err))
    
  }

  callHttpsFunction = (functionName, argsObject, callback, errorFn) => {
    //Call a cloud function through https

    if (callback === undefined || callback === null) {
        callback = (data) => {
            console.log("Firebase::callFunction::callback", data); // hello world
            alert("SUCCESS: " + functionName + ", data:" + data.data);
        };
    }
    if (errorFn === undefined || errorFn === null) {
        errorFn = (httpsError) => {
            console.log("Firebase::callFunction::errorFn", httpsError); // bar
            alert("ERROR: " + functionName + ", data:" + data.data);
        };
    }
    console.log("Firebase::callFunction functionName[" + functionName + "]");

    this.functions.httpsCallable(functionName)({dbPrefix: Constants.dbPrefix, ...argsObject}).then(callback).catch(errorFn);
};

  //DATABASE REFERENCES (Only place where they should be declared in the whole app)
  //V3 database references
  get usersRef() {
    return this.firestore.collection(Collections.USERS)
  }

  get unasignedUsersRef () {
    return this.usersRef.where("asigned", "==", false)
  }

  userRef = (uid) => this.usersRef.doc(uid)

  get gymsRef() {
    return this.firestore.collection(Collections.GYMS)
  }

  gymRef = (gymID) => this.gymsRef.doc(gymID);

  compsRef = (gymID) => {
    return this.gymRef(gymID).collection(Subcollections.COMPETITIONS)
  }

  get compsGroupRef() {
    return this.firestore.collectionGroup(Subcollections.COMPETITIONS)
  } 

  compRef = (gymID, compID) => {
    return this.compsRef(gymID).doc(compID)
  }

  matchesRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.MATCHES)
  }

  matchRef = (gymID, compID, matchID) => {
    return this.matchesRef(gymID, compID).doc(matchID)
  }

  pendingMatchesRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.PENDINGMATCHES)
  }

  pendingMatchRef = (gymID, compID, matchID) => {
    return this.pendingMatchesRef(gymID, compID).doc(matchID)
  }

  groupsRef = (gymID, compID) => this.compRef(gymID, compID).collection(Subcollections.GROUPS);

  groupRef = (gymID, compID, groupID) => this.groupsRef(gymID, compID).doc(groupID);

  //Helper functions
  isMatchPlayedAlready = (matchPath) => matchPath.includes("/" + Subcollections.MATCHES + "/")

  fromDate = (date) => firebase.firestore.Timestamp.fromDate( new Date(Number(date)) )
  
}

Firebase.shared = new Firebase();

export default Firebase.shared;

