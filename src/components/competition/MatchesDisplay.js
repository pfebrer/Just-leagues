import React from 'react';
import {StyleSheet} from 'react-native';

import MatchSummary from "../../components/match/MatchSummary";
import ExpandableSectionList from '../UX/ExpandableSectionList'

import _ from "lodash"
import { isPlayed, isMatchScheduled } from '../betting/MatchBetting'
import { translate } from "../../assets/translations/translationWorkers"
import { connect } from 'react-redux'
import { sortMatchesByDate } from '../../assets/utils/utilFuncs'
import { selectCurrentCompetition } from '../../redux/reducers';

class MatchesDisplay extends React.Component {

    constructor(props) {
        super(props);

    }

    filterMatches = (matches) => {
        // Note that this scales very bad with the number of matches (find a solution!)
        // The solution is probably to include the periodNumber in matches, then we can
        // query the database for matches in the current period, there would be no need to
        // filter here.

        let groupIDs = this.props.competition.groups.map(group => group.id)

        return matches.filter(match => groupIDs.indexOf(match.context.group.id) != -1 )
    }

    /*renderSection = (matches, sectionTitle) => {

        return (
            <View>
                <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                {matches.map(match => )}
            </View>
        )
    }*/
    
    render() {

        //Group matches according to whether the user is in them or not
        
        let grouped = _.groupBy(
            sortMatchesByDate( this.filterMatches(this.props.matches)),
            (match) => {
                if (false){//match.playersIDs.indexOf(this.props.currentUser.id) != -1) {
                    return "own"
                } else if (isPlayed({match})){
                    return "played"
                } else {
                    return "not played"
                }
            }
        )

        grouped.played = grouped.played ? sortMatchesByDate(grouped.played, latestFirst = true) : undefined

        //let groupKeys = Object.keys(grouped).filter( key => key != "own")

        let sectionTitles = {
            "own": translate("tabs.your matches"),
            "played": translate("tabs.played matches"),
            "not played": translate("tabs.matches to play")

            //...groupKeys.reduce((sections, key) =>{sections[key] = translate("vocabulary.group") + " " + key; return sections}, {})
        }

        let keyOrder = ["own", "played", "not played"]//...groupKeys.sort( key => Number(key))]

        return (

            <ExpandableSectionList
                style={styles.containerView}
                renderItem={({item: match}) => <MatchSummary 
                    key={match.id} match={match} navigation={this.props.navigation}
                    style={styles.matchSummary}
                />}
                sectionTitles={sectionTitles}
                sectionHeaderStyle={styles.sectionHeader}
                sections={keyOrder.reduce((sections, key) => { if (grouped[key]) sections.push({data: grouped[key], key}); return sections} , [])}
                initiallyExpanded={["played"]}
            />
    
        )
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state)
})

export default connect(mapStateToProps)(MatchesDisplay);

const styles = StyleSheet.create({

    containerView: {
        backgroundColor: "white"
    },

    sectionHeader: {
        paddingHorizontal: 10
    },

    matchSummary: {
        borderBottomWidth: 1,
        borderTopWidth: 1,
        backgroundColor: "whitesmoke",
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginVertical: 2
    }
    

});