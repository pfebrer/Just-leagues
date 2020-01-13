import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { sortPlayerIndices, setsToPoints , deepClone} from "../../assets/utils/utilFuncs"
import { translate } from '../../assets/translations/translationManager';
import { w, h, totalSize } from '../../api/Dimensions';
import { ScrollView } from 'react-native-gesture-handler';

import Firebase from "../../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"

import _ from "lodash"

class Table extends Component {

    constructor(props){
        super(props)

        this.state = {
            scores: this.generateEmptyScores()
        }
    }

    generateEmptyScores = () => {
       
        return  _.chunk(Array(this.props.playersIDs.length**2).fill(false), this.props.playersIDs.length);
    }

    componentDidMount() {

        let {gymID, id: compID} = this.props.competition

        this.matchesListener = Firebase.matchesRef(gymID, compID).where("context.group.id", "==", this.props.id).onSnapshot(


            matches => {

                let newScores = _.cloneDeep(this.state.scores)
                
                matches.forEach(

                    match => {

                        let {result, playersIDs} = match.data()

                        let points = setsToPoints(result, this.props.competition.settings.groups.pointsScheme)

                        let iPlayers = playersIDs.map( uid => this.props.playersIDs.indexOf(uid))

                        newScores[iPlayers[0]][iPlayers[1]] = points[0]
                        newScores[iPlayers[1]][iPlayers[0]] = points[1]

                    }
                )

                this.setState({scores: newScores})
            }
        )

    }

    componentWillUnmount() {
        //Unsubscribe from listeners
        this.matchesListener()
    }

    goToUserProfile = ({iRow}) => {

        let uid = this.props.playersIDs[iRow]

        if (uid == this.props.currentUser.id){
            console.warn("Go to profile: ", this.props.competition.renderName(this.props.relevantUsers[uid].names))
        } else {
            console.warn("Go to stats: ", this.props.competition.renderName(this.props.relevantUsers[uid].names))
        }
        
    }

    cellPositionToMatchIndex = (iRow, iCol, nPlayers) => {
        
        let [i, j] = [iRow, iCol].sort()

        //This is the relation that I found between position and match index
        return i*(nPlayers - 1 - (i+1)/2 ) + j - 1

    }

    goToMatch = ({iRow, iCol, data}) => {

        let iMatch = this.cellPositionToMatchIndex(iRow, iCol, this.props.playersIDs.length)

        this.props.setCurrentMatch({
            context: {
                matchID: this.props.matchesIDs[iMatch],
                group: {
                    id: this.props.id,
                    name: this.props.name
                },
                competition: this.props.competition,
                pending: data ? false : true
            },
        })

        this.props.navigation.navigate("MatchScreen")

    }

    renderTable = (ranks, players, scores, totals) => {

        let sorted = this.props.competition.getSortedIndices()

        let sortedPlayerIndices = sortPlayerIndices(players, scores, totals, this.props.competition.settings.groups.untyingCriteria)
        let nPlayers = players.length
        
        const iLeader = sortedPlayerIndices[0], iLoser = _.last(sortedPlayerIndices)

        return [

            <Column 
                key="ranks" header="" data={ranks}
                style={{...styles.column, ...styles.ranksCol}}
                sortedPlayerIndices={sortedPlayerIndices}
                iLeader={iLeader} iLoser={iLoser}/>,

            <Column
                key="players"
                header={translate("auth.name")} data={players}
                style={{...styles.column, ...styles.playersCol}}
                iLeader={iLeader} iLoser={iLoser}
                sortedPlayerIndices={sortedPlayerIndices}
                touchable
                onPress={this.goToUserProfile}/>,

            <ScoresScroll
                key="scores"
                headers={ranks}
                scores={scores}
                nPlayers={nPlayers}
                style={styles.scoresScroll}
                sortedPlayerIndices={sortedPlayerIndices}
                iLeader={iLeader} iLoser={iLoser}
                maxVisibleRows={this.props.maxVisibleRows}
                currentUser={this.props.currentUser}
                onPress={this.goToMatch}
                onPressData={scores}/>,

            <Column 
                key="totals" 
                header={translate("vocabulary.total")} data={totals} 
                style={{...styles.column, ...styles.totalsCol}}
                sortedPlayerIndices={sortedPlayerIndices}
                iLeader={iLeader}
                iLoser={iLoser}/>,
        ]
    }

    render() {

        let {playersIDs} = deepClone(this.props)

        if( !playersIDs.length > 0 ) { return null }

        let players = playersIDs.map( uid => this.props.competition.renderName(this.props.relevantUsers[uid].names) )

        let ranks = playersIDs.map( uid => {
            return this.props.competition.playersIDs.indexOf(uid) + 1
        })

        let totals = this.props.totals || this.state.scores.map( playerScores => playerScores.reduce((a, b) => a + b, 0) )

        return (
            <View style={this.props.containerStyles}>
                <View style={{...styles.tableContainer, ...this.props.tableStyles}}>
                    {this.renderTable(ranks, players, this.state.scores, totals)}
                </View>
            </View>
            
        )
        
            
    }
}

class ScoresScroll extends Component {

    renderScoreCols = (headers, scores, nVisibleRows) => {
        return headers.map( (header, iCol) => {

            let colScores = scores.map( rowScores => rowScores[iCol])
            
            return <Column
                    key={iCol}
                    header={header}
                    data={colScores} style={{...styles.column, width: 100/nVisibleRows + "%" }}
                    sortedPlayerIndices={this.props.sortedPlayerIndices}
                    iLeader={this.props.iLeader} iLoser={this.props.iLoser}
                    touchable iScoresCol={iCol}
                    onPress={this.props.onPress}/>
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
                    {this.renderScoreCols(this.props.headers, this.props.scores, this.props.nPlayers, nVisibleRows)}
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

            //Decide the styles of the cell depending on the position of the player
            let addCellStyles = {}; let addTextStyles = {}
            if (iRow == this.props.sortedPlayerIndices[0]) {
                //Is the leader
                addCellStyles = styles.leaderCell
                addTextStyles = styles.leaderText
            } else if (false) {
                //Is a player promoting up

            } else if (false) {
                //Is a player promoting down

            } else if (iRow == _.last(this.props.sortedPlayerIndices)){
                //Is the bottom player
                addCellStyles = styles.loserCell
                addTextStyles = styles.loserText
            }

            let cellStyles = {
                ...styles.tableCell,
                ...addCellStyles
            }

            if (iRow == arr.length - 1){ cellStyles = {...cellStyles, ...styles.lastRowCell} };

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

                let cellInfo = {iRow, iCol: this.props.iScoresCol, data}

                return (
                    <TouchableOpacity
                        key={iRow}
                        style={cellStyles} 
                        onPress={() => {this.props.onPress(cellInfo)}}>
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
    relevantUsers: state.relevantUsers,
})

const mapDispatchToProps = {
    setCurrentMatch
}

export default connect(mapStateToProps, mapDispatchToProps)(Table);

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
        borderRightWidth: 1,
        overflow: "hidden"
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
        borderRightWidth: 0,
    },

    tableCell: {
        justifyContent: "center",
        alignItems: "center",
        borderBottomColor: "black",
        borderBottomWidth: 1,
        height: h(4),
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
        fontSize: totalSize(1.6),
        textAlign: "center"
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