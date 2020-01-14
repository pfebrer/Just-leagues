import React from 'react';
import {StyleSheet, ScrollView, View, Text} from 'react-native';
import { List, ListItem} from "native-base"

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

    playedMatchesByUser = (matches) => {

        return matches.reduce((playedMatches, match) => {
            
            match.playersIDs.forEach( uid => {

                if ( Object.keys(this.props.relevantUsers).indexOf(uid) > -1){
                    if (playedMatches[uid]){
                        playedMatches[uid] ++
                    } else {
                        playedMatches[uid] = 1
                    }
                }
            })
            
            return playedMatches
        }, {})

        //O fer groupby playersIDs[0] i juntarho amb playersIDs[1], pot ser massa gran amb més jugadors

    }
    
    render() {

        //Group matches according to whether the user is in them or not
        
        let playedMatches = this.playedMatchesByUser(this.props.matches)

        let sortedByPlayed = Object.keys(playedMatches).sort(function(a,b){return playedMatches[b]-playedMatches[a]})

        let scoreBoard = sortedByPlayed.map( uid => {

            return (
                <ListItem>
                    <Text>{this.props.competition.renderName(this.props.relevantUsers[uid].names) + "  " + playedMatches[uid]}</Text>
                </ListItem>
            )
        })

        return (

            <ScrollView>
                <View>
                    <Text style={{fontFamily: "bold", textAlign: "center"}}> Partits jugats </Text>
                    <List>
                        {scoreBoard}
                    </List>
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

export default connect(mapStateToProps)(MatchesDisplay);

const styles = StyleSheet.create({

    sectionTitle: {
        textAlign: "center",
        fontFamily: "bold"
    }

});