import React, { Component } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  Image,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import { Button, Icon, Input, Form, Label, Item} from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { translate } from '../../assets/translations/translationManager';
import { w, totalSize } from '../../api/Dimensions';
import {renderName} from "../../assets/utils/utilFuncs";

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../../redux/actions"

import Firebase from "../../api/Firebase"

const window = Dimensions.get('window');


class PlayersManagementScreen extends Component {

    constructor(props){
        super(props)

        this.state = {
            newPlayer: {
                name: "",
                email: ""
            }
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

    Firebase.addNewPlayerToComp(compID, [this.state.newPlayer],
      (newPlayers) => {
        let newPlayer = newPlayers[0];
        alert( translate("info.player added") + "\n" + translate("auth.name") + ": " + newPlayer.name + "\n" + translate("auth.email") + ": " + newPlayer.email )
        this.setState({newPlayer: {name: "", email: ""}})
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
        </View>
    );
  }

}

const mapStateToProps = state => ({
  competition: state.competition,
  relevantUsers: state.relevantUsers,
  currentUser: state.currentUser
})

const mapDispatchToProps = dispatch => ({
  setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
})

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