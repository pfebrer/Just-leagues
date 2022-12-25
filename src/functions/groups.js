const { Collections, Subcollections, Documents} = require("./constants")
const _ = require("lodash")

//Function that recieves the result and converts it to points.
resultToPoints = (resultInp, pointsScheme) => {

    resultInp = _.cloneDeep(resultInp); pointsScheme = _.cloneDeep(pointsScheme);
    let convertedPoints;

    pointsScheme.forEach(({result, points}) => {

        if (_.isEqual(resultInp , result)) {

            convertedPoints = points

            return false

        } else if (_.isEqual(resultInp , result.slice().reverse())) {

            convertedPoints = points.reverse()
            return false
            
        }

    })

    return convertedPoints
    
}

getEmptyScores = (playersIDs) => _.chunk(Array(playersIDs.length**2).fill(false), playersIDs.length);

exports.updateGroupScores = (firestore, groupRef, groupData, callback = () => {}) => {

    let {id: groupID, playersIDs} = groupData

    let promises = [
        firestore.collectionGroup(Subcollections.MATCHES).where("context.group.id", "==", groupID).get(), //Gets the matches for that group
        groupRef.parent.parent.get(), //Gets the competition document
    ]

    return Promise.all(promises).then( ([matchesSnap, compSnap]) => {

        let scores = getEmptyScores(playersIDs)
        let { settings: compSettings } = compSnap.data()

        matchesSnap.forEach(match => {

            let {result, playersIDs:matchplayersIDs} = match.data()

            let points = resultToPoints(result, compSettings.groups.pointsScheme)

            let iPlayers = matchplayersIDs.map( uid => playersIDs.indexOf(uid))

            scores[iPlayers[0]][iPlayers[1]] = points[0]
            scores[iPlayers[1]][iPlayers[0]] = points[1]
        })
        

        groupRef.update({scores: _.flatten(scores)}).then(callback)
    })

    
}

exports.updateCompetitionStats =  (competitionRef, callback = () => {}) => {
    /* Given a reference to a competition, updates its stats.*/

    let promises = [
        competitionRef.collection(Subcollections.MATCHES).get(),
    ]

    return Promise.all(promises).then( ([matchesSnap]) => {

        const updatedLeaderboards = matchesSnap.docs.reduce((leaderboards, matchSnap) => {

            var match = matchSnap.data()
            
            match.playersIDs.forEach( (uid, i) => {

                //This is a no show match
                if (match.result.indexOf(-1) > -1 ) return 

                let nGames = match.result.reduce((a, b) => a + b, 0)
                let iWinner = match.result.indexOf(Math.max.apply(Math, match.result))

                if (leaderboards.playedMatches[uid]){
                    leaderboards.playedMatches[uid] ++
                    leaderboards.playedGames[uid] += nGames
                    leaderboards.wonMatches[uid] += i == iWinner ? 1 : 0
                    leaderboards.wonGames[uid] += match.result[i]
                    leaderboards.cleanSheets[uid] += i == iWinner && nGames == match.result[i] ? 1 : 0
                } else {
                    leaderboards.playedMatches[uid] = 1
                    leaderboards.playedGames[uid] = nGames
                    leaderboards.wonMatches[uid] = i == iWinner ? 1 : 0
                    leaderboards.wonGames[uid] = match.result[i]
                    leaderboards.cleanSheets[uid] = i == iWinner && nGames == match.result[i] ? 1 : 0
                }
            })
            
            return leaderboards
        }, {playedMatches: {}, playedGames: {}, wonMatches: {}, wonGames: {}, cleanSheets: {}})

        competitionRef.update({stats: updatedLeaderboards}).then(callback)
        
    })

    
} 