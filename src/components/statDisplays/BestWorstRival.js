import React from 'react';
import { StyleSheet, View, Text} from 'react-native';



export default class BestWorstRival extends React.Component {

  getStats = () => {
    let stats = [];
    let playerMatches = this.props.playerMatches;
    let rivals = [[],[]];
    let bestRivals = [];
    let bestRivalstoRender = [];
    let worstRivals = [];
    let worstRivalstoRender = [];

    playerMatches.forEach((match) => {
      let rival = match.rival;
      let matchWon = match.matchWon;
      let iRival = rivals[0].indexOf(rival);
      if (iRival == -1){ //Si no està registrat el registrem
        rivals[0].push(rival);
        let won = matchWon ? 1 : 0;
        let played = 1;
        rivals[1].push([won,played]);
      } else {
        rivals[1][iRival][0] += match.matchWon ? 1 : 0;
        rivals[1][iRival][1] += 1;
      }
    });

    let ratios = rivals[1].map((values) => {return values[1] != 0 ? values[0]/values[1] : null});
    let played = rivals[1].map((values) => {return values[1]});
    let maxRatio = Math.max.apply(Math,ratios);
    let minRatio = Math.min.apply(Math,ratios);
    let iMaxs = ratios.map((e, i) => e === maxRatio ? i : '').filter(String);
    let iMins = ratios.map((e, i) => e === minRatio ? i : '').filter(String);
    let sameRatioW = played.filter((value,index) => iMaxs.indexOf(index) >= 0)
    let sameRatioL = played.filter((value,index) => iMins.indexOf(index) >= 0)
    let maxPlayedW = Math.max.apply(Math,sameRatioW);
    let maxPlayedL = Math.max.apply(Math,sameRatioL);
    
    
    iMaxs.forEach((iMax) => {
        if (rivals[1][iMax][1] == maxPlayedW){
            bestRivals.push(rivals[0][iMax])
        }  
    })
    iMins.forEach((iMin) => {
        if (rivals[1][iMin][1] == maxPlayedL){
            worstRivals.push(rivals[0][iMin])
        }
    })
    
    if (bestRivals.length > 0 && bestRivals.indexOf(worstRivals[0]) == -1){ //Evitem que els millors siguin igual que els pitjors
        bestRivalstoRender = bestRivals.map((rival,index) => {
            let wonPlayed = rivals[1][iMaxs[index]]
            let won = wonPlayed[0];
            let lost = wonPlayed[1]-wonPlayed[0];
            let plural = [won == 1 ? "" : "s",lost == 1 ? "" : "s"];
            return (
                <View key={rival} style= {styles.rivalView}>
                <Text style= {styles.rivalText}>{rival}</Text>
                    <Text style= {styles.rivalText}>{"("+won+" guanyat"+plural[0]+", "+lost+" perdut"+plural[1]+")"}</Text>
                </View>
            )
        });
        worstRivalstoRender = worstRivals.map((rival,index) => {
            let wonPlayed = rivals[1][iMins[index]]
            let won = wonPlayed[0];
            let lost = wonPlayed[1]-wonPlayed[0];
            let plural = [won == 1 ? "" : "s",lost == 1 ? "" : "s"];
            return (
                <View key={rival} style= {styles.rivalView}>
                    <Text style= {styles.rivalText}>{rival}</Text>
                    <Text style= {styles.rivalText}>{"("+won+" guanyat"+plural[0]+", "+lost+" perdut"+plural[1]+")"}</Text>
                </View>
            )
        });
    }

    
    
    return {bestRivalstoRender,worstRivalstoRender};
  }

  render() {
    let {bestRivalstoRender,worstRivalstoRender} = this.getStats()
    let bestRivalsText = bestRivalstoRender.length > 1 ? "Millors rivals" : (
        bestRivalstoRender.length > 0 ? "Millor Rival" : null)
    let worstRivalsText = worstRivalstoRender.length > 1 ? "Pitjors rivals" : (
        worstRivalstoRender.length > 0 ? "Pitjor Rival" : null)
    return (
        <View style={styles.statsContainer}>
            <View style={styles.bestDescView}>
                <Text style={styles.descText}>{bestRivalsText}</Text>
            </View>
            {bestRivalstoRender}
            <View style={styles.worstDescView}>
                <Text style={styles.descText}>{worstRivalsText}</Text>
            </View>
            {worstRivalstoRender}
         </View>
    );
  }
}

const styles = StyleSheet.create({
  statsContainer:{
    marginBottom: 10,
    backgroundColor: "#ffffffA6",
    borderRadius: 5,
  },
  bestDescView:{
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor: "#50d23280",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  worstDescView: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor: "#ff666680"
  },
  descText:{
    fontSize: 15,
    fontFamily: "bold"
  },
  rivalView:{
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent:"center",
    alignItems:"center",
  }
});