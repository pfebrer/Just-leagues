import React from 'react';
import {StyleSheet, ScrollView, View, TouchableOpacity} from 'react-native';
import { List, ListItem, Right, Left, Text} from "native-base"

import _ from "lodash"
import { connect } from 'react-redux'
import { totalSize } from '../../api/Dimensions';
import { selectCurrentCompetition } from '../../redux/reducers';

import Card from "./Card"

class Leaderboard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            nTop: 5,
            showAll: false
        }

    }

    getLeaderboardBody = (sortedKeys) => {

        let topRankedKeys = this.state.showAll ? sortedKeys : sortedKeys.slice(0,this.state.nTop)

        if (topRankedKeys.indexOf(this.props.currentUser.id) == -1 && this.props.competition.playersIDs.indexOf(this.props.currentUser.id) != -1){
            topRankedKeys.push(this.props.currentUser.id)
        }

        return topRankedKeys.map( (uid, i, arr) =>{

            let customStyles = i == 0 ? styles.leaderCell : i < 3 ? styles.podiumCell : uid == this.props.currentUser.id ? i == this.state.nTop && ! this.state.showAll ? styles.ownCellOutside : styles.ownCell : null 
            let customTextStyles = i == 0 ? styles.leaderText : i < 3 ? styles.podiumText : uid == this.props.currentUser.id ? styles.ownText : null
            let preText = !this.state.showAll && i == this.state.nTop ? (sortedKeys.indexOf(this.props.currentUser.id) + 1) + ". " : (i+1) + ". "

            return (
                <ListItem style={{...styles.leaderboardCell, ...customStyles}} key={i} noIndent noBorder={i == arr.length - 1}>
                    <Left>
                        <Text style={{...styles.userText, ...customTextStyles}}>
                            {preText + this.props.competition.renderName(this.props.relevantUsers, uid)}
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
                cardContainerStyles={{paddingTop: 20, paddingBottom: 0, paddingHorizontal: 0, overflow: "hidden", borderRadius: 5, ...this.props.style}}
                headerStyles={{paddingBottom: 0, height : 0}}>
                <TouchableOpacity onPress={() => this.setState({showAll: !this.state.showAll})}>
                    <Text style={styles.titleText}>{this.props.title} </Text>
                </TouchableOpacity>
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
        marginHorizontal:5,
        borderRadius: 20,
        marginVertical: 5,
        borderBottomWidth: 0
    },

    leaderText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    podiumCell: {
        backgroundColor: "#E6F1C7",
        marginHorizontal:5,
        borderRadius: 20,
        marginVertical: 5,
        borderBottomWidth: 0
    },

    podiumText: {
        fontFamily: "bold",
        color: "#7CB979"
    },

    ownCell: {
        backgroundColor: "#e8e8e8"
    },

    ownCellOutside: {
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