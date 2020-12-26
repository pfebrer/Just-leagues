import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { Button, Icon, Input, Form, Label, Item} from 'native-base';
import _ from "lodash"
import { translate } from '../../assets/translations/translationWorkers';
import { w, totalSize } from '../../api/Dimensions';


//Redux stuff
import { connect } from 'react-redux'

import Firebase from "../../api/Firebase"
import PlayerPicker from '../../components/pickers/PlayerPicker';
import { selectCurrentCompetition } from '../../redux/reducers';
import UserCard from '../../components/user/UserCard';

const window = Dimensions.get('window');


class PlayersManagementScreen extends Component {

    constructor(props){
        super(props)

        this.state = {
          newPlayer: {},
          playerToModify: {},
        }

    }

    static navigationOptions = ({navigation}) => {
      return {
        headerTitle: translate("tabs.player management"),
      }
  };

  addPlayer = () => {

    let {gymID, id: compID} = this.props.competition 

    if ( !this.state.newPlayer.name || !this.state.newPlayer.email) return

    Firebase.addNewPlayersToComp(gymID, compID, [this.state.newPlayer],
      (newPlayers) => {
        let newPlayer = newPlayers[0];
        alert( translate("info.player added") + "\n" + translate("auth.name") + ": " + newPlayer.name + "\n" + translate("auth.email") + ": " + newPlayer.email )
        this.setState({newPlayer: {name: "", email: ""}})
      }
    )

  }

  modifyPlayer = () => {

    if ( !this.state.playerToModify.id || !this.state.playerToModify.email) return

    Firebase.updateUserDoc(this.state.playerToModify.id, _.omit(this.state.playerToModify, ["id"]),
      () => {
        alert( translate("info.player data modified") )
      }
    )

  }

  render() {

    return (
      <View >
          <Form>
              <Item stackedLabel>
                  <Label>{translate("auth.name")}</Label>
                  <Input 
                      value={this.state.newPlayer.name}
                      onChangeText={(value) => this.setState({newPlayer: {...this.state.newPlayer, name: value}}) }
                  />
              </Item>
              <Item stackedLabel last>
                  <Label>{translate("auth.email")}</Label>
                  <Input 
                      value={this.state.newPlayer.email} 
                      onChangeText={(value) => this.setState({newPlayer: {...this.state.newPlayer, email: value}}) }
                  />
              </Item>
              <Button
                  style={styles.button}
                  onPress={this.addPlayer}
                  >
                  <Text style={styles.buttonText}>{translate("actions.add player")}</Text>
              </Button>
          </Form>
          <Form>
            <Item>
              <Label>{translate("vocabulary.player")}</Label>
              <PlayerPicker
                value={this.state.playerToModify.id}
                onPlayerChange={(uid) => this.setState({playerToModify: {...this.state.playerToModify, id: uid}}) }
              />
            </Item>
            <Item stackedLabel last>
              <Label>{translate("auth.email")}</Label>
              <Input
                placeholder={this.props.relevantUsers[this.state.playerToModify.id] && this.props.relevantUsers[this.state.playerToModify.id].email ? this.props.relevantUsers[this.state.playerToModify.id].email : translate("info.no email address available")} 
                value={this.state.playerToModify.email} 
                onChangeText={(value) => this.setState({playerToModify: {...this.state.playerToModify, email: value}}) }
              />
            </Item>
            <Button
                style={styles.button}
                onPress={this.modifyPlayer}
                >
                <Text style={styles.buttonText}>{translate("actions.modify player data")}</Text>
            </Button>
          </Form>
          <View style={{paddingHorizontal: 10, paddingVertical: 20}}>
            <Text>{translate("info.players that would like to join")}</Text>
            {this.props.competition.playersAskingToJoin.map(uid => <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
              <UserCard uid={uid}/>
              <View style={{flexDirection: "row"}}>
                <Button 
                  onPress={() => Firebase.addNewPlayersToComp(this.props.competition.gymID, this.props.competition.id, [{id: uid}])}
                  style={{backgroundColor: "green", marginRight: 5}}><Icon name="checkmark"/></Button>
                <Button 
                  onPress={() => Firebase.denyPlayerFromCompetition(this.props.competition.gymID, this.props.competition.id, uid)}
                  style={{backgroundColor: "red"}}><Icon name="close"/></Button>
              </View>
            </View>)}
          </View>
      </View>
    );
  }

}

const mapStateToProps = state => ({
  competition: selectCurrentCompetition(state),
  relevantUsers: state.relevantUsers,
  currentUser: state.currentUser
})

const mapDispatchToProps = null

export default connect(mapStateToProps, mapDispatchToProps)(PlayersManagementScreen);

const styles = StyleSheet.create({

    button: {
        justifyContent:"center",
        alignItems:"center",
        paddingHorizontal: 30
    },

    buttonText: {
        color: "white",
        textTransform: "uppercase",
        fontFamily: "bold",
        fontSize: totalSize(1.6)
    },

});