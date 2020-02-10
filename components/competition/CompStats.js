import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import { List, ListItem} from "native-base"

import _ from "lodash"
import { translate } from "../../assets/translations/translationManager"
import { round } from "../../assets/utils/utilFuncs"
import { connect } from 'react-redux'
import { totalSize } from '../../api/Dimensions';
import { selectCurrentCompetition } from '../../redux/reducers';

import Leaderboard from "./Leaderboard"

class CompetitionStats extends React.Component {

    constructor(props) {
        super(props);

    }

    filterMatches = (matches) => {

        return matches
    }

    playedMatchesByUser = (matches) => {

        return matches.reduce((leaderboards, match) => {
            
            match.playersIDs.forEach( (uid, i) => {

                //This is a no show match
                if (match.result.indexOf(-1) > -1 ) return 

                let nGames = match.result.reduce((a, b) => a + b, 0)
                let iWinner = match.result.indexOf(Math.max.apply(Math, match.result))

                if ( Object.keys(this.props.relevantUsers).indexOf(uid) > -1){
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
                }
            })
            
            return leaderboards
        }, {playedMatches: {}, playedGames: {}, wonMatches: {}, wonGames: {}, cleanSheets: {}})

    }
    
    render() {
        
        let leaderboards = this.playedMatchesByUser(this.props.matches)

        advancedStats = Object.keys(leaderboards.playedMatches).reduce((advancedStats, uid) => {

            advancedStats.gamesPerMatch[uid] = round(leaderboards.playedGames[uid] / leaderboards.playedMatches[uid], 2)
            advancedStats.percentMatchWins[uid] = round(leaderboards.wonMatches[uid] / leaderboards.playedMatches[uid] * 100, 1)
            advancedStats.percentGameWins[uid] = round(leaderboards.wonGames[uid] / leaderboards.playedGames[uid] * 100, 1)
            advancedStats.percentCleanSheets[uid] = round(leaderboards.cleanSheets[uid] / leaderboards.playedMatches[uid] * 100, 1)

            return advancedStats
        },{gamesPerMatch: {}, percentMatchWins: {}, percentGameWins: {}, percentCleanSheets: {}})

        return (

            <ScrollView>
                
                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.played matches")} items={leaderboards.playedMatches}/>
                    </View>

                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.won matches")} items={leaderboards.wonMatches}/>
                    </View>
                </View>

                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("tabs.betting")} items={this.props.competition.bettingPoints}/>
                    </View>
                </View>

                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.played games")} items={leaderboards.playedGames}/>
                    </View>

                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.won games")} items={leaderboards.wonGames}/>
                    </View>
                </View>

                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.won matches") + " (%)"} items={advancedStats.percentMatchWins}/>
                    </View>

                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.won games") + " (%)"} items={advancedStats.percentGameWins}/>
                    </View>
                </View>

                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.games per match")} items={advancedStats.gamesPerMatch}/>
                    </View>
                </View>

                <View style={{flexDirection: "row"}}>
                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.clean sheets")} items={leaderboards.cleanSheets}/>
                    </View>

                    <View style={{flex:1}}>
                        <Leaderboard title={translate("stats.clean sheets") + " (%)"} items={advancedStats.percentCleanSheets}/>
                    </View>
                </View>
                
            </ScrollView>
    
        )
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
    relevantUsers: state.relevantUsers,
})

export default connect(mapStateToProps)(CompetitionStats);

const styles = StyleSheet.create({

    leaderboardCard: {
        textAlign: "center",
        fontFamily: "bold"
    }

});