import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import MatchSummary from "../../components/match/MatchSummary";

import _ from "lodash"
import { translate } from "../../assets/translations/translationManager"
import { connect } from 'react-redux'
import { totalSize } from '../../api/Dimensions';
import { selectCurrentCompetition } from '../../redux/reducers';

class MatchesDisplay extends React.Component {

    constructor(props) {
        super(props);

    }

    filterMatches = (matches) => {

        return matches
    }

    renderSection = (matches, sectionTitle) => {

        return (
            <View>
                <Text style={styles.sectionTitle}>{sectionTitle}</Text>
                {matches.map(match => <MatchSummary match={match} editable={false}/>)}
            </View>
        )
    }
    
    render() {

        //Group matches according to whether the user is in them or not
        
        let grouped = _.groupBy(
            this.props.matches,
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

            <ScrollView>
                {keyOrder.map(key => grouped[key] ? this.renderSection(grouped[key], sectionTitles[key]) : null)}
            </ScrollView>
    
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