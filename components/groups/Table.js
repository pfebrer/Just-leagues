import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { getTotals, iLeaderLoser } from "../../assets/utils/utilFuncs"
import { translate } from '../../assets/translations/translationManager';
import { w } from '../../api/Dimensions';

export default class Table extends Component {

    renderScoreCells = (scores, iRow, rowTextStyles) => {

        
        return scores.map((score, i) => {

            if (i == iRow) {

                return (
                    <View
                        key={i}
                        style={{...styles.tableCell, ...styles.samePlayerCell}} >
                        <Text style={rowTextStyles}></Text>
                    </View>
                )

            } else {

                return (
                    <TouchableOpacity
                        key={i}
                        style={{...styles.tableCell, ...styles.pointsCell}} 
                        onPress={() => {this.props.goToMatchOverview(toSendOnPress)}}>
                        <Text style={rowTextStyles}>{score}</Text>
                    </TouchableOpacity>
                )

            }
            
        });
    }

    renderTable = (groupResults) => {

        const totals = groupResults.map(({total}) => total)
        let [iLeader, iLoser] = iLeaderLoser(totals)
        let nPlayers = groupResults.length
        let rowStyles, rowTextStyles;

        return groupResults.map( (resultsRow, iRow) => {

            if (iRow == iLoser){
                rowStyles = {...styles.tableRow, ...styles.lastPlayerRow}
                rowTextStyles = {...styles.tableText, ...styles.lastPlayerRowText}
            } else if (iRow == iLeader) {
                rowStyles = {...styles.tableRow, ...styles.leaderRow}
                rowTextStyles = {...styles.tableText, ...styles.leaderRowText}
            } else {
                rowStyles = {...styles.tableRow}
                rowTextStyles = {...styles.tableText}
            }

            if (iRow == nPlayers -1){
                rowStyles = {...rowStyles, ...styles.lastTableRow}
            }

            return (
                <View key={iRow} style={rowStyles}>
                    <View style={{...styles.tableCell, ...styles.positionCell}}>
                        <Text style={rowTextStyles}>{resultsRow.rank}</Text>
                    </View>
                    <TouchableOpacity 
                        style={{...styles.tableCell, ...styles.playerCell}} 
                        onPress={() => this.props.goToUserProfile(resultsRow.playerID)}>
                        <Text style={rowTextStyles}>{resultsRow.name}</Text>
                    </TouchableOpacity>
                    {this.renderScoreCells(resultsRow.scores, iRow, rowTextStyles)}
                    <View style={{...styles.tableCell, ...styles.totalCell}}>
                        <Text style={rowTextStyles}>{resultsRow.total}</Text>
                    </View>
                </View>
            )

        })
    }

    render() {
        const {iGroup, groupResults} = this.props

        const ranks = groupResults.map(resultsRow => resultsRow.rank)

        return (
            <View style={this.props.containerStyles}>
                <View style={{...styles.tableContainer, ...this.props.tableStyles}}>
                    <Header ranks={ranks}/>
                    {this.renderTable(groupResults)}
                </View>
            </View>
            
        )
        
            
    }
}

class Header extends Component {

    renderRankCells = (ranks) => {

        return ranks.map((rank, i) => {

            return <View
                        key={i}
                        style={{...styles.tableCell, ...styles.pointsCell}} >
                        <Text style={[styles.tableText]}>{rank}</Text>
                    </View>
        });

    }

    render(){

        return <View style={{...styles.tableRow}}>
                    <View style={{...styles.tableCell, ...styles.positionCell}}>
                        <Text style={{...styles.tableText}}></Text>
                    </View>
                    <TouchableOpacity 
                        style={{...styles.tableCell, ...styles.playerCell}} 
                        onPress={() => {this.props.handlePress(toSendOnPress)}}>
                        <Text style={{...styles.tableText}}>{translate("auth.name")}</Text>
                    </TouchableOpacity>
                    {this.renderRankCells(this.props.ranks)}
                    <View style={{...styles.tableCell, ...styles.totalCell}}>
                        <Text style={{...styles.tableText}}>{translate("vocabulary.total")}</Text>
                    </View>
                </View>
    }
}

const styles = StyleSheet.create({

    tableContainer: {
        borderRadius: 3,
        borderColor: "black",
        borderWidth: 1,
        overflow: "hidden",
        flex:1,
        width: "100%",
        elevation: 5,
        backgroundColor: "white"
    },

    tableTitle: {
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 10
    },

    tableTitleText: {
        color: "black",
        fontSize: 25
    },

    tableRow: {
        flexDirection: 'row',
        height: 30,
        flex: 1,
        borderBottomColor: "black",
        borderBottomWidth: 1,
    },

    lastTableRow: {
        borderBottomWidth: 0,
    },

    leaderRow: {
        backgroundColor: "#c6e17b",
    },

    leaderRowText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    lastPlayerRow: {
        backgroundColor: "#e1947b"
    },

    lastPlayerRowText: {
        fontFamily: "bold",
        color: "darkred"
    },
    tableCell: {
        justifyContent: "center",
        alignItems: "center",
        borderRightColor: "black",
        borderRightWidth: 1
    },
    tableText: {
        color: "black"
    },
    positionCell: {
        flex: 1.5,
    },
    playerCell: {
        flex: 10,
    },
    pointsCell: {
        flex: 2,
    },
    pointsText: {
        fontFamily: "bold",
        fontSize: 17,
    },
    samePlayerCell: {
        flex: 2,
        backgroundColor: "lightgray"
    },
    totalCell: {
        flex: 3,
        borderRightWidth: 0
    },
});