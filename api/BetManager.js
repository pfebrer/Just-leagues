const BetTypes = {

    GROUP_BET: "groupbet",
    PLAYERPOINTS_BET: "playerpoints"

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