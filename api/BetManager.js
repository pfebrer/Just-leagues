const _ = require("lodash")

const BetTypes = {

    //GROUPS
    GROUP_BET: "groupbet",
    PLAYERPOINTS_BET: "playerpoints",

    //MATCHES
    MATCHWINNER_BET:"matchwinner",
    MATCHRESULT_BET:"matchresult",
    MATCHGAMESTOTAL_BET: "matchgamestotal"

}

const settleBet = (bet, extraInfo) => {

    let result;
    let points;

    if (bet.type == BetTypes.GROUP_BET){

        const {group, competition} = extraInfo

        const sortedIs = competition.getSortedIndices(group)

        result = { [1]: group.playersIDs[sortedIs[0]] , [-1]: group.playersIDs[sortedIs.slice(-1)[0]] }

        const guessedWinner = bet.bet[1] == result[1]
        const guessedLoser = bet.bet[-1] == result[-1]
        
        points = guessedWinner && guessedLoser ? 3 : guessedWinner || guessedLoser ? 1 : -2

    } else if (bet.type == BetTypes.PLAYERPOINTS_BET){

        const {group, competition} = extraInfo
        const uid = Object.keys(bet.bet)[0]

        const totals = competition.getGroupTotals(group)
        
        result = totals[group.playersIDs.indexOf(uid)]

        const guessed = bet.bet[uid] == result
        
        points = guessed ? 5 : -1

    } else if (bet.type == BetTypes.MATCHWINNER_BET){
        
        const {match} = extraInfo
        
        result = match.result[0] > match.result[1] ? 1 : match.result[0] > match.result[1] ? "X" : 2

        const guessed = bet.bet == result
        
        points = guessed ? 1 : result == "X" ? 0 : -1

    } else if (bet.type == BetTypes.MATCHRESULT_BET){
        
        const {match} = extraInfo
        
        result = match.result

        const guessed = _.isEqual(result, bet.bet)
        
        points = guessed ? 3 : -1

    } else if (bet.type == BetTypes.MATCHGAMESTOTAL_BET){
        
        const {match} = extraInfo
        
        result = match.result.reduce((total,val) => total+val, 0)

        const guessed = result == bet.bet
        
        points = guessed ? 1 : -1

    } else {
        return false
    }

    //Build the settled bet to return it

    return {
        ...bet,
        result,
        points,
        settled: true
    }

}

export { settleBet, BetTypes}