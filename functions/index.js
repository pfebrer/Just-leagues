/**
 * URL PARAMETERS
 * dbPrefix --> [tt] prefix concatenated in order to test with another collections
 * u --> [Enric Calafell] admin credentials
 * *API --> methods used internally by the app
 * *URL --> request used openly
 */

// EXTRACT FROM CONSTANTS.js


const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '128MB',
    node: '10'
}

const Constants = {
    GROUP_SIZE: 4,
    UNTYING_CRITERIA: ["directMatch","position"],
    dbPrefix: "",
};

const Collections = {
    GYMS: (Constants.dbPrefix && Constants.dbPrefix) + "gyms",
    USERS: (Constants.dbPrefix && Constants.dbPrefix) + "users",
    RANKINGS: (Constants.dbPrefix && Constants.dbPrefix) + "rankings",
    GROUPS: (Constants.dbPrefix && Constants.dbPrefix) + "groups",
    PLAYERS: (Constants.dbPrefix && Constants.dbPrefix) + "players",
    TOURNAMENT: (Constants.dbPrefix && Constants.dbPrefix) + "Torneig",
    MATCHES: (Constants.dbPrefix && Constants.dbPrefix) + "matches",
    MONTH_INFO: (Constants.dbPrefix && Constants.dbPrefix) + "monthInfo",
    CHALLENGE: (Constants.dbPrefix && Constants.dbPrefix) + "Reptes"
};

const Subcollections = {
    COMPETITIONS: "competitions",
    GROUPS: "groups",
    MATCHES: "matches",
    PENDINGMATCHES: "pendingMatches"
}

const Documents = {
    RANKINGS: {
        squashRanking: "squashRanking",
    },
    MONTH_INFO: {
        typeOfComp: "typeOfComp",
        updateRanking: "updateRanking"
    },
    GROUPS: {
        chatMessages: "chatMessages",
        generalMessages: "generalMessages"
    },
    PLAYERS: {
        props: {
            currentGroup: "currentGroup",
            playerName: "playerName"
        }
    }
};

const strings ={
    "new date for match" : "Nova data de partit"
}

// REMEMBER TO KEEP IN SYNC WITH CONSTANTS.js
const functions = require('firebase-functions');
const fetch = require('node-fetch');
const admin = require('firebase-admin');

const moment = require('moment')

admin.initializeApp();
const firestore = admin.firestore();
const auth = admin.auth();

const firestoreFunction = functions.region('europe-west1').runWith(runtimeOpts).firestore
const httpsFunction = functions.region('europe-west1').runWith(runtimeOpts).https


exports.initCompetition = firestoreFunction.document(Collections.GYMS + "/{gymID}/"+ Subcollections.COMPETITIONS + "/{compID}"  )
.onCreate((snap, context) => {

    const {gymID, compID} = context.params
    const {players, name: compName, type: compType} = snap.data()

    let batch = firestore.batch()
    let playersIDs = [];

    //Create all the unasigned users of this new competition
    players.forEach( player => {

        var newRef = firestore.collection(Collections.USERS).doc();
        playersIDs.push(newRef.id)

        batch.set( newRef, {
            displayName: player.name,
            email: player.email.toLowerCase(),
            activeCompetitions: [{
                gymID: gymID,
                id: compID,
                name: compName,
                type: compType,
            }],
            asigned: false
        })

    })

    //Update also the competition players (create a playersIDs list and remove the helper players list)
    batch.update(snap.ref, {
        playersIDs,
        players: admin.firestore.FieldValue.delete()
    })

    return batch.commit()
    
})


//Send a push notification when date of a match changes
exports.newDateForMatchNotification = firestoreFunction.document(Collections.GYMS + "/{gymID}/"+ Subcollections.COMPETITIONS + "/{compID}/" + Subcollections.PENDINGMATCHES +"/{matchID}")
.onWrite((change, event) => {

    const {playersIDs, scheduled} = change.after.data();
    const {scheduled: prevScheduled} = change.before.data();

    if (scheduled && scheduled.time && (!prevScheduled || prevScheduled.time.toDate() != scheduled.time.toDate())){
        
        promises = []

        playersIDs.forEach( uid => {
            promises.push(firestore.collection(Collections.USERS).doc(uid).get())
        })

        return Promise.all(promises).then(snapshots => {

            messages = []
            players = []

            snapshots.forEach( docSnapshot => {
                
                var { expoToken, displayName } = docSnapshot.data()

                players.push({expoToken, displayName})

            })

            players.forEach(player => {
                if (player.expoToken) {
                    messages.push({
                        "to": player.expoToken,
                        "sound": "default",
                        "title": strings["new date for match"],
                        "body": players[0].displayName+ " - "+players[1].displayName+" :" + moment(scheduled.time.toDate()).calendar()
                    });
                }
            })

            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages)

            });
            
        })
        .catch(err => console.log(err))
        
    } else {
        console.log("Date did not change")
        return null
    }
    
});

//Send a push notification
exports.messageNotification = firestoreFunction.document('groups/{iGroup}/chatMessages/{id}').onCreate((event, context) => {

    const {playerName, message} = event.data();
    let iGroup = context.params.iGroup;
    iGroup = /^\d+$/.test(iGroup) ? Number(context.params.iGroup) : iGroup;
    const authorName = playerName;
    const root = event.ref.firestore;
    let messages = [];
    //return the main promise 

    return root.collection(Collections.PLAYERS()).where("currentGroup", "==", iGroup).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {

            let {expoToken, playerName} = childSnapshot.data();
            let title = /^\d+$/.test(iGroup) ? "Xat del grup " + iGroup : "Xat general";
            if (expoToken && playerName !== authorName) {
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": authorName + ": " + message
                });
            }
        });
        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages)

    }).then(messages => {

        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages)

        });
    }).catch(reason => {
        console.log(reason)
    });
});

//Enviar notificacions quan s'afegeixen partits
exports.matchNotification = firestoreFunction.document(Collections.GYMS + "/{gymID}/"+ Subcollections.COMPETITIONS + "/{compID}"+ Subcollections.MATCHES + '/{matchid}').onCreate((event, context) => {

    const {iGroup, matchPlayers, matchResult} = event.data();
    const iWinner = matchResult.indexOf(3);
    const setsLoser = iWinner === 1 ? matchResult[0] : matchResult[1];
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner === 1 ? matchPlayers[0] : matchPlayers[1];
    const iGroupFaked = iGroup === "Torneig" ? "Reptes" : iGroup;

    const root = event.ref.firestore;
    const messages = [];
    let title;
    if (/^\d+$/.test(iGroup)) {
        title = "Partit afegit al grup " + iGroup
    } else if (iGroup === "Reptes") {
        title = "Nou repte afegit"
    } else if (iGroup === "Torneig") {
        title = "S'ha jugat un partit dels campionats"
    }
    //return the main promise
    return firestore.collection(Collections.PLAYERS()).where(Documents.PLAYERS.props.currentGroup, "==", iGroupFaked).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            let {expoToken, playerName} = childSnapshot.data();
            if (expoToken) {
                let message;
                if (matchPlayers.indexOf(playerName) !== -1) {
                    message = winnerName === playerName ? "Has guanyat a " + loserName + " 3-" + setsLoser : "Has perdut contra " + winnerName + "3-" + setsLoser;
                } else {
                    message = winnerName + " ha guanyat a " + loserName + " 3-" + setsLoser;
                }
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": message
                });
            }
        });
        //return Promise.all(messages)
        return firestore.collection(Collections.PLAYERS()).where(Documents.PLAYERS.props.isAdmin, "==", true).get();
    }).then((snapshot) => {
        //return firestore.collection(Collections.PLAYERS()).where(Documents.PLAYERS.props.isAdmin, "==", true).get().then((snapshot) => {
        snapshot.forEach((querySnapshot) => {
            let {expoToken, playerName} = querySnapshot.data();
            if (expoToken && matchPlayers.indexOf(playerName) === -1) {

                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": winnerName + " ha guanyat a " + loserName + " 3-" + setsLoser
                });
            }
        });
        //}).catch(reason => console.log(reason));
        return Promise.all(messages);
    }).then(messages => {
        fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messages)

        });
    }).catch(reason => {
        console.log(reason)
    });
});

exports.newChallenge1 = firestoreFunction.document('Reptes/{id}').onCreate((event, context) => {

    const {matchPlayers, matchResult} = event.data();
    let iWinner = matchResult.indexOf(3);
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner === 1 ? matchPlayers[0] : matchPlayers[1];

    const root = event.ref.firestore;
    const messages = [];
    //return the main promise 
    return root.collection(Collections.RANKINGS()).doc(Documents.RANKINGS.squashRanking).get().then((docSnapshot) => {

        let {ranking, wentUp, wentDown, oneWon} = docSnapshot.data();
        if (!oneWon) {
            oneWon = []
        }

        let iLoser;
        [iLoser, iWinner] = [ranking.indexOf(loserName), ranking.indexOf(winnerName)];
        if (iWinner < iLoser) {
            //Guanyador puja una posició i perdedor baixa una
            if (iWinner !== 0 && oneWon.indexOf(winnerName) >= 0) {
                ranking[iWinner] = ranking[iWinner - 1];
                ranking[iWinner - 1] = winnerName;
                oneWon.splice(oneWon.indexOf(winnerName), 1)
            } else if (oneWon.indexOf(winnerName) === -1) {
                oneWon.push(winnerName)
            }
            if (iLoser !== ranking.length - 1) {
                ranking[iLoser] = ranking[iLoser + 1];
                ranking[iLoser + 1] = loserName;
            }
        } else {
            ranking.splice(iLoser, 0, winnerName);
            ranking.splice(iWinner + 1, 1);
        }

        if (!wentUp) {
            wentUp = [];
        }
        if (!wentDown) {
            wentDown = [];
        }
        if (wentDown.indexOf(loserName) === -1) {
            wentDown.push(loserName);
        }
        if (wentUp.indexOf(loserName) >= 0) {
            wentUp.splice(wentUp.indexOf(loserName), 1);
        }
        if (oneWon.indexOf(winnerName) === -1) {
            if (wentUp.indexOf(winnerName) === -1) {
                wentUp.push(winnerName);
            }
            if (wentDown.indexOf(winnerName) >= 0) {
                wentDown.splice(wentDown.indexOf(winnerName), 1);
            }
        }

        return root.collection(Collections.RANKINGS()).doc(Documents.RANKINGS.squashRanking).set({
            ranking,
            wentUp,
            wentDown,
            oneWon
        });
    }).then(() => {
        console.log("Succesfully changed ranking")
    }).catch((reason) => {
        console.log(reason)
    })
});

exports.updateRankingOnCreate = firestoreFunction.document('monthInfo/updateRanking').onCreate((document, event) => {
    return __updateRanking(null, null, {user: {admin: true}});
});
exports.updateRankingOnUpdate = firestoreFunction.document('monthInfo/updateRanking').onUpdate((document, event) => {
    return __updateRanking(null, null, {user: {admin: true}});
});

exports.updateGroupsOnCreate = firestoreFunction.document('monthInfo/updateGroups').onCreate((document, event) => {
    return __updateGroups(null, null, {user: {admin: true}});
});
exports.updateGroupsOnUpdate = firestoreFunction.document('monthInfo/updateGroups').onUpdate((document, event) => {
    return __updateGroups(null, null, {user: {admin: true}});
});

exports.updateRanking = httpsFunction.onCall((data, context) => {
    return validateAndContinue(req, res, __updateRanking);
});
exports.updateRankingAPI = httpsFunction.onCall((data, context) => {
    return validateAndContinueAPI(data, context, __updateRanking);
});
exports.updateRankingURL = httpsFunction.onRequest((data, context) => {
    return validateAndContinueURL(data, context, __updateRanking);
});

exports.updateGroups = httpsFunction.onCall((data, context) => {
    return validateAndContinue(data, context, __updateGroups);
});
exports.updateGroupsAPI = httpsFunction.onCall((data, context) => {
    return validateAndContinueAPI(data, context, __updateGroups);
});
exports.updateGroupsURL = httpsFunction.onRequest((req, res) => {
    return validateAndContinueURL(req, res, __updateGroups);
});

exports.setRankingURL = httpsFunction.onRequest((req, res) => {
    return validateAndContinueURL(req, res, __setRanking);
});

exports.getRankingURL = httpsFunction.onRequest((req, res) => {

    return validateAndContinueURL(req, res, __getRanking);
});

// exports.testPath = httpsFunction.onRequest((req, res) => {
//     console.log(req.query.q);
//     let ret = [];
//     firestore.doc(req.query.q).get().then(documentData => {
//         console.log("DOCUMENT", documentData);
//     }).catch(err => {
//         console.error("ERROR in DOCUMENT");
//     });
//     // firestore.collection(req.query.q).get().then(collectionData => {
//     //     console.log("COLLECTION", collectionData);
//     // }).catch(err => {
//     //     console.error("ERROR in COLLECTION");
//     // });
//
// });

// exports.migrateUsers = httpsFunction.onRequest((req, res) => {
//     let playersRef = firestore.collection(Collections.PLAYERS(__getDBPrefix(req)));
//     let V3dev_users = firestore.collection('V3dev_users');
//     playersRef.get().then(playerDocument => {
//         let players = [];
//         playerDocument.forEach(player => {
//             console.log("2migrating player ", player.data().playerName, player.id);
//             auth.getUser(player.id).then(userAuthRecord => {
//                 console.log("getting AUTH player ", player.id);
//                 return userAuthRecord;
//             }).then((userAuthRecord) => {
//                 console.log("migrating userAuthRecord ", userAuthRecord.email, userAuthRecord.uid);
//                 let playerEmail = userAuthRecord.email;
//                 let playerData = player.data();
//                 playerData.name = playerData.playerName;
//                 delete playerData["playerName"];
//                 playerData["email"] = userAuthRecord.email;
//                 playerData["authUID"] = userAuthRecord.uid;
//                 console.log("migrateUsers::MOVED User[" + playerEmail + "] in FIRESTORE", playerData);
//                 V3dev_users.doc(player.id).set(playerData, {merge: true}).then(v3player => {
//                     // V3dev_users.doc(player.id).set({email : userAuthRecord.email, authUID: userAuthRecord.uid}, {merge: true});
//                 });
//                 players.push(playerData);
//             },reason => {}).catch(err => {
//                 console.error("Could not migrate user " + player.data().name, err);
//             });
//         });
//         return players;
//     }).catch(err => {
//         console.error("Could not migrate users", err);
//         res.status(500).json(err);
//     });
// });

// exports.migrateMatches = httpsFunction.onRequest((req, res) => {
//     let matches = firestore.collection('matches');
//     let new_matches = firestore.collection('/V3dev_gyms/nickspa/matches');
//     let users = firestore.collection('/V3dev_users');
//     matches.get().then(matchQuerySnapshot => {
//         matchQuerySnapshot.forEach(match => {
//             let newMatch = {
//                 date: match.data().date,
//                 groupdId: match.data().iGroup,
//                 players: match.data().matchPlayers,
//                 playersRef: [],
//                 result: match.data().matchResult
//             };
//             new_matches.doc(match.id).set(newMatch, {merge: true}).then(v3player => {
//                 // let {matchPlayers} = match.data();
//                 // matchPlayers.forEach(matchPlayer => {
//                 //     users.where('playerName', '==', matchPlayer).then(userQuerySnapshot => {
//                 //         userQuerySnapshot.forEach(user => {
//                 //             newMatch.playersRef.push(user.data().authUID);
//                 //             new_matches.doc(match.id).set(newMatch).catch(err => {
//                 //                 console.error("Player [" + playerName + "] not found", err);
//                 //             });
//                 //         });
//                 //     }).catch(err => {
//                 //         console.error("Player [" + playerName + "] not found", err);
//                 //     });
//                 // });
//             }).catch(err => {
//                 console.error("Could not update match ", match.id, err);
//             });
//         });
//     }).catch(err => {
//         console.error("Could not migrate matches", err);
//         res.status(500).json(err);
//     });
// });
// exports.migrateMatchesUpdatePlayersRef = httpsFunction.onRequest((req, res) => {
//     let new_matchesdb = firestore.collection('/V3dev_gyms/nickspa/matches');
//     let usersdb = firestore.collection('/V3dev_users');
//
//     return usersdb.get().then(userQuerySnapshot => {
//         let users = {};
//         userQuerySnapshot.forEach(userdb => {
//             users[userdb.data().name] = userdb.data().authUID;
//         });
//         return users;
//     }).then(users => {
//         console.log(JSON.stringify(users));
//         return new_matchesdb.get().then(newMatchesQuerySnapshot => {
//             newMatchesQuerySnapshot.forEach(match => {
//                 let playersRef = [];
//                 let {players} = match.data();
//                 players.forEach(player => {
//                     playersRef.push(users[player] || "noRef");
//                 });
//                 console.log(match.id + " -> players-> " + JSON.stringify(players) + ", playersRef -> " + JSON.stringify(playersRef));
//                 // console.log(match.id + " -> " + match.data().date + " -> " + JSON.stringify(players));
//                 let newMatch = match.data();
//                 newMatch["playersRef"] = playersRef;
//                 return new_matchesdb.doc(match.id).set(newMatch, {merge: true}).then(r => {
//                      console.log(match.id + 'updated')
//                  });
//             });
//         });
//         res.status(200).json(users);
//     }).catch(err => {
//         console.error("algo va mal", err)
//         res.status(500).json(err);
//     });
// });

const __getDBPrefix = (req) => {
    let ret = req.dbPrefix || req.query.dbPrefix || req.body.dbPrefix || "";
    if (ret !== "") {
        ret = ret + "_";
        console.log("__getDBPrefix::USING DE PREFIX " + ret);
    }
    return ret;
}

const __untie = (iPlayers, results, criteria) => {

    //Loop through all the criteria until we find one where players are untied
    criteria.forEach((criterion, idx, criteria) => {

        if (criterion == "position") {

            return iPlayers[0] - iPlayers[1]

        } else if (criterion == "directMatch") {

            let size = Math.sqrt(results.length); //size of the group

            //Get the scores of the direct match between the two players
            let scoreP1 = results[iPlayers[0] * size + iPlayers[1]]
            let scoreP2 = results[iPlayers[1] * size + iPlayers[0]]

            //Return the comparison in case the scores are different
            if (scoreP1 !== scoreP2) {
                return scoreP1 - scoreP2
            } //else just wait for the next criterion to solve the problem
        }

    })
}

const __updateRanking = (data, context, user) => {
    let things = {};
    let isAdmin = Boolean(user.admin);
    //return the main promise
    return firestore.collection(Collections.GROUPS(__getDBPrefix(data))).get().then((snapshot) => {

        let sortedGroups = [];

        snapshot.forEach((docSnapshot) => {
            let {results} = docSnapshot.data();
            let iGroup = Number(docSnapshot.id); //document id of Group
            let size = Math.sqrt(results.length); // gets the group size opposite of Exponentiation
            let totals = [];
            for (let i = 0; i < size; i++) { //in groups of 4 members results array size will be 16
                let total = results.slice(i * 4, (i + 1) * 4).reduce((a, b) => a + b, 0); //compute totals per player
                totals.push([total, i]);
            }
            //Totals per player were calculated
            //sort group in proper order
            let sortedGroup = totals.sort((a, b) => {
                let pointsDif = b[0] - a[0];
                if (pointsDif !== 0) {
                    return pointsDif;
                }
                return __untie([a[1], b[1]], results, Constants.UNTYING_CRITERIA)
            }).map(([_, i]) => i + (iGroup - 1) * 4);

            sortedGroups.push(sortedGroup);

        });

        let sortedRanking = [];
        sortedGroups.forEach((group, i) => {
            if (i < sortedGroups.length - 1) {
                let lastOfGroup = group[group.length - 1];
                let firstOfNextGroup = sortedGroups[i + 1][0];
                group[group.length - 1] = firstOfNextGroup;
                sortedGroups[i + 1][0] = lastOfGroup;
            }
            sortedRanking = sortedRanking.concat(group)
        });

        things.sortedRanking = sortedRanking;

        return firestore.collection(Collections.RANKINGS(__getDBPrefix(data))).doc(Documents.RANKINGS.squashRanking).get();
    }).then((docSnapshot) => {
        let {ranking} = docSnapshot.data();

        let newRanking = things.sortedRanking.map((playerPos) => {
            return ranking[playerPos]
        });
        if (isAdmin) {
            firestore.collection(Collections.RANKINGS(__getDBPrefix(data))).doc(Documents.RANKINGS.squashRanking).set({ranking: newRanking});
        }
        if (context.status) {
            context.status(200).json(newRanking);
        }
    }).catch((reason) => {
        console.log(reason);
    });
};

const __getRanking = (req, res, user) => {
    return firestore.collection(Collections.RANKINGS(__getDBPrefix(req))).doc(Documents.RANKINGS.squashRanking).get().then((docSnapshot) => {
        let {ranking} = docSnapshot.data();
        res.status(200).json(ranking);
    });
};

const __setRanking = (req, res, user) => {
    console.log("__setRanking::START PROCESSING");
    let ranking = req.query.ranking || req.body.ranking;
    const capitalizeName = (str) => {
        const pieces = str.split(" ");
        for (let i = 0; i < pieces.length; i++) {
            const j = pieces[i].charAt(0).toUpperCase();
            pieces[i] = j + pieces[i].substr(1).toLowerCase();
        }
        return pieces.join(" ");
    };
    const generateNickEmail = (name) => {
        let parts = name.toLowerCase().split(" ");
        let email = "";
        for (let i = 0; i < parts.length - 1; i++) {
            email += parts[i].charAt(0);
        }
        email += parts[parts.length - 1];
        return email + "@" + __getDBPrefix(req).replace("_", ".") + "nickspa.cat"
    };
    const generatePassword = (name) => {
        let parts = name.toLowerCase().split(" ");
        name = capitalizeName(parts[0]);
        return name + '0123';
    };

    ranking = ranking.split(",");

    let playersRef = firestore.collection(Collections.PLAYERS(__getDBPrefix(req)));

    let newRanking = [];
    for (let i = 0; i < ranking.length; i++) {
        let player = ranking[i];
        let playerEmail = generateNickEmail(player);
        let playerCapitalizedName = capitalizeName(player);
        let playerPassword = generatePassword(player);
        console.log("__setRanking::PROCESSING User[" + playerEmail + "][" + (i + 1) + "] with name[" + playerCapitalizedName + "] and password[" + playerPassword + "]");
        playersRef.where("playerName", "==", playerCapitalizedName).get().then((snapshot) => {
            if (snapshot.empty) {
                auth.getUserByEmail(playerEmail).then((user) => {
                    console.log("__setRanking::CREATING User[" + playerEmail + "] exists in AUTH");
                }).catch((err) => {
                    console.log("__setRanking::CREATING User[" + playerEmail + "] NOT exists in AUTH, CREATING USER in AUTH");
                    return auth.createUser({
                        displayName: playerCapitalizedName,
                        email: playerEmail,
                        emailVerified: false,
                        password: playerPassword
                    });
                }).then((userRecord) => {
                    console.info("SOC USER_RECORD", userRecord);
                    return auth.getUserByEmail(playerEmail);
                }).then((userR) => {
                    console.log("__setRanking::CREATING User[" + playerEmail + "] in FIRESTORE");
                    playersRef.doc(userR.uid).set({
                        currentGroup: -99,
                        playerName: playerCapitalizedName,
                        currentRanking: (i + 1)
                    }, {merge: true});
                }).catch(err => console.error("__setRanking:: ERROR CREATING User[" + playerEmail + "] in FIRESTORE", err));
            } else {
                console.log("__setRanking::UPDATE User[" + playerEmail + "] in FIRESTORE with currentRanking " + (i + 1));
                snapshot.forEach((userR) => {
                    playersRef.doc(userR.id).set({
                        currentGroup: -99,
                        playerName: playerCapitalizedName,
                        currentRanking: (i + 1)
                    }, {merge: true});
                });

            }
        });
        newRanking.push(playerCapitalizedName);
    }
    console.log("__setRanking::ranking [" + ranking + "]");
    console.log("__setRanking::newRanking [" + newRanking + "]");
    firestore.collection(Collections.RANKINGS(__getDBPrefix(req))).doc(Documents.RANKINGS.squashRanking).set({ranking: newRanking});
    res.status(200).json(newRanking);
    return newRanking;
};

const __updateGroups = (data, context, user) => {

    let updateGroupsTmp = {
        sortedRanking: [],
        ranking: {},
        playerData: {},
        results: {},
        user: (user || context && context.auth && context.auth.user)
    };
    const executeActions = Boolean(updateGroupsTmp.user.admin || data.forceActions || context && context.query && context.query.forceActions);

    console.log("__updateGroups::User" + JSON.stringify(updateGroupsTmp.user));
    console.log("__updateGroups::Can execute actions[" + executeActions + "]");

    let totalGroups = 0;
    let orphans = 0;
    let ranking = null;

    return firestore.collection(Collections.RANKINGS(__getDBPrefix(data))).doc(Documents.RANKINGS.squashRanking).get().then(playerSnapshot => {
        ranking = playerSnapshot.data().ranking;
        totalGroups = Math.trunc(ranking.length / Constants.GROUP_SIZE);
        orphans = ranking.length % Constants.GROUP_SIZE;
        // generate group for orphan people
        if (orphans > 0) {
            totalGroups++;
        }
        return firestore.collection(Collections.GROUPS(__getDBPrefix(data))).get();
    }).then((snapshot) => {
        console.log("__updateGroups::Cleaning groups");
        console.log("__updateGroups::snapshot.size[" + snapshot.size + "], totalGroups[" + totalGroups + "]");
        if (snapshot.size > totalGroups) {
            for (let i = totalGroups + 1; i < snapshot.size; i++) {
                console.log("__updateGroups::Cleaning group[" + i + "]");
                firestore.collection(Collections.GROUPS(__getDBPrefix(data))).doc(String(i)).delete().catch((err) => {
                    console.error("__updateGroups::Could not delete group " + String(i), err)
                });
            }
        }
        return firestore.collection(Collections.PLAYERS(__getDBPrefix(data))).get();
    }).then((snapshot) => {
        // Update player Rankings
        // firestore.collection(Collections.PLAYERS(__getDBPrefix(data))).get().then((snapshot) => {
        console.log("__updateGroups::Ranking " + JSON.stringify(ranking));
        console.log("__updateGroups::snapshot [" + JSON.stringify(snapshot) + "]");
        let batch = firestore.batch();
        updateGroupsTmp.sortedRanking = ranking;
        snapshot.forEach((playerDoc) => {
            let playerName = playerDoc.data().playerName;
            let position = ranking.indexOf(playerName);
            let groupPosition = Math.trunc(position / 4) + 1;
            //console.log('__updateGroups::PLAYER[' + playerDoc.id + '][' + playerName + '][' + position + '][' + groupPosition + ']=>' + JSON.stringify(playerDoc.data()));
            //updateGroupsTmp.playerData[playerName] = playerDoc.data();
            updateGroupsTmp.ranking[playerName] = position;
            if (executeActions) {
                batch.set(playerDoc.ref, {
                    currentGroup: groupPosition
                }, {merge: true});
                // playerDoc.ref.set({
                //     currentGroup: groupPosition
                // }, {merge: true}).catch((err) => {
                //     console.error("__updateGroups::Could not update player " + playerName, err);
                // });
            }
        });
        batch.commit().catch(err => console.error("__updateGroups::Could not update players ", err));
        console.log("LOLO");

        let emptyCalculatedGroups = {}; //avoid unnecessary calculations improve performance
        let getEmptyGroup = function (arrLength) {
            let ret = emptyCalculatedGroups[arrLength];
            if (ret === null || ret === undefined) {
                ret = [];
                //Exponentiation  to 2 in order to generate all matches
                for (let k = Math.pow(arrLength, 2); k > 0; k--) {
                    ret.push(false);
                }
                ret = emptyCalculatedGroups[arrLength] = {results: ret};
            }
            return ret;
        };
        console.log("__updateGroups::TOTAL Groups " + totalGroups);
        let groupRef = null;
        if (executeActions) {
            groupRef = firestore.collection(Collections.GROUPS(__getDBPrefix(data)));
        }
        for (let i = 1; i < (totalGroups + 1); i++) {
            if (i + 1 === totalGroups && orphans > 0) {
                updateGroupsTmp.results[i] = getEmptyGroup(orphans);
            } else {
                updateGroupsTmp.results[i] = getEmptyGroup(Constants.GROUP_SIZE);
            }
            if (executeActions) {
                console.log("__updateGroups::Creating/Updating group[" + i + "] with [" + JSON.stringify(updateGroupsTmp.results[i]) + "]");
                groupRef.doc(String(i)).set(updateGroupsTmp.results[i], {merge: true}).catch((err) => {
                    console.error("__updateGroups::Could not update group " + i, err);
                });
            }
        }


        // res.write(JSON.stringify(logGroups));
        //res.write(JSON.stringify(log));

        console.log("PEPITO");
        console.log('__updateGroups::updateGroupsTmp' + JSON.stringify(updateGroupsTmp));
        //return updateGroupsTmp;
        if (context.status) {
            context.status(200).json(updateGroupsTmp);
        }
        return updateGroupsTmp;
    }).catch((err) => console.error("__updateGroups::Could not retrieve  players", err));
};

const validateAndContinue = (data, context, next) => {
    let userUID = context.auth.uid;
    if (userUID !== null && userUID !== undefined) {
        // auth.verifyIdToken(idToken).then((decodedIdToken) => {
        console.log('ID Token correctly decoded User', userUID);
        let user = {};
        firestore.collection(Collections.PLAYERS(__getDBPrefix(data))).doc(userUID).get().then((docSnapshot) => {
            let {playerName, currentGroup, admin} = docSnapshot.data();
            user.playerName = playerName;
            user.currentGroup = currentGroup;
            user.admin = admin;
            // adding resolved user to CallableContext
            context.auth.user = user;
            console.log("validateAndContinue::currentUser", context.auth);
            return next(data, context, user);
        }).catch(err => {
            console.error("User not found in auth", err);
            if (context.status) {
                context.status(403).send('Unauthorized');
            }

        });
        // }).catch((error) => {
        //     console.error('Error while verifying Firebase ID token:', error);
        //     res.status(403).send('Unauthorized');
        // });
    } else {
        if (context.status) {
            context.status(403).send('Unauthorized');
        }
    }
};

const validateAndContinueAPI = (data, context, next) => {
    let idToken = lookIdentityInRequest(req, res);
    console.log("validateAndContinueAPI::idToken", idToken);
    if (idToken !== null && idToken !== undefined) {
        if ('userAndPasswordCredentials' === idToken) {
            return validateAndContinueURL(req, res, next);
        } else {
            // let user = req.query.u;
            // let password = req.query.p;
            //admin.auth().generateSignInWithEmailLink()
            // auth.signInWithEmailAndPassword(user + "@nickspa.cat", password).then(async (userCredential) => {
            //     validateAndContinue(req.query, {
            //         auth: {uid: userCredential.uid}
            //     }, next);
            // });
            // } else {
            auth.verifyIdToken(idToken).then((decodedIdToken) => {
                validateAndContinue(req.query, {
                    auth: {uid: decodedIdToken.uid}
                }, next);
            });
        }
        // }
    } else {
        if (context.status) {
            context.status(403).send('Unauthorized');
        }
    }
};

const validateAndContinueURL = (req, res, next) => {
    let queryUser = req.query.u || req.body.u;
    let user = {};
    let ret = firestore.collection(Collections.PLAYERS(__getDBPrefix(req))).where(Documents.PLAYERS.props.playerName, "==", queryUser).get().then((querySnapshot) => {
        if (querySnapshot.empty) {
            console.log("validateAndContinueURL::Database [" + Collections.PLAYERS(__getDBPrefix(req)) + "] is EMPTY");
            if (res.status) {
                res.status(404).send('Unauthorized');
            }
        } else {
            querySnapshot.forEach(function (docSnapshot) {
                let {playerName, currentGroup, admin} = docSnapshot.data();
                user.playerName = playerName;
                user.currentGroup = currentGroup;
                user.admin = admin;
                if (!res.auth) {
                    res["auth"] = {};
                }
                if (!res.auth.user) {
                    res.auth["user"] = {};
                }
                res.auth.user = user;
                console.log("validateAndContinue::currentUser", res.auth);
                return next(req, res, user);
            });
        }
    }).catch(err => {
        console.error("validateAndContinueURL::User not found in auth", err);
        if (res.status) {
            res.status(403).send('Unauthorized');
        }

    });
};

const lookIdentityInRequest = (req, res) => {
    let idToken = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.query.idToken) {
        console.log('Found "idToken" query parameter');
        idToken = req.query.idToken;
    } else if (req.cookies) {
        console.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        let user = req.query.u;
        let password = req.query.p;
        if (user !== null && user !== undefined && password !== null && password !== undefined) {
            console.log("Trying to obtain token from user and Password");
            idToken = 'userAndPasswordCredentials';
        } else {
            console.log('No token found :S');
        }
    }
    return idToken;
};