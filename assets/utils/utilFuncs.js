import _ from "lodash"
import { translate } from "../translations/translationManager";

//Get a deep copy of an object
exports.deepClone = (obj) => JSON.parse(JSON.stringify(obj));

//Transposes a 2D array
exports.transpose = m => m[0].map((x,i) => m.map(x => x[i]))

//Reshape a flat array to a 2d array by grouping in groups of n
exports.reshape = (arr, shape) => {
    let newArr = [];
    while(arr.length) newArr.push(arr.splice(0,shape));
    return newArr
}

//Groups an array of objects according to a given key
exports.groupBy= (key, arr) => arr.reduce(function (r, a) {
    r[a[key]] = r[a[key]] || [];
    r[a[key]].push(a);
    return r;
}, Object.create(null));

//Sort matches according to date
exports.sortMatchesByDate = (matches) => {

    function matchDate(match){

        if ( match.scheduled ){
            return match.scheduled.time
        } else {
            return match.due
        }

    }

    return matches.sort((a, b) => {
        return matchDate(a) - matchDate(b)
    })
}

getDefaultSettings = (settings) => {
    let defaultSettings = {}
    
                    
    Object.keys(settings).forEach( settingType => {

        defaultSettings[settingType] = {}

        Object.keys(settings[settingType]).forEach( setting => { 
            defaultSettings[settingType][setting] = settings[settingType][setting].default
        })
        
    })

    return defaultSettings
}

//Function that checks if some settings are not in the users profile and pushes them there.
exports.updateSettingsFields = (currentSettings, upToDateSettings) => {

    let defaultSettings = getDefaultSettings(upToDateSettings)
    let newSettings = currentSettings

    let changed = false

    if ( !currentSettings ){

        changed = true
        newSettings = defaultSettings
        
    } else {

        Object.keys(upToDateSettings).forEach( settingType => {

            if ( !currentSettings[settingType] ){
    
                newSettings[settingType] = defaultSettings[settingType]
    
                changed = true
    
            } else {
    
                Object.keys(upToDateSettings[settingType]).forEach( setting => {
    
                    if ( currentSettings[settingType][setting] == undefined){
    
                        newSettings[settingType][setting] = defaultSettings[settingType][setting]
    
                        changed = true
                        
                    }
    
                })
            }
            
        })

    }

    return  changed ? newSettings : false
}

//Function that returns how the name should be rendered given the competition settings
exports.renderName = (nameObject, nameDisplaySettings) => {

    if (!nameObject){
        return translate("errors.no name")
    } if (nameDisplaySettings == "Name Lastname"){
        return [ nameObject.firstName, nameObject.lastName].join(" ")
    } else if (nameDisplaySettings == "Lastname, Name" ) {
        return [ nameObject.lastName, nameObject.firstName].join(", ")
    } else if (nameDisplaySettings == "Name") {
        return nameObject.firstName
    } else if (nameDisplaySettings == "free"){
        return nameObject.aka
    }
}

//Function that gets the name of the competition or returns "unknown competition"
exports.getCompetitionName = (competition) => competition ? competition.name : translate("errors.unknown competition")

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
exports.sortPlayerIndices = (players, scores, totals, untyingCriteria) => {

    players = _.cloneDeep(players); scores = _.cloneDeep(scores); totals = _.cloneDeep(totals)

    let iPlayers = [ ...Array(players.length).keys() ];

    return iPlayers.sort((iP1,iP2) => groupBestToWorst(iP1, iP2, players, scores, totals, untyingCriteria))

}

groupBestToWorst= (iP1, iP2, players, scores, totals, untyingCriteria) => {

    const pointsDif = totals[iP2] - totals[iP1] ;

    //One player has more points than the other
    if (pointsDif !== 0) {
        return pointsDif;
    }

    //They are tied in points
    untyingCriteria.forEach( criterion => {

        if (criterion == "position") {

            return iP2 - iP1

        } else if (criterion == "directMatch") {

            //Match points of player 2 - match points of player 1
            const matchDiff = scores[iP2][iP1] - scores[iP1][iP2]

            if (matchDiff !== 0) {
                return matchDiff;
            }
        }
    })
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
exports.setsToPoints = (setsInp, pointsScheme) => {

    let sets = _.cloneDeep(setsInp);
    pointsScheme = _.cloneDeep(pointsScheme);
    let convertedPoints;

    pointsScheme.forEach(({result, points}) => {

        if (_.isEqual(sets , result)) {

            convertedPoints = points

            return false

        } else if (_.isEqual(sets , result.slice().reverse())) {

            convertedPoints = points.reverse()
            return false
            
        }

    })

    return convertedPoints
    
}

//Checks whether the result submitted is possible (checking against the pointsScheme settings for the competition)
exports.resultIsCorrect = (testResult, pointsScheme) => {

    testResult = _.cloneDeep(testResult)
    pointsScheme = _.cloneDeep(pointsScheme)
    let isCorrect = false

    pointsScheme.forEach(({result}) => {

        if ( _.isEqual(result, testResult) || _.isEqual( _.reverse(result), testResult) ) {

            isCorrect = true
            return false
        }

    })

    return isCorrect

}

//Converts a timestamp (ms) into a readable date (dd/mm/yyyy)
exports.convertDate = (inputFormat, outputFormat = "dd/mm/yyyy") => {
    function pad(s) {
        return (s < 10) ? '0' + s : s;
    };
    let d = new Date(Number(inputFormat));

    if (outputFormat == "dd/mm/yyyy"){
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
    } else if (outputFormat == "dd/mm"){
        return [pad(d.getDate()), pad(d.getMonth() + 1)].join('/');
    } else if (outputFormat == "dd/mm hh:mm"){
        return [pad(d.getDate()), pad(d.getMonth() + 1)].join('/') + " " +[pad(d.getHours()), pad(d.getMinutes())].join(":");
    } else if (outputFormat == "hh:mm"){
        return [pad(d.getHours()), pad(d.getMinutes())].join(":")
    }
    
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