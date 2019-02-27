import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import RivalsList from './RivalsList';

export default class AddMatchModal extends React.Component {

  render() {
    let playerName = this.props.playerName;
    const name = playerName.split(" ")[0]
    return (
      <View style={styles.matchModalContainer}>
        <View style={styles.matchModalView}>
          <RivalsList playerName={playerName} ranking={this.props.ranking} handlePlayerPress={this.props.handlePlayerPress} groupsResults={this.props.groupsResults} />
          <TouchableOpacity style={styles.hideModalButton} onPress={this.props.toggleAddMatchModal}>
            <Text style={styles.addMatchText}>No vull afegir cap partit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  matchModalContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "#00000066",
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 50,
  },
  matchModalView: {
    paddingVertical: 30,
    paddingHorizontal:20,
    borderRadius: 2,
    backgroundColor: "white"
  },
  questionView: {
    paddingBottom: 10,
    alignItems:"center",
    justifyContent: "center"
  },
  questionText: {
    fontSize: 18
  },
  hideModalButton: {
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addMatchText: {
    color:"darkred",
    fontSize: 15
  },
});