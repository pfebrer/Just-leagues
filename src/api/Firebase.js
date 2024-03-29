import firebase from "firebase/compat/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

import { getFunctions, httpsCallable } from "firebase/functions";
import 'firebase/compat/firestore';

import { Toast } from 'native-base'
import {Collections, Subcollections, Constants, Documents} from "../constants/CONSTANTS";
import { settleBet } from './BetManager'

import { translate } from "../assets/translations/translationWorkers";

import 'lodash.combinations';
import _ from "lodash"
import { withProgressAsync, throwClarifiedError } from '../assets/utils/utilFuncs'

const FieldValue = firebase.firestore.FieldValue

class Firebase {

  constructor(){

    //Here we initialize the app
    var firebaseConfig = {
      apiKey: __DEV__ ? "AIzaSyAHqGQDf55s2jACqlyn3ejicyk9ESrU3KM" : process.env.FIREBASE_API_KEY,
      authDomain: "squash-leagues-94b68.firebaseapp.com",
      databaseURL: "https://squash-leagues-94b68.firebaseio.com",
      projectId: "squash-leagues-94b68",
      storageBucket: "squash-leagues-94b68.appspot.com"
    };

    this.app = firebase.initializeApp(firebaseConfig);
    this.firestore = this.app.firestore();
    this.functions = getFunctions(this.app, 'europe-west1');
    this.auth = getAuth(this.app);
    
  }

  //FIREBASE API
  onAuthStateChanged = (callback) => onAuthStateChanged(this.auth, callback)

  //FUNCTIONS TO MIGRATE (Use for developement)
  migrateUsers = (prefix) => {
    this.usersRef.get().then(snap => {
      snap.forEach(doc => {
          this.firestore.collection(prefix + "_" + Collections.USERS).doc(doc.id).set(doc.data())
      });
    })
  }

  addNameSettings = () => {
    this.usersRef.get().then(snap => {
      snap.forEach(doc => {

        let {settings, displayName, firstName, lastName, asigned} = doc.data()
        if (asigned != false && settings && (!settings["Profile"] || !settings["Profile"].aka)){
          doc.ref.update({settings: {...settings, ["Profile"]: {
            aka: displayName,
            firstName: firstName || displayName,
            lastName: lastName || ""
          }}})
        }
      })
    })
  }
  
  //AUTHENTICATION STUFF
  /***Email***/
  userLogin = (email, password) => {
    let me = this;
    return new Promise(resolve => {
      signInWithEmailAndPassword(me.auth, email, password)
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
      createUserWithEmailAndPassword(me.auth, email, password).catch(error => {
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
              settings: {
                ["Profile"]: {
                  aka: name,
                  firstName: name,
                  lastName: "",
                }
              },
              
            }, {merge: true}
          )
          resolve(true);
        }
      }).catch(err => alert(err));
    });
  };

  sendEmailWithPassword = (email) => {
    let me = this;
    return new Promise(resolve => {
      sendPasswordResetEmail(me.auth, email)
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
    signOut(this.auth).then().catch((error) => {
      alert(error.message)
    })
  }

  //FUNCTIONS TO OPERATE ON THE DATABASE
  //Generic document updater
  updateDocInfo = (ref, updates, callback, {method = "set", merge = true, params = false, omit = false}) => {

    if (typeof ref == "string") {
      ref = this.firestore.doc(ref)
    }

    if (params){
      updates = _.pick(updates, params)
    }

    if (omit){
      updates = _.omit(updates, omit)
    }

    let promise;
    if (method == "set"){
      promise = ref.set(updates, {merge})
    } else if (method == "update"){
      promise = ref.update(updates)
    }

    promise.then(() => {
      if (callback) {callback()}
    })
    .catch((err) => alert(err))
  }

  //Update competition
  updateCompetitionDoc = (gymID, compID, updates, callback) => {
    this.updateDocInfo( this.compRef(gymID, compID), updates, callback, {})
  }

  updateUserDoc = (uid, updates, callback) => {
    this.updateDocInfo(this.userRef(uid), updates, callback, {})
  }

  //Update settings of any document that contains settings
  updateSettings = (docRef, settings, callback, method = "set") => {
    this.updateDocInfo( docRef, {settings}, callback, {method, merge: true})
  }
  
  //Update user settings
  updateUserSettings = (uid, newSettings, callback, method = "set") => {
    this.updateSettings( this.userRef(uid), newSettings, callback, method)
  }

  //Set default settings (pass the settings to )
  restoreDefaultUserSettings = (uid, settingsToKeep, callback) => {
    this.updateUserSettings(uid, settingsToKeep, callback, method = "update")
  }

  //Update competition settings
  updateCompSettings = (gymID, compID, newSettings, callback, method = "set") => {
    this.updateSettings( this.compRef(gymID, compID), newSettings, callback, method)
  }

  //Function to add new messages to a messages collection. The path should be already known because
  //the onChatMessagesSnapshot method (see below) returns it when delivering messages.
  addNewMessage = (messagesPath, message, callback = () => {}) => {

    if (!message.createdAt) message.createdAt = new Date()
    this.firestore.collection(messagesPath).add({
      ..._.omit(message, ["_id"])
    }).then(callback).catch(err => alert( translate("errors.could not send message"), err))
  }

  //FUNCTIONS TO GET DATA FROM DATABASE ONCE (don't keep listening)
  getCompetition = (compID) => this.compsGroupRef.where("id", "==", compID).get()

  getAllCompetitions = () => this.compsGroupRef.get()

  getPreviousRanking = (gymID, compID) => this.rankHistoryRef(gymID, compID).orderBy("date", "desc").limit(1).get()
  
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

    console.warn("USER")
    return this.userRef(uid).onSnapshot(
      docSnapshot => {
        callback( getData ? {...docSnapshot.data(), id: docSnapshot.id} : docSnapshot)
      }
    )
  }

  onUnasignedUsersSnapshot = (userEmail, callback, getData = true) => {
    console.warn("UNASIGNED")
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
    console.warn("PENDING MATCHES")
    /*Listen to changes in the pendingMatches of a given user
    Callback recieves an array with all the pendings matches complete info if getData = true,
    else it recieves the querySnapshot*/

    return this.firestore.collectionGroup(Subcollections.PENDINGMATCHES).where("playersIDs", "array-contains", uid )
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => this.standarizeMatchDocInfo(doc)) )

    })

  }

  onPendingMatchSnapshot = (gymID, compID, matchID, callback, getData = true) => {
    console.warn("PENDING MATCH")
    return this.pendingMatchRef(gymID,compID, matchID).onSnapshot( docSnapshot => {

      if (!getData){

        callback(docSnapshot)

      } else {

        callback(this.standarizeMatchDocInfo(docSnapshot), docSnapshot)

      }

    })
  }

  onUserMatchesSnapshot = (uid, callback, getData = true) => {
    console.warn("USER MATCHES")
    /*Listen to changes in the matches of a given user
    Callback recieves an array with all the matches complete info if getData = true,
    else it recieves the querySnapshot*/

    return this.firestore.collectionGroup(Subcollections.MATCHES).where("playersIDs", "array-contains", uid )
    .onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => this.standarizeMatchDocInfo(doc)))

    })

  }

  onMatchSnapshot = (gymID, compID, matchID, callback, getData = true) => {
    console.warn("MATCH SNAPSHOT")

    return this.matchRef(gymID, compID, matchID).onSnapshot( docSnapshot => {

      if (!getData){

        callback(docSnapshot)

      } else {

          callback(this.standarizeMatchDocInfo(docSnapshot), docSnapshot)  

      }

    })
  }

  onGymsSnapshot = (callback, getData = true) => {
    /*Listen to all gyms*/
    return this.gymsRef.onSnapshot(querySnapshot => { 
      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })
      ))

    })
  }

  onAllCompetitionsSnapshot = (callback, getData = true) => {
    console.warn("COMPETITIONS")
    /*Listen to competitions for a certain gym (thought in principle for gym admins)*/

    return this.compsGroupRef.onSnapshot(querySnapshot => { 

      if (!getData) callback(querySnapshot)
      else callback( querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          gymID: doc.ref.parent.parent.id
        })
      ))

    })
  }

  onCompetitionsSnapshot = (gymID, callback, getData = true) => {
    console.warn("COMPETITIONS")
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
    console.warn("COMPETITION")
    /*Listens for changes in a given competition*/

    //First, we listen for the competition document
    return this.compsGroupRef.where("id", "==", compID).onSnapshot(
      querySnapshot => {

        let compSnapshot = querySnapshot.docs[0]

        if(!getData) callback(compSnapshot)
        else {
          callback({ ...compSnapshot.data(), gymID: compSnapshot.ref.parent.parent.id, id: compSnapshot.id})
        }
      }
    )

  }

  onCompUsersSnapshot = (compID, currentUser, callback) => {
    console.warn("COMP USERS")
    /*Listen to users that are active in a given competition
    Returns and object like {id1: user1, id2: user2 ....}*/

    return this.usersRef.where("activeCompetitions", "array-contains", compID).onSnapshot(

      querySnapshot => {
        callback( querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
      }

    )
  }

  onCompAdminsSnapshot = (gymID, compID, currentUser, callback) => {
    console.warn("COMP ADMINS")
    /*Listen to the admins of a given competition */

    return this.usersRef.where("gymAdmin", "array-contains", gymID).onSnapshot(

      querySnapshot => {
        callback( querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()})))
      }

    )
  }

  onCompMatchesSnapshot = (gymID, compID, callback) => {
    console.warn("COMP MATCHES")
    /*Listen to changes in matches for a given competition*/

    return this.matchesRef(gymID, compID).onSnapshot( querySnapshot => {
      callback(querySnapshot.docs.map(doc => this.standarizeMatchDocInfo(doc)))
    })

  }

  onCompPendingMatchesSnapshot = (gymID, compID, callback) => {
    console.warn("COMP PENDING MATCHES")
    /*Listen to changes in pending matches for a given competition*/

    return this.pendingMatchesRef(gymID, compID).onSnapshot( querySnapshot => {
      callback(querySnapshot.docs.map(doc => this.standarizeMatchDocInfo(doc)))
    })

  }

  onGroupsSnapshot = (gymID, compID, callback, orderBy = "order", getData = true) => {
    console.warn("GROUPS")
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
    console.warn("PLAYER GROUP")
    /*Listener to changes on the group where the player is in a competition
    /The callback recieves the group data if getData = true, otherwise it recieves the document snapshot*/

    return this.playerGroupQuery(gymID, compID, uid).onSnapshot( querySnapshot =>{
        querySnapshot.forEach(doc => callback( getData ? {...doc.data(), id: doc.id} : doc ) )
    });

  }

  onChatMessagesSnapshot = (gymID, compID, {particularChat, compType, uid}, callback) => {
    console.warn("CHAT MESSAGES")
    /*Listener to messages of the chat for a certain competition */

    let listener = (messagesRef, extraContext = {}) => {

      return messagesRef.orderBy("createdAt", "desc").onSnapshot( querySnapshot =>{
        callback({
          context: {messagesPath: messagesRef.path, gymID, compID, ...extraContext},
          messages: querySnapshot.docs.map(doc => ({...doc.data(), _id: doc.id}) )
        })
      })

    }

    if ( !particularChat ){
      //Get the general chat

      let messagesRef = this.compMessagesRef(gymID, compID)

      return listener(messagesRef)

    } else if (compType == "groups"){
      //Get the player's group chat

      this.playerGroupQuery(gymID, compID, uid).get().then( groupsSnapshot => {

        let messagesRef = groupsSnapshot.docs[0].ref.collection(Subcollections.MESSAGES)
        
        return listener(messagesRef, {groupID: groupsSnapshot.docs[0].id, playersIDs: groupsSnapshot.docs[0].get("playersIDs")  } )

      })
    }
  }

  onUserBets = (uid, callback) => {
    console.warn("USER BETS")
    this.userBetsRef(uid).onSnapshot( querySnap => {
      callback(querySnap.docs.map(doc => ({ id: doc.id, ...doc.data()}) ))
    })
  }

  //FUNCTIONS TO DO COMPLEX OPERATIONS
  _submitNewPlayedMatch = async (matchInfo, callback) => {
    /*Takes a match from pendingMatches and puts it into matches.
    It also deletes the already played pendingMatch. ID of the match is preserved.*/
    let batch = this.firestore.batch()

    //Pick only the relevant info
    let {result, playersIDs, scheduled, context, id: matchID} = matchInfo

    let {competition} = context
    let {id: compID, gymID, type: typeOfComp} = competition

    let playedOn = scheduled ? scheduled.time : null;
    if (!playedOn) playedOn = new Date()

    batch.set(this.matchRef(gymID, compID, matchID),{
      context: {
        ..._.omit(context, ["pending", "matchID"]),
        competition: _.pick(competition, ["id", "gymID", "name", "type"])
      },
      result,
      playersIDs,
      playedOn
    })

    await withProgressAsync(
      {progress: translate("progress.settling bets"), success: translate("progress.bets settled"), throwErr: true},
      this.settleMatchBets
    ) (matchInfo, batch)

    batch.delete(this.pendingMatchRef(gymID, compID, matchID))

    await withProgressAsync(
      {progress: translate("progress.submitting all changes"), error: translate("errors.could not submit changes"), throwErr: true}, 
      batch.commit.bind(batch)
    ) ()

  }

  submitNewPlayedMatch = withProgressAsync({progress: translate("progress.submitting match")}, this._submitNewPlayedMatch)

  //FUNCTIONS TO DO COMPLEX OPERATIONS
  _cancelPlayedMatchResult = async (matchInfo, backToPending, callback) => {
    /*Takes a match from pendingMatches and puts it into matches.
    It also deletes the already played pendingMatch. ID of the match is preserved.*/
    let batch = this.firestore.batch()

    //Pick only the relevant info
    let {result, playersIDs, scheduled, context, id: matchID} = matchInfo

    let {competition} = context
    let {id: compID, gymID, type: typeOfComp} = competition

    // Remove it from the matches
    batch.delete(this.matchRef(gymID, compID, matchID))
    // There should probably be some kind of logic here to unsettle bets, and also if
    // statistics are no longer computed on the fly, something is needed here.

    // Set the document back in the pending matches if requested. It may be the case that this match
    // is no longer to be scheduled, in which case it should not be added again to pending matches.
    if (backToPending){
        batch.set(this.pendingMatchRef(gymID, compID, matchID),{
        context: {
            ..._.omit(context, ["pending", "matchID"]),
            competition: _.pick(competition, ["id", "gymID", "name", "type"])
        },
        scheduled: false,
        playersIDs,
        })
    }

    await withProgressAsync(
        {progress: translate("progress.submitting all changes"), error: translate("errors.could not submit changes"), throwErr: true}, 
        batch.commit.bind(batch)
      ) ()

  }

  cancelPlayedMatchResult = withProgressAsync({progress: translate("progress.submitting match")}, this._cancelPlayedMatchResult)

  settleMatchBets = async (match, batch) => {

    let shouldCommit = false
    if (!batch){
      shouldCommit = true
      batch = this.firestore.batch()
    }

    const {gymID, id: compID} = match.context.competition
    let {bettingPoints} = match.context.competition

    const matchBets = await this.matchBetsRef(gymID, compID, match.id).get()

    matchBets.forEach(matchBet => {

      //If it is already settled go to the next bet
      if (matchBet.settled) return false

      const settledBet = settleBet(matchBet.data() , {match, competition: match.context.competition})

      //Update the competition's betting points
      bettingPoints = this._updateBettingPoints(bettingPoints, settledBet)
      
      batch.set( matchBet.ref, settledBet )
    })

    batch.update(this.compRef(gymID, compID), {bettingPoints})

    if (shouldCommit) return batch.commit()
    else return true

  }

  mergeUsers = (userToMerge, requestingUser, relevantCompetitions, callback = () => {}) => {

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

    batch.update(this.userRef(requestingUser.id), { activeCompetitions: [...new Set([...requestingUser.activeCompetitions, ...userToMerge.activeCompetitions])] })
    batch.delete(this.userRef(userToMerge.id))

    //Define all the references where there is an array of playersIDs that needs to be modified
    let IDstoringRefs = [];
    userToMerge.activeCompetitions.forEach( compID => {

      var {gymID, type: typeOfComp} = relevantCompetitions[compID]

      IDstoringRefs.push(
        //Doc refs
        this.compRef(gymID, compID), //The competition's ref

        //Collection refs
        this.matchesRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id), //The competition's matches ref
        this.pendingMatchesRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id), //The competition's pending matches ref
        this.rankHistoryRef(gymID, compID).where("playersIDs", "array-contains", userToMerge.id) //The ranking history ref
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

  _generateGroups = async (competition, {due}) => {

    /*Function that, given a ranking, generates groups according to some settings*/
    const {gymID, id: compID, playersIDs: ranking} = competition

    let batch = this.firestore.batch()

    //Store the new ranking in history
    batch.set( this.rankHistoryRef(gymID, compID).doc() , {
      date: new Date(),
      playersIDs: ranking
    })

    //Divide the ranking in groups of size determined by the competition settings
    let playersGroups = _.chunk(ranking, competition.getSetting("groupSize"))

    //If last group is too small, join the last two groups (maybe it would be good to let the admin choose here)
    if (_.last(playersGroups).length < competition.getSetting("minGroupSize")){

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
        playersIDs: playersGroup,
        scores: Array(playersGroup.length**2).fill(false)
      })

    })

    let betsSettled;

    betsSettled = await this.settleGroupBets(competition, batch)
    if (!betsSettled) return false
    
    //We need to delete a bunch of things
    let deletes = []
    //Delete all the groups that were there and their subcollections
    deletes.push(this.callHttpsFunction('recursiveDelete', { path: this.groupsRef(gymID,compID).path }) )
    //Delete all pendingMatches and their subcollections
    deletes.push(this.callHttpsFunction('recursiveDelete', { path: this.pendingMatchesRef(gymID,compID).path }))
    
    await withProgressAsync(
      {progress: translate("progress.cleaning previous groups"), error: translate("errors.could not clean previous groups"), throwErr: true}, 
      Promise.all
    ) (deletes)

    //When everything is deleted, commit the batch 
    await withProgressAsync(
      {progress: translate("progress.submitting all changes"), error: translate("errors.could not generate new groups"), throwErr: true}, 
      batch.commit.bind(batch)
    ) ()

  }

  generateGroups = withProgressAsync({progress: translate("progress.generating new groups")}, this._generateGroups)

  settleGroupBets = async (competition, batch) => {

    try {

      let shouldCommit = false
      if (!batch){
        shouldCommit = true
        batch = this.firestore.batch()
      }

      const {gymID, id: compID} = competition
      let {bettingPoints} = competition

      let [groups, compBets] = await Promise.all([this.groupsRef(gymID, compID).get(), this.betsRef(gymID, compID).get() ])
      compBets = compBets.docs.map(bet => ({...bet.data(), ref: bet.ref }) )

      groups.forEach( group => {

        let groupBets = _.filter( compBets, ["refTo", group.ref.path])

        if(groupBets && groupBets.length > 0){
        
          groupBets.forEach(bet => {

            //If it is already settled go to the next bet
            if (bet.settled) return false

            const settledBet = settleBet(_.omit(bet, ["ref"]) , {group: group.data(), competition})

            //Update the competition's betting points
            bettingPoints = this._updateBettingPoints(bettingPoints, settledBet)
            
            batch.set( bet.ref, settledBet )
          })

        }

      })

      batch.update(this.compRef(gymID, compID), {bettingPoints})

      if (shouldCommit) return batch.commit()
      else return true

    } catch (error) {

      console.warn(error)
      return false
    }
    
  }

  _updateBettingPoints = (bettingPoints, settledBet) => {
    
    if (bettingPoints[settledBet.uid]){
      bettingPoints[settledBet.uid] += settledBet.outcome
    } else {
      bettingPoints[settledBet.uid] = settledBet.outcome
    }

    return bettingPoints
  }

  submitBets = ({gymID, id: compID}, bets, callback = () => {}) => {
    
    let batch = this.firestore.batch()

    bets.forEach(bet => {

        batch.set(
        bet.removePreviousBet ? this.betsRef(gymID, compID).doc(bet.removePreviousBet) : this.betsRef(gymID, compID).doc(),
        _.omit(bet, ["removePreviousBet"]) )

      })

    batch.commit().then(callback).catch((reason) => alert(reason))
  }

  //This function should be fired when 
  updateGroupScores = (gymID, compID, groupID) => {

    this.callHttpsFunction("updateGroupScores", 
      { groupPath:this.groupRef(gymID, compID, groupID).path }
    )

  }

  askToJoinCompetition = (gymID, compID, uid, callback) => {
    /* Puts a new player into the list of players waiting to be accepted to a competition */
    if (uid){
      this.updateCompetitionDoc(gymID, compID, { playersAskingToJoin: FieldValue.arrayUnion(uid) }, callback)
    }
  }

  denyPlayerFromCompetition = (gymID, compID, uid, callback) => {
    /* Removes a player from the list of players waiting for an answer.
    
    There's no specific function to accept players, as one can use this.addNewPlayersToComp, which already
    takes care of removing from the waiting list
    */
    if (uid){  
      this.updateCompetitionDoc(gymID, compID, {playersAskingToJoin: FieldValue.arrayRemove(uid)}, callback)
    }
  }

  addNewPlayersToComp = (gymID, compID, newPlayers, callback = () => {}) => {
    /* Function that adds players to a given competition */

    // If there are no new players, we don't need to do anything
    if (!newPlayers) return

    // Prepare the array where we are going to append players
    let playersIDsToAdd = []

    // Create the batch that we are going to use
    let batch = this.firestore.batch()

    // Go through all the players that need to be added
    newPlayers.forEach( newPlayer => {

      var uid;

      if (newPlayer.id){
        // If an id is provided, we are going to interpret that this player already exists
        uid = newPlayer.id
        
        // Therefore, all we need to do is to update its current active competitions
        batch.update(this.userRef(uid), {activeCompetitions: FieldValue.arrayUnion(compID)})
      } else {
        // If no id is provided, we assume that this is the info of a new unregistered user
        // We will just create a new user that can be reasigned to a real user when they claim it
        var newRef = this.usersRef.doc();
        uid = newRef.id

        batch.set( newRef, {
          displayName: newPlayer.name,
          email: newPlayer.email.toLowerCase(),
          activeCompetitions: [compID],
          asigned: false
        })
      }

      // In any case, we have a new id that needs to be pushed onto the list of playersIDs for the competition
      playersIDsToAdd.push(uid)

    })

    // Update the competition to incorporate the new players (and remove them from a waiting stage if applicable)
    batch.update(this.compRef(gymID, compID), {
      playersIDs: FieldValue.arrayUnion(...playersIDsToAdd), 
      playersAskingToJoin: FieldValue.arrayRemove(...playersIDsToAdd)
    })

    // Run the batch
    return batch.commit().then(
      () => callback(newPlayers)
    ).catch(err => { alert( translate("errors.unable to add new players") + "\nError: " + err)})

  }

  removeCompetition = (compID) => {

    return this.getCompetition(compID).then((querySnapshot) => {
      let batch = this.firestore.batch()

      let {playersIDs} = querySnapshot.docs[0].data()
      let gymID = querySnapshot.docs[0].ref.parent.parent.id

      //If the competition was initialized by mistake
      playersIDs.forEach(playerID => batch.delete(this.userRef(playerID)))

      batch.delete(this.compRef(gymID, compID))

      batch.commit()
    }).catch(err => alert(translate("errors.competition was not removed") + "\nError: " + err))

  }

  callHttpsFunction = (functionName, argsObject, callback, errorFn) => {
    //Call a cloud function through https

    if (callback === undefined || callback === null) {
        callback = (data) => {
            console.warn("Firebase::callFunction::callback", functionName, data); // hello world
            //alert("SUCCESS: " + functionName + ", data:" + data.data);
        };
    }
    if (errorFn === undefined || errorFn === null) {
        errorFn = (httpsError) => {
            console.warn(`Firebase::callFunction::errorFn [${functionName}], ${httpsError}`); // bar
            //alert("ERROR: " + functionName);
        };
    }
    console.log("Firebase::callFunction functionName[" + functionName + "]");

    return httpsCallable(this.functions, functionName)({dbPrefix: Constants.dbPrefix, ...argsObject}).then(callback).catch(errorFn);
};

  //DATABASE REFERENCES (Only place where they should be declared in the whole app)
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

  compQuery = (compID) => {
    return this.compsGroupRef.where("id", "==", compID)
  }

  compMessagesRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.MESSAGES)
  }

  rankHistoryRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.RANKHISTORY)
  }

  matchesRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.MATCHES)
  }

  matchRef = (gymID, compID, matchID) => {
    return this.matchesRef(gymID, compID).doc(matchID)
  }

  matchBetsRef = (gymID, compID, matchID) => {
    return this.betsRef(gymID, compID).where("refTo", "==", this.pendingMatchRef(gymID, compID, matchID).path)
  }

  pendingMatchesRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.PENDINGMATCHES)
  }

  pendingMatchRef = (gymID, compID, matchID) => {
    return this.pendingMatchesRef(gymID, compID).doc(matchID)
  }

  groupsRef = (gymID, compID) => this.compRef(gymID, compID).collection(Subcollections.GROUPS);

  groupRef = (gymID, compID, groupID) => this.groupsRef(gymID, compID).doc(groupID);

  playerGroupQuery = (gymID, compID, uid) => {
    return this.groupsRef(gymID, compID).where("playersIDs", "array-contains", uid )
  }

  betsRef = (gymID, compID) => {
    return this.compRef(gymID, compID).collection(Subcollections.BETS)
  }

  get betsGroupRef() {
    return this.firestore.collectionGroup(Subcollections.BETS)
  }

  userBetsRef = (uid) => this.betsGroupRef.where("uid", "==", uid)

  // DATA STANDARIZERS

  standarizeMatchDocInfo = (matchDoc) => {

    //Standarizes the returns of a match read from the database
    let match = matchDoc.data()

    return {
      ...match,
      id: matchDoc.id,
      due: match.due ? match.due.toDate() : undefined,
      scheduled: match.scheduled ? { ...match.scheduled, time: match.scheduled.time ? match.scheduled.time.toDate() : match.scheduled.time} : undefined,
      playedOn: match.playedOn ? match.playedOn.toDate() : undefined,
      context: {
        ...match.context, 
        competition: {...match.context.competition, id: matchDoc.ref.parent.parent.id, gymID: matchDoc.ref.parent.parent.parent.parent.id},
        pending: matchDoc.ref.parent.id == Subcollections.PENDINGMATCHES
      },
      
    }
  
  }

  //Helper functions
  isMatchPlayedAlready = (matchPath) => matchPath.includes("/" + Subcollections.MATCHES + "/")

  fromDate = (date) => firebase.firestore.Timestamp.fromDate( new Date(Number(date)) )
  
}

Firebase.shared = new Firebase();

export default Firebase.shared;

