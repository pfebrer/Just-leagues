import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

export default class RivalsList extends React.Component {

    constructor(props) {
        super(props)
        this.playerPosition = props.ranking.indexOf(props.playerName)+1;
    }

  findGroup = (playerName) => {
    let ranking = this.props.ranking;
    let iGroup = 0;
    let groupFound = false;
    let group = null;
    while (ranking.length > 0 && !groupFound){
      iGroup += 1;
      const nPlayers = 0;
      if (ranking.length > 6){
        nPlayers = 4;
      } else {
        nPlayers = ranking.length;
      }
      group = ranking.slice(0,nPlayers);
      //Si el jugador està en el grup
      if (group.indexOf(playerName) >= 0){
        groupFound = true;
      }
      ranking = ranking.slice(nPlayers,ranking.length)
    }
    return groupFound ? {group,iGroup} : null;
  }

  getRivalsList = (playerName) => {
    const {group,iGroup} = this.findGroup(playerName)
    let groupResults = this.props.groupsResults[iGroup-1]
    let rivalsList = [];
    let alreadyPlayed = [];
    group.forEach((player,j) => {
        if (player != playerName){
          //Preparar totes les coses que s'enviaran al apretar el botó
          let playerPosition = this.props.ranking.indexOf(player) + 1;
          let diff = this.playerPosition - playerPosition;
          let i = j + diff;
          let resultsPositions = [i*group.length+j,j*group.length+i];
          let matchPlayers = [[this.playerPosition,playerName],[playerPosition,player]];
          let content = groupResults[resultsPositions[0]]; //El nom pot confondre (és per la nomenclatura que s'ha posat a la taula)
          let toSendOnPress = {content,matchPlayers,resultsPositions,iGroup,fromAddMatchModal:true};

          if (!content){
            rivalsList.push(
              <TouchableOpacity key={player} style={styles.possibleRivalButton} onPress={()=>{this.props.handlePlayerPress(toSendOnPress)}}>
                  <Text style={styles.possibleRivalText}>{player}</Text>
              </TouchableOpacity>
            )
          } else {
            alreadyPlayed.push(
              <TouchableOpacity key={player} style={styles.possibleRivalButton} onPress={()=>{this.props.handlePlayerPress(toSendOnPress)}}>
                <Text style={styles.alreadyPlayedText}>{player}</Text>
              </TouchableOpacity>
            )
          }      
        }
    });

    let rivalsListHeaderText = rivalsList.length > 0 ? "Amb qui has jugat, "+playerName.split(" ")[0]+"?" : "Ja has jugat amb tothom, "+playerName.split(" ")[0]+" :)"
    let rivalsListHeader = (
      <View key="rivalsListHeader" style={styles.questionView}>
        <Text style={styles.questionText}>{rivalsListHeaderText}</Text>
      </View>
    )

    let alreadyPlayedHeaderText = rivalsList.length > 0 ? "Els teus resultats fins ara:" : "Pots veure els teus resultats:";
    let alreadyPlayedHeaderStyle = rivalsList.length > 0 ? styles.alreadyPlayedHeaderView : styles.questionView ;
    let alreadyPlayedHeader = alreadyPlayed.length > 0 ? (
      <View key="alreadyPlayedHeader" style={alreadyPlayedHeaderStyle}>
        <Text style={styles.questionText}>{alreadyPlayedHeaderText}</Text>
      </View>
    ) : null;


    rivalsList.unshift(rivalsListHeader);
    rivalsList.push(alreadyPlayedHeader);
    const fullList = rivalsList.concat(alreadyPlayed);

    return fullList;

  }

  render() {
    let playerName = this.props.playerName;
    return (
      <View style={styles.rivalsListView}>
        {this.getRivalsList(playerName)}
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  rivalsListView: {
    paddingVertical:10,
  },
  possibleRivalButton: {
    paddingVertical: 10,
    alignItems:"center",
    justifyContent: "center"
  },
  possibleRivalText: {
    color:"darkblue",
    fontSize: 20
  },
  alreadyPlayedText: {
    color:"green",
    fontSize: 20
  },
  questionView: {
    paddingBottom: 10,
    alignItems:"center",
    justifyContent: "center"
  },
  questionText: {
    fontSize: 18
  },
  alreadyPlayedHeaderView : {
    paddingVertical: 10,
    alignItems:"center",
    justifyContent: "center"
  }
});