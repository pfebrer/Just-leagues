import React from 'react';
import { StyleSheet, View, Text} from 'react-native';



export default class MatchLength extends React.Component {

  getStats = () => {
    let stats = [];
    let playerMatches = this.props.playerMatches;
    let matchLengths = [3,4,5];
    let sortedMatches = [[0,0],[0,0],[0,0]]; //Primera llista pels partits de 3 jocs, segona pels de 4...
    playerMatches.forEach((match) => {
      let totalSets = match.rivalSets + match.playerSets;
      let iList = matchLengths.indexOf(totalSets)
      sortedMatches[iList][0] += match.matchWon ? 1 : 0,
      sortedMatches[iList][1] += 1
    })
    let ratios = sortedMatches.map((values) => {return values[1] != 0 ? values[0]/values[1] : null})
    let maxRatio = Math.max.apply(Math,ratios);
    let minRatio = Math.min.apply(Math,ratios);
    sortedMatches.forEach((stat,index) => {

      let maxminStyles = ratios[index] == maxRatio ? styles.bestLength : (
        ratios[index] == minRatio ? styles.worstLength : null
      )

      stats.push(
        <View key={index} style={[styles.rowView,maxminStyles]}>
          <View style={styles.matchLengthView}>
            <Text style={styles.matchesLengthText}>{"Partits de "+matchLengths[index]+" jocs:"}</Text>
          </View>
          <View style={styles.matchesWonView}>
            <Text>{stat[0]+"/"+stat[1]}</Text>
          </View>
        </View>
      )
    }
    )
    return stats;
  }

  render() {
    let stats = this.getStats()
    return (
      <View style={styles.statsContainer}>
        {stats}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statsContainer:{
    justifyContent:"center",
    alignItems:"center",
    paddingVertical: 10,
    backgroundColor: "#ffffffA6",
    borderRadius: 5,
  },
  rowView: {
    flexDirection:"row",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent:"center",
    alignItems:"center",
  },
  bestLength:{
    backgroundColor: "#50d23280"
  },
  worstLength: {
    backgroundColor: "#ff666680"
  },
  matchesLengthText:{
    fontSize: 15,
    fontFamily: "bold"
  },
  matchesWonView:{
    flexGrow:1,
    alignItems:"center",
    justifyContent: "center"
  },
});