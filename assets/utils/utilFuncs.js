import SETTINGS from "../../constants/Settings";

//Recieves the points a player has for a certain match and returns the points of its rival.
exports.oppositePoints = (points) => {
    let pairedPoints = SETTINGS.pointsScheme.map(({points}) => points);
    let oppPoints = ""

    pairedPoints.forEach((pair) => {
        let ind = pair.indexOf(points);
        if (ind >= 0) {
            if (ind === 0) {
                oppPoints = pair[1];
            } else {
                oppPoints = pair[0];
            }
        }
    });
    return oppPoints;
};

//Returns an array with the total points of each player in the group
exports.getTotals = (groupResults, groupSize) => {
    let totals = [];

    let resCopy = groupResults.slice()
    while (resCopy.length) {
        totals.push(resCopy.splice(0, groupSize).reduce((a, b) => {
            return a + b;
        }));
    }
    
    return totals;
};

//Returns the indexes of the player with most and with less points
exports.iLeaderLoser = (totals) => {

    const maxTotals = Math.max.apply(Math, totals);
    const minTotals = Math.min.apply(Math, totals);
    let leader = totals.indexOf(maxTotals);
    let loser = totals.lastIndexOf(minTotals);

    return [leader, loser];
}

//Function that recieves the points in a match and converts them to sets
exports.pointsToSets = (point) => {
    
    SETTINGS.pointsScheme.forEach( ({result, points}) => {

        let i = points.indexOf(point)
        if ( i >= 0) {
            return result[i]
        }
    })

}

//Function that recieves the result in sets and converts it to points.
exports.setsToPoints = (setsInp) => {

    let sets = JSON.stringify(setsInp);

    SETTINGS.pointsScheme.forEach(({result, points}) => {

        if (sets === JSON.stringify(result)) {

            return points

        } else if (sets === JSON.stringify(result.reverse())) {

            return points.reverse()
            
        }

    })
    
}

//Checks whether the result submitted is possible
exports.resultIsCorrect = (testResult) => {

    testResult = JSON.stringify(testResult)

    SETTINGS.pointsScheme.forEach(({result}) => {

        if ( JSON.stringify(result) ===  testResult || JSON.stringify(result.reverse()) === testResult) {
            return true
        }

    })

    return false

}

//Converts a timestamp (ms) into a readable date (dd/mm/yyyy)
exports.convertDate = (inputFormat) => {
    function pad(s) {
        return (s < 10) ? '0' + s : s;
    };
    let d = new Date(Number(inputFormat));
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

//Stores data so that we don't need to retrieve it from the database every time 
exports.storeDataAsync = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        // Error saving data
    }
}

//Retrieves the data that has been previously stored
exports.retrieveDataAsync = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            // Our data is fetched successfully
            return value
        }
    } catch (error) {
        // Error retrieving data
    }
}