const functions = require('firebase-functions');
const fetch = require('node-fetch')

const admin = require('firebase-admin');
const CONSTANTS = {
    RANKINGS: "rankings",
    SQUASH_RANKING: "squashRanking",
    GROUPS: "groups",
    PLAYERS: "players",
    GROUP_SIZE: 4
};
admin.initializeApp(functions.config().firebase);

//send the push notification 
exports.messageNotification = functions.firestore.document('groups/{iGroup}/chatMessages/{id}').onCreate((event, context) => {

    const {playerName, message} = event.data();
    let iGroup = context.params.iGroup;
    iGroup = /^\d+$/.test(iGroup) ? Number(context.params.iGroup) : iGroup;
    const authorName = playerName;
    const root = event.ref.firestore;
    let messages = [];
    //return the main promise 

    return root.collection(CONSTANTS.PLAYERS).where("currentGroup", "==", iGroup).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {

            let {expoToken, playerName} = childSnapshot.data();
            let title = /^\d+$/.test(iGroup) ? "Xat del grup " + iGroup : "Xat general";
            if (expoToken && playerName != authorName) {
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

    })
        .then(messages => {

            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages)

            });
        })
        .catch(reason => {
            console.log(reason)
        })
});

//Enviar notificacions quan s'afegeixen partits
exports.matchNotification = functions.firestore.document('matches/{id}').onCreate((event, context) => {

    const {iGroup, matchPlayers, matchResult} = event.data();
    const iWinner = matchResult.indexOf(3);
    const setsLoser = iWinner == 1 ? matchResult[0] : matchResult[1];
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner == 1 ? matchPlayers[0] : matchPlayers[1];
    const iGroupFaked = iGroup == "Torneig" ? "Reptes" : iGroup;

    const root = event.ref.firestore;
    const messages = []
    //return the main promise 
    return root.collection('players').where("currentGroup", "==", iGroupFaked).get().then((snapshot) => {
        snapshot.forEach((childSnapshot) => {

            var {expoToken, playerName} = childSnapshot.data();


            if (expoToken) {
                let message;
                if (matchPlayers.indexOf(playerName) != -1) {
                    message = winnerName == playerName ? "Has guanyat a " + loserName + " 3-" + setsLoser : "Has perdut contra " + winnerName + "3-" + setsLoser;
                } else {
                    message = winnerName + " ha guanyat a " + loserName + " 3-" + setsLoser;
                }
                let title;
                if (/^\d+$/.test(iGroup)) {
                    title = "Partit afegit al grup " + iGroup
                } else if (iGroup == "Reptes") {
                    title = "Nou repte afegit"
                } else if (iGroup == "Torneig") {
                    title = "S'ha jugat un partit dels campionats"
                }

                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": message
                });
            }
        });

        root.collection('players').doc("xYenRrtoisOZEvpuRJm0h6FOOe42").get().then((docSnapshot) => {

            var {expoToken, playerName} = docSnapshot.data();
            if (expoToken && matchPlayers.indexOf(playerName) == -1) {
                let title;
                if (/^\d+$/.test(iGroup)) {
                    title = "Partit afegit al grup " + iGroup
                } else if (iGroup == "Reptes") {
                    title = "Nou repte afegit"
                } else if (iGroup == "Torneig") {
                    title = "S'ha jugat un partit dels campionats"
                }
                messages.push({
                    "to": expoToken,
                    "sound": "default",
                    "title": title,
                    "body": winnerName + " ha guanyat a " + loserName + " 3-" + setsLoser
                });
            }
        }).catch(reason => console.log(reason));

        //firebase.database then() respved a single promise that resolves
        //once all the messages have been resolved 
        return Promise.all(messages)
    })
        .then(messages => {

            fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages)

            });
        })
        .catch(reason => {
            console.log(reason)
        })
});

exports.newChallenge1 = functions.firestore.document('Reptes/{id}').onCreate((event, context) => {

    const {matchPlayers, matchResult} = event.data();
    let iWinner = matchResult.indexOf(3);
    const winnerName = matchPlayers[iWinner];
    const loserName = iWinner == 1 ? matchPlayers[0] : matchPlayers[1];

    const root = event.ref.firestore;
    const messages = []
    //return the main promise 
    return root.collection('rankings').doc(CONSTANTS.SQUASH_RANKING).get().then((docSnapshot) => {

        var {ranking, wentUp, wentDown, oneWon} = docSnapshot.data();
        if (!oneWon) {
            oneWon = []
        }

        let iLoser;
        [iLoser, iWinner] = [ranking.indexOf(loserName), ranking.indexOf(winnerName)];
        if (iWinner < iLoser) {
            //Guanyador puja una posició i perdedor baixa una
            if (iWinner != 0 && oneWon.indexOf(winnerName) >= 0) {
                ranking[iWinner] = ranking[iWinner - 1];
                ranking[iWinner - 1] = winnerName;
                oneWon.splice(oneWon.indexOf(winnerName), 1)
            } else if (oneWon.indexOf(winnerName) == -1) {
                oneWon.push(winnerName)
            }
            if (iLoser != ranking.length - 1) {
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
        if (wentDown.indexOf(loserName) == -1) {
            wentDown.push(loserName);
        }
        if (wentUp.indexOf(loserName) >= 0) {
            wentUp.splice(wentUp.indexOf(loserName), 1);
        }
        if (oneWon.indexOf(winnerName) == -1) {
            if (wentUp.indexOf(winnerName) == -1) {
                wentUp.push(winnerName);
            }
            if (wentDown.indexOf(winnerName) >= 0) {
                wentDown.splice(wentDown.indexOf(winnerName), 1);
            }
        }

        return root.collection('rankings').doc(CONSTANTS.SQUASH_RANKING).set({ranking, wentUp, wentDown, oneWon})
    }).then(() => {
        console.log("Succesfully changed ranking")
    }).catch((reason) => {
        console.log(reason)
    })
});

exports.updateRanking = functions.firestore.document('monthInfo/updateRanking').onCreate((event, context) => {

    const root = event.ref.firestore;
    let things = {};
    //return the main promise 
    return root.collection('groups').get().then((snapshot) => {

        let sortedGroups = [];

        snapshot.forEach((docSnapshot) => {
            let {results} = docSnapshot.data();
            let iGroup = Number(docSnapshot.id);
            let size = Math.sqrt(results.length);
            let totals = [];
            for (let i = 0; i < size; i++) {
                let total = results.slice(i * 4, (i + 1) * 4).reduce((a, b) => a + b, 0);
                totals.push([total, i]);
            }

            let sortedGroup = totals.sort((a, b) => {
                let pointsDif = b[0] - a[0];
                if (pointsDif != 0) {
                    return pointsDif;
                }
                return a[1] - b[1]
            })
                .map(([_, i]) => i + (iGroup - 1) * 4);

            sortedGroups.push(sortedGroup)

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

        return root.collection('rankings').doc(CONSTANTS.SQUASH_RANKING).get()
    }).then((docSnapshot) => {
        let {ranking} = docSnapshot.data();


        let newRanking = things.sortedRanking.map((playerPos) => {
            return ranking[playerPos]
        });

        root.collection("rankings").doc(CONSTANTS.SQUASH_RANKING).set({ranking: newRanking})
    }).catch((reason) => {
        console.log(reason)
    })

});

exports.updateRankingHttp = functions.https.onRequest((req, res) => {

    const firestore = admin.firestore();
    let things = {};

    //return the main promise
    return firestore.collection('groups').get().then((snapshot) => {

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
                if (pointsDif != 0) {
                    return pointsDif;
                }
                return a[1] - b[1]
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

        return firestore.collection('rankings').doc(CONSTANTS.SQUASH_RANKING).get()
    }).then((docSnapshot) => {
        let {ranking} = docSnapshot.data();


        let newRanking = things.sortedRanking.map((playerPos) => {
            return ranking[playerPos]
        });

        firestore.collection("rankings").doc(CONSTANTS.SQUASH_RANKING).set({ranking: newRanking});
    }).catch((reason) => {
        console.log(reason);
    });
});

exports.updateGroups = functions.https.onRequest((req, res) => {

    let log = {
        ranking: {},
        playerData: {},
        results : {}
    };
    const firestore = admin.firestore();
    firestore.collection(CONSTANTS.RANKINGS).doc(CONSTANTS.SQUASH_RANKING).get().then(playerSnapshot => {
        let {ranking} = playerSnapshot.data();
        let totalGroups = Math.trunc(ranking.length / CONSTANTS.GROUP_SIZE);
        let orphans = ranking.length % CONSTANTS.GROUP_SIZE;
        // generate group for orphan people
        if (orphans > 0) {
            totalGroups++;
        }

        //Clear all old groups
        firestore.collection(CONSTANTS.GROUPS).get().then((snapshot) => {
            snapshot.forEach((groupDoc) => {
                groupDoc.ref.delete();
            });
        });
        // Update player Rankings
        firestore.collection(CONSTANTS.PLAYERS).get().then((snapshot) => {
            snapshot.forEach((playerDoc) => {
                let playerName = playerDoc.data().playerName;
                let position = ranking.indexOf(playerName);
                let groupPosition = Math.trunc(position/4)+1;
                console.log(playerDoc.id + '['+playerName+']['+position+']['+groupPosition+']=>' + JSON.stringify(playerDoc.data()));
                log.playerData[playerName] = playerDoc.data();
                log.ranking[playerName] = position;
                playerDoc.ref.set({
                    currentGroup: groupPosition
                },{merge: true});
            })
        });

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

        for (let i = 1; i < (totalGroups + 1); i++) {
            if (i + 1 === totalGroups && orphans > 0) {
                log.results[i] = getEmptyGroup(orphans);
            } else {
                log.results[i] = getEmptyGroup(CONSTANTS.GROUP_SIZE);
            }
            let groupRef = firestore.collection(CONSTANTS.GROUPS).doc(String(i));
            groupRef.set(log.results[i]);
        }
        // res.write(JSON.stringify(logGroups));
        res.write(JSON.stringify(log));
    });
});