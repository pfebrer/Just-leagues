import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { iLeaderLoser, transpose, reshape, deepClone } from "../../assets/utils/utilFuncs"
import { translate } from '../../assets/translations/translationManager';
import { w, h, totalSize } from '../../api/Dimensions';
import { ScrollView } from 'react-native-gesture-handler';

//Redux stuff
import { connect } from 'react-redux'

class Table extends Component {

    goToUserProfile = (uid) => {
        console.warn(this.props.IDsAndNames[uid])
    }

    renderTable = (ranks, players, playersIDs, scores, totals) => {

        let [iLeader, iLoser] = iLeaderLoser(totals)
        let nPlayers = players.length

        return [

            <Column 
                key="ranks" header="" data={ranks}
                style={{...styles.column, ...styles.ranksCol}} 
                iLeader={iLeader} iLoser={iLoser}/>,

            <Column
                key="players"
                header={translate("auth.name")} data={players}
                style={{...styles.column, ...styles.playersCol}}
                iLeader={iLeader} iLoser={iLoser}
                touchable
                onPress={this.goToUserProfile}
                onPressData={playersIDs}/>,

            <ScoresScroll
                key="scores"
                headers={ranks}
                data={scores}
                nPlayers={nPlayers}
                style={styles.scoresScroll}
                iLeader={iLeader} iLoser={iLoser}
                maxVisibleRows={this.props.maxVisibleRows}
                currentUser={this.props.currentUser}/>,

            <Column 
                key="totals" 
                header={translate("vocabulary.total")} data={totals} 
                style={{...styles.column, ...styles.totalsCol}}
                iLeader={iLeader}
                iLoser={iLoser}/>,
        ]
    }

    render() {

        var ranks, players, playersIDs, scores, totals;

        if (this.props.groupResults) {

            const {groupResults} = this.props

            ranks = groupResults.map(resultsRow => resultsRow.rank)
            players = groupResults.map(resultsRow => resultsRow.name)
            totals = groupResults.map(resultsRow => resultsRow.total)
            scores = groupResults.map(resultsRow => resultsRow.scores)

        } else {
            var {playersIDs, scores} = deepClone(this.props)

            if( !(playersIDs.length > 0 && scores.length > 0) ) { return null }

            players = playersIDs.map( uid => this.props.IDsAndNames[uid] || "Sense nom" )

            ranks  = this.props.ranks || Array.from( new Array(players.length), (x,i) => i + 1)

            scores = reshape(scores, players.length)

            totals = this.props.totals || scores.map( playerScores => playerScores.reduce((a, b) => a + b, 0) )
        }

        scores = transpose(scores)
        
        return (
            <View style={this.props.containerStyles}>
                <View style={{...styles.tableContainer, ...this.props.tableStyles}}>
                    {this.renderTable(ranks, players, playersIDs, scores, totals)}
                </View>
            </View>
            
        )
        
            
    }
}

class ScoresScroll extends Component {

    renderScoreCols = (headers, data, nVisibleRows) => {
        return headers.map( (header, iCol) => {
            return <Column
                    key={iCol}
                    header={header}
                    data={data[iCol]} style={{...styles.column, width: 100/nVisibleRows + "%" }}
                    iLeader={this.props.iLeader} iLoser={this.props.iLoser}
                    touchable iScoresCol={iCol}/>
        } )
    }

    render() {

        let nVisibleRows = Math.min( 
            this.props.maxVisibleRows || this.props.currentUser.settings["Competition display"].groupMaxVisibleCols, 
            this.props.nPlayers
        )

        let contentContainerStyle = {
            width: this.props.nPlayers >= nVisibleRows ? this.props.nPlayers*100/nVisibleRows +"%" : "100%"
        }

        return (

            <View style={{...this.props.style, flex: Math.min(8,nVisibleRows*2)}}>
                <ScrollView style={{flex: 1}} horizontal={true} nestedScrollEnabled contentContainerStyle={contentContainerStyle}>
                    {this.renderScoreCols(this.props.headers, this.props.data, this.props.nPlayers, nVisibleRows)}
                </ScrollView>
            </View>
            
        )
    }
}

class Column extends Component{

    renderHeader = (header) => {

        return <View style={styles.tableCell}>
                    <Text style={styles.tableText}>{header}</Text>
                </View>
    }

    renderData = (data, iLeader, iLoser) => {
        return data.map( (data, iRow, arr) => {

            let addCellStyles = iRow == iLeader ? styles.leaderCell : iRow == iLoser ? styles.loserCell : {}

            let cellStyles = {
                ...styles.tableCell,
                ...addCellStyles
            }

            if (iRow == arr.length - 1){ cellStyles = {...cellStyles, ...styles.lastRowCell} };

            let addTextStyles = iRow == iLeader ? styles.leaderText : iRow == iLoser ? styles.loserText : {}

            let textStyles = {
                ...styles.tableText,
                ...addTextStyles
            }

            if ( this.props.iScoresCol == iRow || !this.props.touchable){

                addCellStyles = this.props.iScoresCol == iRow ? styles.samePlayerCell : {}

                cellStyles = { ...cellStyles, ...addCellStyles}

                return (
                    <View
                        key={iRow}
                        style={cellStyles} 
                        onPress={() => {}}>
                        <Text style={textStyles}>{data}</Text>
                    </View>

                )
            } else {

                return (
                    <TouchableOpacity
                        key={iRow}
                        style={cellStyles} 
                        onPress={() => {this.props.onPress(this.props.onPressData[iRow])}}>
                        <Text style={textStyles}>{data}</Text>
                    </TouchableOpacity>
                )

            }   

            
        })
    }

    render() {
        
        return (

            <View style={this.props.style}>
                {this.renderHeader(this.props.header)}
                {this.renderData(this.props.data, this.props.iLeader, this.props.iLoser)}
            </View>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser || null,
    IDsAndNames: state.IDsAndNames
})

export default connect(mapStateToProps)(Table);

const styles = StyleSheet.create({

    tableContainer: {
        flexDirection: "row",
        borderRadius: 3,
        borderColor: "black",
        borderWidth: 1,
        overflow: "hidden",
        flex:1,
        width: "100%",
        elevation: 5,
        backgroundColor: "white"
    },

    column: {
        borderRightWidth: 1
    },

    ranksCol: {
        flex: 1.5
    },

    playersCol: {
        flex: 10
    },

    scoresScroll: {
        flexDirection: "row",
        flex: 8,
    },

    scoresCol: {
        width: "20%",
    },

    totalsCol: {
        flex: 3,
        borderRightWidth: 0
    },

    tableCell: {
        justifyContent: "center",
        alignItems: "center",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        height: h(4)
    },

    samePlayerCell: {
        backgroundColor: "lightgray"
    },

    leaderCell: {
        backgroundColor: "#c6e17b",
    },

    loserCell: {
        backgroundColor: "#e1947b"
    },

    lastRowCell: {
        borderBottomWidth: 0,
    },

    tableText: {
        color: "black",
        fontSize: totalSize(1.6)
    },

    leaderText: {
        fontFamily: "bold",
        color: "#2d652b"
    },

    loserText: {
        fontFamily: "bold",
        color: "darkred"
    },

    

});