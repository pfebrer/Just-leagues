import React, {Component} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import { iLeaderLoser, setsToPoints , deepClone } from "../../assets/utils/utilFuncs"
import { translate } from '../../assets/translations/translationManager';
import { w, h, totalSize } from '../../api/Dimensions';
import { ScrollView } from 'react-native-gesture-handler';

import Firebase from "../../api/Firebase"

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentMatch} from "../../redux/actions"

import _ from "lodash"
import { COMPSETTINGS } from '../../constants/Settings';

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

                        let points = setsToPoints(result, COMPSETTINGS.groups.pointsScheme)

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
            console.warn("Go to profile: ", this.props.IDsAndNames[uid])
        } else {
            console.warn("Go to stats: ", this.props.IDsAndNames[uid])
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
            playersIDs: [this.props.playersIDs[iRow], this.props.playersIDs[iCol]] })

        this.props.navigation.navigate("MatchScreen")

    }

    renderTable = (ranks, players, scores, totals) => {

        let [iLeader, iLoser] = iLeaderLoser(totals)
        let nPlayers = players.length

        //To render, it is better that we pass the scores transposed
        //In this way, map (or forEach) will return the scores column by column
        scores = _.zip.apply(_, _.cloneDeep(scores))

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
                onPress={this.goToUserProfile}/>,

            <ScoresScroll
                key="scores"
                headers={ranks}
                data={scores}
                nPlayers={nPlayers}
                style={styles.scoresScroll}
                iLeader={iLeader} iLoser={iLoser}
                maxVisibleRows={this.props.maxVisibleRows}
                currentUser={this.props.currentUser}
                onPress={this.goToMatch}
                onPressData={scores}/>,

            <Column 
                key="totals" 
                header={translate("vocabulary.total")} data={totals} 
                style={{...styles.column, ...styles.totalsCol}}
                iLeader={iLeader}
                iLoser={iLoser}/>,
        ]
    }

    render() {

        let {playersIDs} = deepClone(this.props)

        if( !playersIDs.length > 0 ) { return null }

        let players = playersIDs.map( uid => this.props.IDsAndNames[uid] || "Sense nom" )

        let ranks = playersIDs.map( uid => {
            return this.props.competitions[this.props.competition.id].playersIDs.indexOf(uid) + 1
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

    renderScoreCols = (headers, data, nVisibleRows) => {
        return headers.map( (header, iCol) => {
            return <Column
                    key={iCol}
                    header={header}
                    data={data[iCol]} style={{...styles.column, width: 100/nVisibleRows + "%" }}
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
    IDsAndNames: state.IDsAndNames,
    competitions: state.competitions,
})

const mapDispatchToProps = dispatch => ({
    setCurrentMatch: (compInfo) => dispatch(setCurrentMatch(compInfo))
})

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