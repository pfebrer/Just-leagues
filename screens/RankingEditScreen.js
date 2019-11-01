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
import SortableList from 'react-native-sortable-list';
import { Button, Icon } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { translate } from '../assets/translations/translationManager';
import { w } from '../api/Dimensions';
import { COMPSETTINGS } from '../constants/Settings';

//Redux stuff
import { connect } from 'react-redux'
import {setCurrentCompetition} from "../redux/actions"
import HeaderIcon from '../components/header/HeaderIcon';

import Firebase from "../api/Firebase"

const window = Dimensions.get('window');


class RankingEditScreen extends Component {

    constructor(props){
        super(props)

        this.state = {
          editable: true,
          deleteMode: false,
          ranking: props.competition.playersIDs || []
        }

    }

    componentDidMount(){
      this.props.navigation.setParams({submitNewRanking: this.submitNewRanking})
    }

    static navigationOptions = ({navigation}) => {
      return {
        headerTitle: translate("tabs.ranking editing"), 
        headerRight: <HeaderIcon name="checkmark" onPress={navigation.getParam("submitNewRanking")} />
      }
  };

  submitNewRanking = () => {

    let {gymID, id: compID} = this.props.competition 

    Firebase.updateCompetitionDoc(gymID, compID, {playersIDs: this.state.ranking},
      () => {
        this.props.setCurrentCompetition({...this.props.competition, playersIDs: this.state.ranking});
        this.props.navigation.goBack()
      }
    )

  }

    updateRankingOrder = (keys) => {
      this.setState({ranking: keys.map( key => this.state.ranking[key])})
    }

    deleteItem = (key, marginHorizontal) => {

        Animated.timing( marginHorizontal, {
            toValue: w(100),
        } ).start(() => {
            this.setState({ranking: this.state.ranking.filter((_,i) => i !== key) })
        })
        
    }

    render() {
        return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate("tabs.ranking")}</Text>
            <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            onReleaseRow={(key, newOrder) => this.updateRankingOrder(newOrder)}
            onPressRow={(key) => this.setState({deleteMode: this.state.editable && !this.state.deleteMode})}
            data={this.state.ranking}
            renderRow={this._renderRow}
            sortingEnabled={this.state.editable}/>
        </View>
    );
  }

  _renderRow = ({data: uid, active, index}) => {
    return <Row 
            data={this.props.IDsAndNames[uid] || "Sense nom"} 
            active={active} 
            index={index}
            deletable={this.state.deleteMode}
            deleteItem={this.deleteItem}/>
  }
}

class Row extends Component {

  constructor(props) {
    super(props);

    this._active = new Animated.Value(0);
    this._marginHorizontal = new Animated.Value(0);

    this._style = {
      ...Platform.select({
        ios: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            }),
          }],
          shadowRadius: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 10],
          }),
        },

        android: {
          transform: [{
            scale: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.07],
            }),
          }],
          elevation: this._active.interpolate({
            inputRange: [0, 1],
            outputRange: [2, 6],
          }),
        },
      }),

    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.active !== nextProps.active) {
      Animated.timing(this._active, {
        duration: 300,
        easing: Easing.bounce,
        toValue: Number(nextProps.active),
      }).start();
    }
  }

  renderDeleteButton = (deletable, index) => {
      return deletable ? <TouchableOpacity 
                            style={styles.deleteButton}
                            onPress={() => {this.props.deleteItem(index, this._marginHorizontal)}}>
                            <Icon name="close" style={styles.deleteIcon}/>
                        </TouchableOpacity> : null;
  }

  render() {
   const {data, index} = this.props;

    return (
      <Animated.View style={{
        ...styles.row,
        ...this._style,
        backgroundColor: Math.floor(index/COMPSETTINGS.groups.groupSize) % 2 == 0 ? "#ccc" : "white",
        marginHorizontal: this._marginHorizontal
        }}>
        <View style={styles.rankView}>
            <Text style={styles.rank}>{index+1}</Text>
        </View>
        <View style={styles.playerNameView}> 
            <Text style={styles.playerName}>{data}</Text>
        </View>
        {this.renderDeleteButton(this.props.deletable, index)}
      </Animated.View>
    );
  }
}

const mapStateToProps = state => ({
  competition: state.competition,
  IDsAndNames: state.IDsAndNames,
  currentUser: state.currentUser
})

const mapDispatchToProps = dispatch => ({
  setCurrentCompetition: (compInfo) => dispatch(setCurrentCompetition(compInfo))
})

export default connect(mapStateToProps, mapDispatchToProps)(RankingEditScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',

    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
    }),
  },

  title: {
    fontSize: 20,
    paddingVertical: 20,
    color: '#999999',
  },

  list: {
    flex: 1,
  },

  contentContainer: {
    width: window.width,

    ...Platform.select({
      ios: {
        paddingHorizontal: 30,
      },

      android: {
        paddingHorizontal: 0,
      }
    })
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    flex: 1,
    marginTop: 7,
    marginBottom: 12,
    borderRadius: 4,


    ...Platform.select({
      ios: {
        width: window.width,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOpacity: 1,
        shadowOffset: {height: 2, width: 2},
        shadowRadius: 2,
      },

      android: {
        width: window.width,
        elevation: 0,
      },
    })
  },

  rankView: {
    width: 40,
  },

  rank: {
    fontFamily: "bold",
    color: '#222222',
  },

  playerNameView: {
    flex:1,
  },

  playerName: {
    fontSize: 14,
    color: '#222222',
  },

  deleteButton: {
    paddingHorizontal: 5
  },

  deleteIcon: {
    color: "darkred"
  }
});