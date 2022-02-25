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