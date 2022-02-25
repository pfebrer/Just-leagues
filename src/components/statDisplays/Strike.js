import React from 'react';
import { StyleSheet, View, Text} from 'react-native';


export default class Strike extends React.Component {


  getStrike = () => {
    let currentStrike = 0;
    let playerMatches = this.props.playerMatches;
    let wonLastMatch;
    if (playerMatches.length > 0){
      wonLastMatch = playerMatches[0].matchWon;
      let wonThisMatch = wonLastMatch? true : false;
      currentStrike = 1
      while (wonThisMatch == wonLastMatch && playerMatches[currentStrike]){
        wonThisMatch = playerMatches[currentStrike].matchWon;
        currentStrike += wonThisMatch == wonLastMatch ? 1 : 0;
      }
    }

    return {currentStrike,wonLastMatch}
  }

  render() {
    const { currentStrike , wonLastMatch} = this.getStrike() || 5;
    const addStrikeStyles = wonLastMatch? [
      styles.winnerDescView,styles.winnerDescText,styles.winnerValueView, styles.winnerCircle,styles.winnerText 
    ] : [
      styles.loserDescView,styles.loserDescText,styles.loserValueView, styles.loserCircle,styles.loserText
    ] 
    return (
        <View style={styles.strikeContainer}>
            <View style={[styles.strikeDescriptionView,addStrikeStyles[0]]}>
              <Text style={[styles.strikeDescriptionText,addStrikeStyles[1]]}>Ratxa actual</Text>
            </View>
            <View style={[styles.strikeValueView,addStrikeStyles[2]]}>
                <View style={[styles.circle,addStrikeStyles[3]]}><Text style={[styles.strikeText,addStrikeStyles[4]]}>{currentStrike}</Text></View>
            </View>
        </View>
    );
  }
}

const styles = StyleSheet.create({
  strikeContainer: {
    flexDirection: "row",
    justifyContent:"center",
    paddingTop: 10,
  },
  strikeDescriptionView: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    justifyContent:"center",
  },
  winnerDescView: {
    backgroundColor: "#50d2324D",
  },
  loserDescView: {
    backgroundColor: "#ff66664D",
  },
  strikeValueView: {
    flexGrow: 1,
    alignItems:"center",
    paddingVertical: 10,
    borderTopRightRadius:5,
    borderBottomRightRadius:5
  },
  winnerValueView:{
    backgroundColor: "#50d2324D",
  },
  loserValueView:{
    backgroundColor: "#ff66664D",
  },
  strikeDescriptionText:{
    fontSize: 30
  },
  winnerDescText: {
    color: "darkgreen",
  },
  loserDescText: {
    color: "darkred",
  },
  circle: {
    borderWidth:2,
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  winnerCircle:{
    borderColor: "#2d652bE6",
    backgroundColor: "#50d2324D",
  },
  loserCircle:{
    borderColor: "darkred",
    backgroundColor: "#ff66664D",
  },
  strikeText: {
    fontSize: 30
  },
  winnerText: {
    color: "#2d652b",
  },
  loserText: {
    color: "darkred",
  },
});