import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default class Table extends React.Component {
    getTotals = (myArray, chunk_size) => {
        let totals = [];
        if (Array.isArray(myArray)) {
            let myNewArray = myArray.slice()
            while (myNewArray.length) {
                totals.push(myNewArray.splice(0, chunk_size).reduce((a, b) => {
                    return a + b;
                }));
            }
        }
        return totals;
    };

    getLeaderLoser = (totals) => {
        const maxTotals = Math.max.apply(Math, totals);
        const minTotals = Math.min.apply(Math, totals);
        let leader = totals.indexOf(maxTotals);
        let loser = totals.lastIndexOf(minTotals);
        const leaderLoser = [leader, loser];
        return leaderLoser;
    }

    renderTable = (group, iGroup, groupResults) => {
        //Número d'integrants del grup
        const nGroup = group.length;
        //Totals
        let totals;
        let leaderLoser;
        if (groupResults) {
            totals = this.getTotals(groupResults, nGroup);
            leaderLoser = this.getLeaderLoser(totals)
        } else {
            totals = false;
        }
        //Construïm taula
        let table = []
        //Títol del grup
        table.push(<View key={String(iGroup) + "header"} style={styles.tableTitle}><Text
            style={styles.tableTitleText}>GRUP {iGroup}</Text></View>)
        //Taula en sí
        for (let i = 0; i <= nGroup; i++) {
            let rowContent = [];
            let addRowStyles = null;
            let addStatusStyles = null;
            //Determinem si és la fila del que va primer o últim
            if (totals && leaderLoser[0] == i - 1) {
                addStatusStyles = styles.leaderRow
            } else if (totals && leaderLoser[1] == i - 1) {
                addStatusStyles = styles.lastPlayerRow
            }
            for (let j = 0; j < nGroup + 3; j++) {
                let addStyles = "";
                let addTextStyle = null;
                let content = "";
                let typeOfCell = "";
                let matchPlayers = [];
                let toSendOnPress = {};
                let resultsPositions;
                if (j == 0) { // Columna de les posicions
                    addStyles = styles.positionCell;
                    if (i > 0) {
                        content = group[i - 1][0];
                        typeOfCell = "positionCell"
                    }
                } else if (j == 1) { //Columna dels noms
                    addStyles = styles.playerCell;
                    if (i > 0) {
                        content = group[i - 1][1];
                        typeOfCell = "playerNameCell"
                        toSendOnPress = {content, typeOfCell, iGroup}
                    } else {
                        content = "Nom"
                    }
                } else if (j > 1 && j < nGroup + 2) { //Columnes de les puntuacions

                    if (i - 1 != j - 2) {
                        addStyles = styles.pointsCell;
                        typeOfCell = "pointsCell";
                        addTextStyle = styles.pointsText;
                        matchPlayers = [group[i - 1], group[j - 2]];
                        resultsPositions = [nGroup * (i - 1) + j - 2, nGroup * (j - 2) + i - 1] //Posició de la cel·la i de la complementaria

                    } else {
                        addStyles = styles.samePlayerCell;
                    }
                    //Puntuació que va a la casella
                    if (i == 0) {
                        content = group[j - 2][0]
                        typeOfCell = "";
                        addTextStyle = null;
                    } else if (groupResults && groupResults[nGroup * (i - 1) + j - 2]) {
                        content = groupResults[nGroup * (i - 1) + j - 2];
                    }
                    toSendOnPress = {content, typeOfCell, matchPlayers, iGroup, resultsPositions};
                } else if (j == nGroup + 2) {
                    addStyles = styles.totalCell;
                    if (i == 0) {
                        content = "Total"
                    } else {
                        content = totals[i - 1] || ""
                    }
                }
                // Afegim una view o touchableOpacity depenent del tipus de cel·la
                if (typeOfCell == "playerNameCell" || typeOfCell == "pointsCell") {
                    rowContent.push(
                        <TouchableOpacity key={String(iGroup) + String(i) + String(j)}
                                          style={[styles.tableCell, addStyles]} onPress={() => {
                            this.props.handlePress(toSendOnPress)
                        }}>
                            <Text style={[styles.tableText, addTextStyle, addStatusStyles]}>{content}</Text>
                        </TouchableOpacity>
                    );
                } else {
                    rowContent.push(
                        <View key={String(iGroup) + String(i) + String(j)} style={[styles.tableCell, addStyles]}>
                            <Text style={[styles.tableText, addStatusStyles]}>{content}</Text>
                        </View>
                    );
                }
            }
            if (i == 0) {
                addRowStyles = styles.headerRow
            }

            table.push(<View key={"Row" + String(i)} style={[styles.tableRow, addRowStyles]}>{rowContent}</View>);
        }
        return table;
    }

    render() {
        const {group, iGroup, groupResults} = this.props
        return (
            <View style={styles.tableContainer}>
                {this.renderTable(group, iGroup, groupResults)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    tableContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
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
        alignSelf: "stretch",
        flexDirection: 'row',
        height: 30,
    },
    headerRow: {
        height: 25
    },
    leaderRow: {
        color: "#2d652b"
    },
    lastPlayerRow: {
        color: "#ae1414"
    },
    tableCell: {
        alignSelf: 'stretch',
        justifyContent: "center",
        alignItems: "center",
        borderColor: "black",
        borderWidth: 1
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
        backgroundColor: "#ffffff59"
    },
    totalCell: {
        flex: 3,
    },
});