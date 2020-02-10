import React from 'react';
import {StyleSheet, SectionList, View, Text} from 'react-native';
import MatchSummary from "../../components/match/MatchSummary";

import _ from "lodash"
import { translate } from "../../assets/translations/translationManager"
import { connect } from 'react-redux'
import { sortMatchesByDate } from '../../assets/utils/utilFuncs'
import { selectCurrentCompetition } from '../../redux/reducers';

class MatchesDisplay extends React.Component {

    constructor(props) {
        super(props);

    }

    filterMatches = (matches) => {

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
            sortMatchesByDate(this.filterMatches(this.props.matches)),
            (match) => {
                if (match.playersIDs.indexOf(this.props.currentUser.id) != -1) {
                    return "own"
                } else {
                    return match.context.group.name
                }
            }
        )

        let groupKeys = Object.keys(grouped).filter( key => key != "own")

        let sectionTitles = {
            "own": translate("tabs.your matches"),
            ...groupKeys.reduce((sections, key) =>{sections[key] = translate("vocabulary.group") + " " + key; return sections}, {})
        }

        let keyOrder = ["own", ...groupKeys.sort( key => Number(key))]

        return (

            <SectionList
                renderItem={({item: match}) => <MatchSummary key={match.id} match={match} navigation={this.props.navigation}/>}
                renderSectionHeader={({section}) => <Text style={styles.sectionTitle}>{sectionTitles[section.key]}</Text>}
                sections={keyOrder.reduce((sections, key) => { if (grouped[key]) sections.push({data: grouped[key], key}); return sections} , [])}
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

    sectionTitle: {
        textAlign: "center",
        fontFamily: "bold"
    }

});