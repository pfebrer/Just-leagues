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

//This function gets the outcome of a bet
const outcomeStringToValue = (bet, searchString) => (_.get({lose: 0, null: 1, ...bet.odds}, searchString) - 1) * bet.quantity

const getBetStatus = (bet, extraInfo) => {

    let {result, outcome} = betHelpers[bet.type].settle(bet, extraInfo)
    
    return {result, outcome: outcomeStringToValue(bet, outcome)}

}

const betHelpers = {

    [BetTypes.GROUP_BET]: {

        odds: () => ({win: 4, partialWin: 2}),
        settle: (bet, {group, competition}) => {

            const sortedIs = competition.getSortedIndices(group)

            let result = { [1]: group.playersIDs[sortedIs[0]] , [-1]: group.playersIDs[sortedIs.slice(-1)[0]] }

            const guessedWinner = bet.bet[1] == result[1]
            const guessedLoser = bet.bet[-1] == result[-1]

            let outcome = guessedWinner && guessedLoser ? 'win' : guessedWinner || guessedLoser ? 'partialWin' : 'lose'

            return {result, outcome}
        }
        
    },
        
    [BetTypes.PLAYERPOINTS_BET]: {
        
        odds: () =>({win: 9}),
        settle: (bet, {group, competition}) => {

            const uid = Object.keys(bet.bet)[0]

            const totals = competition.getGroupTotals(group)
            
            let result = totals[group.playersIDs.indexOf(uid)]

            const guessed = bet.bet[uid] == result
            
            let outcome = guessed ? 'win' : 'lose'

            return {result, outcome}
        }

    },

    [BetTypes.MATCHWINNER_BET]: {

        odds: () => ({win: 2}),
        settle: (bet, {match}) => {

            let result = match.result[0] > match.result[1] ? 1 : match.result[0] > match.result[1] ? "X" : 2

            const guessed = bet.bet == result
            
            let outcome = guessed ? 'win' : result == "X" ? 'null' : 'lose'

            return {result, outcome}
        }
        
    },

    [BetTypes.MATCHRESULT_BET]: {

        odds: () => ({win: 3}),
        settle: (bet, {match}) => {

            let result = match.result

            const guessed = _.isEqual(result, bet.bet)
            
            let outcome = guessed ? 'win': 'lose'

            return {result, outcome}
        }
        
    },

    [BetTypes.MATCHGAMESTOTAL_BET]: {

        odds: () => ({win: 2}),
        settle: (bet, {match}) => {

            let result = match.result.reduce((total,val) => total+val, 0)

            const guessed = result == bet.bet
        
            let outcome = guessed ? 'win' : 'lose'

            return {result, outcome}
        }
    },


}

const settleBet = (bet, extraInfo) => {

    const {result, outcome} = getBetStatus(bet, extraInfo)

    //Build the settled bet to return it

    return {
        ...bet,
        result,
        outcome,
        settled: true
    }

}

export { settleBet, BetTypes, betHelpers, getBetStatus}