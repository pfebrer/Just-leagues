import React from 'react';
import {StyleSheet, ScrollView, View} from 'react-native';
import { List, ListItem, Right, Left, Text} from "native-base"

import _ from "lodash"
import { connect } from 'react-redux'
import { totalSize } from '../../api/Dimensions';
import { selectCurrentCompetition } from '../../redux/reducers';

import Card from "../home/Card"

class Leaderboard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            nTop: 5
        }

    }

    getLeaderboardBody = (sortedKeys) => {

        let topRankedKeys = sortedKeys.slice(0,this.state.nTop)

        if (topRankedKeys.indexOf(this.props.currentUser.id) == -1 && this.props.competition.playersIDs.indexOf(this.props.currentUser.id) != -1){
            topRankedKeys.push(this.props.currentUser.id)
        }

        return topRankedKeys.map( (uid, i, arr) =>{

            let customStyles = i == 0 ? styles.leaderCell : i < 3 ? styles.podiumCell : uid == this.props.currentUser.id ? i == this.state.nTop ? styles.ownCell : null : null 
            let customTextStyles = i == 0 ? styles.leaderText : i < 3 ? styles.podiumText : uid == this.props.currentUser.id ? styles.ownText : null
            let preText = i == this.state.nTop ? + (sortedKeys.indexOf(this.props.currentUser.id) + 1) + ". " : ""

            return (
                <ListItem style={{...styles.leaderboardCell, ...customStyles}} key={i} noIndent noBorder={i == arr.length - 1}>
                    <Left>
                        <Text style={{...styles.userText, ...customTextStyles}}>
                            {preText + this.props.competition.renderName(this.props.relevantUsers[uid].names)}
                        </Text>
                    </Left>
                    <Right>
                        <Text style={{...styles.valueText, ...customTextStyles}}>{this.props.items[uid]}</Text>
                    </Right>
                </ListItem>
            )
        } )

    }

    sortKeysByValue = (itemsObject) => {
        
        return Object.keys(itemsObject).sort(function(a,b){return itemsObject[b]-itemsObject[a]})
    }
    //
    
    render() {

        let sortedKeys = this.sortKeysByValue(this.props.items)

        return (

            <Card
                cardContainerStyles={{paddingTop: 20, paddingBottom: 0, paddingHorizontal: 0}}
                headerStyles={{paddingBottom: 0, height : 0}}>
                <Text style={styles.titleText}>{this.props.title} </Text>
                <List style={styles.leaderboardBody}>
                    {this.getLeaderboardBody(sortedKeys)}
                </List>
            </Card>
    
        )
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
    relevantUsers: state.relevantUsers,
})

export default connect(mapStateToProps)(Leaderboard);

const styles = StyleSheet.create({

    titleText: {
        fontFamily: "bold",
        textAlign: "center",
    },

    leaderboardBody: {
        marginTop: 20,
    },

    leaderboardCell: {
        marginHorizontal: 0,
        paddingLeft: 10,
    },

    leaderCell: {
        backgroundColor: "#c6e17b",
    },

    leaderText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    podiumCell: {
        backgroundColor: "#E6F1C7"
    },

    podiumText: {
        fontFamily: "bold",
        color: "#7CB979"
    },

    ownCell: {
        borderTopWidth: 1,
        backgroundColor: "#e8e8e8"
    },

    ownText: {
        fontFamily: "bold",
        color: "black"
    },

    userText: {
        fontSize: totalSize(1.5)
    },

    valueText: {
        fontSize: totalSize(1.5)
    },

    sectionTitle: {
        textAlign: "center",
        fontFamily: "bold"
    }

});