import React from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import { Text, Icon } from "native-base"
import { Ionicons } from '@expo/vector-icons';

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

            const customStyles = i == 0 ? styles.leaderCell : i < 3 ? styles.podiumCell : uid == this.props.currentUser.id ? i == this.state.nTop && ! this.state.showAll ? styles.ownCellOutside : styles.ownCell : null 
            const customTextStyles = i == 0 ? styles.leaderText : i < 3 ? styles.podiumText : uid == this.props.currentUser.id ? styles.ownText : null
            const position = !this.state.showAll && i == this.state.nTop ? (sortedKeys.indexOf(this.props.currentUser.id) + 1) : (i+1)
            const preText = position + "."

            return (
                <View style={{...styles.leaderboardCell, ...customStyles}} key={i} >
                    <View style={styles.leaderboardPositionView}>
                        <Text style={{...styles.userText, ...customTextStyles}}>
                            {preText}
                        </Text>
                    </View>
                    <View style={styles.userView}>
                        <Text style={{...styles.userText, ...customTextStyles}}>
                            {this.props.competition.renderName(this.props.relevantUsers, uid)}
                        </Text>
                    </View>
                    <View>
                        <Text style={{...styles.valueText, ...customTextStyles}}>{this.props.items[uid]}</Text>
                    </View>
                </View>
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
                cardContainerStyles={{paddingTop: 0, paddingBottom: 0, paddingHorizontal: 0, overflow: "hidden", borderRadius: 2, ...this.props.style}}
                headerStyles={{paddingBottom: 0, height : 0}}>
                <Pressable onPress={() => this.setState({showAll: !this.state.showAll})} style={styles.pressableStyles}>
                    <Text style={styles.titleText}>{this.props.title} </Text>
                    <Icon as={Ionicons} name={this.state.showAll ? "remove-circle": "add-circle"} size={5} style={styles.titleIcon}/>
                </Pressable>
                <View style={styles.leaderboardBody}>
                    {this.getLeaderboardBody(sortedKeys)}
                </View>
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

    pressableStyles: {
        flexDirection: "row", 
        justifyContent: "space-between", 
        paddingLeft: 20, 
        paddingRight: 10,
        marginVertical: 20,
    },

    titleText: {
        fontFamily: "bold",
        textAlign: "center",
    },

    titleIcon: {
        width: "auto"
    },

    leaderboardCell: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 0,
        paddingLeft: 10,
        paddingRight: 10,
        paddingVertical: 5,
    },

    leaderboardPositionView: {
        paddingRight: 10,
    },

    userView: {
        flex: 1,
    },

    leaderCell: {
        backgroundColor: "#c6e17b",
        //marginHorizontal:5,
        //borderRadius: 2,
        marginVertical: 5,
        borderBottomWidth: 0
    },

    leaderText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    podiumCell: {
        backgroundColor: "#E6F1C7",
        //marginHorizontal:5,
        //borderRadius: 2,
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