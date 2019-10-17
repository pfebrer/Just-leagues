import SETTINGS from "../../constants/Settings";

//Recieves the points a player has for a certain match and returns the points of its rival.
exports.oppositePoints = (points) => {
    let pairedPoints = SETTINGS.pairedPoints;
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