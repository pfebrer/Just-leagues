import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Picker} from 'react-native';

export default class AdminAddMatchModal extends React.Component {

    state = {
        typeOfMatch: "Torneig",
        player1:this.props.ranking.sort()[0],
        sets1: 0,
        player2:this.props.ranking.sort()[0],
        sets2: 0,
    }

    rankingItems = () => {
        const ranking = this.props.ranking.sort();
        let pickersList = [];
        ranking.forEach((player) => {
            pickersList.push(
                <Picker.Item key={player} label={player} value={player} />
            )
        })

        return pickersList;
    }

    resultIsCorrect = (result) => {
        let isCorrect = false;
        if ((result[0] == 3 || result[1] == 3) && !(result[0] == 3 && result[1] == 3)){
            isCorrect = true;
        }
        return isCorrect;
    }

  render() {
    let playerName = this.props.playerName;
    const name = playerName.split(" ")[0]
    return (
      <View style={styles.matchModalContainer}>
        <View style={styles.matchModalView}>
            <Picker
                selectedValue={this.state.typeOfMatch}
                onValueChange={(itemValue, itemIndex) => this.setState({typeOfMatch: itemValue})}>
                <Picker.Item label="Repte" value="Reptes" />
                <Picker.Item label="Torneig" value="Torneig" />
            </Picker>
            <View style={styles.itemsRow}>
                <Picker
                    selectedValue={this.state.player1}
                    style={styles.playerPicker}
                    onValueChange={(itemValue, itemIndex) => this.setState({player1: itemValue})}>
                    {this.rankingItems()}
                </Picker>
                <Picker
                    selectedValue={this.state.sets1}
                    style={styles.setPicker}
                    onValueChange={(itemValue, itemIndex) => this.setState({sets1: itemValue})}>
                    <Picker.Item label="0" value={0} />
                    <Picker.Item label="1" value={1} />
                    <Picker.Item label="2" value={2} />
                    <Picker.Item label="3" value={3} />
                </Picker>
            </View>
            <View style={styles.itemsRow}>
                <Picker
                    selectedValue={this.state.player2}
                    style={styles.playerPicker}
                    onValueChange={(itemValue, itemIndex) => this.setState({player2: itemValue})}>
                    {this.rankingItems()}
                </Picker>
                <Picker
                    selectedValue={this.state.sets2}
                    style={styles.setPicker}
                    onValueChange={(itemValue, itemIndex) => this.setState({sets2: itemValue})}>
                    <Picker.Item label="0" value={0} />
                    <Picker.Item label="1" value={1} />
                    <Picker.Item label="2" value={2} />
                    <Picker.Item label="3" value={3} />
                </Picker>
            </View>
            <TouchableOpacity style={styles.hideModalButton} onPress={()=>{
                if (this.state.player1 != this.state.player2){
                    if (this.resultIsCorrect([this.state.sets1,this.state.sets2])){
                        this.props.addResult({
                            iGroup: this.state.typeOfMatch,
                            matchPlayers:[this.state.player1,this.state.player2],
                            resultInSets:[this.state.sets1,this.state.sets2]
                        });
                    } else {
                        alert("Segur que el resultat està bé?");
                    }
                } else {
                    alert("Una persona no pot jugar contra ella mateixa :(");
                }
                }}>
                <Text style={styles.addMatchText}>Afegir partit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hideModalButton} onPress={this.props.toggleAddMatchModal}>
                <Text style={styles.dismissText}>No vull afegir cap partit</Text>
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
  itemsRow: {
      flexDirection: "row"
  },
  playerPicker: {
      flex:2
  },
  setPicker: {
      flex:1
  },
  hideModalButton: {
    paddingTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addMatchText: {
    color:"green",
    fontSize: 15
  },
  dismissText: {
    color:"darkred",
    fontSize: 15
  },
});