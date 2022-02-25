import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PressPicker from "./match/PressPicker"


export default class ScoreRow extends React.Component {

    render() {
        let scoreRow = null;
        let sets = this.props.sets;
        if (!this.props.editableResult) {
            let addStyles;
            if (!sets[0] && !sets[1]) {
                addStyles = styles.emptyScore
            }
            let addTextStyle = [styles.winnerViewText, styles.loserViewText]

            if (Math.max(sets[0], sets[1]) == sets[1]) {
                addTextStyle.reverse()
            }

            scoreRow = (
                <View style={styles.scoreRow}>
                    <View style={[styles.scoreView, addStyles]}><Text
                        style={[styles.scoreText, addTextStyle[0]]}>{sets[0]}</Text></View>
                    <View style={styles.hyphonView}><Text style={styles.hyphonText}>-</Text></View>
                    <View style={[styles.scoreView, addStyles]}><Text
                        style={[styles.scoreText, addTextStyle[1]]}>{sets[1]}</Text></View>
                </View>
            )
        } else {
            scoreRow = (
                <View style={styles.scoreRow}>
                    <PressPicker pKey={0} onNewResult={this.props.onNewResult} viewStyle={styles.scoreChanger}
                                 textStyle={styles.scoreChangerText} possibleValues={[0, 1, 2, 3]}/>
                    <View style={styles.hyphonView}><Text style={styles.hyphonText}>-</Text></View>
                    <PressPicker pKey={1} onNewResult={this.props.onNewResult} viewStyle={styles.scoreChanger}
                                 textStyle={styles.scoreChangerText} possibleValues={[0, 1, 2, 3]}/>
                </View>
            )
        }
        return scoreRow;
    }
}

const styles = StyleSheet.create({
    scoreRow: {
        flexDirection: "row",
        paddingTop: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    scoreView: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff80",
        borderRadius: 3,
        height: 50,
        width: 50,
    },
    emptyScore: {
        backgroundColor: "white",
    },
    winnerViewText: {
        color: "#2d652b",
    },
    loserViewText: {
        color: "#ae1414",
    },
    scoreChanger: {
        backgroundColor: "#9a9a9aCC",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 3,
        height: 50,
        width: 50,
    },
    scoreText: {
        color: "black",
        fontFamily: "bold",
        fontSize: 25,
    },
    scoreChangerText: {
        color: "#e8ea00",
        fontFamily: "bold",
        fontSize: 25,
    },
    hyphonView: {
        paddingHorizontal: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    hyphonText: {
        color: "black",
        fontFamily: "bold",
        fontSize: 30,
    },
});