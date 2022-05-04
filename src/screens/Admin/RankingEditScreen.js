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
  Pressable,
  TouchableOpacity
} from 'react-native';
import SortableList from 'react-native-sortable-list';
import { Button, Icon, Toast } from 'native-base';
import _ from "lodash"

import { translate } from '../../assets/translations/translationWorkers';
import { w } from '../../api/Dimensions';

//Redux stuff
import { connect } from 'react-redux'

import HeaderIcon from '../../components/UX/HeaderIcon';

import Firebase from "../../api/Firebase"
import { selectCurrentCompetition } from '../../redux/reducers';
import { Ionicons } from '@expo/vector-icons';

const window = Dimensions.get('window');


class RankingEditScreen extends Component {

  constructor(props){
    super(props)

    this.state = {
      editable: true,
      deleteMode: false,
      ranking: props.ranking || props.competition.playersIDs || []
    }

    this.onChange = props.onChange || this.setState

  }

  componentDidMount(){
    this.props.navigation.setOptions({
        headerTitle: translate("tabs.ranking editing"), 
        headerRight: () => <HeaderIcon name="checkmark" onPress={this.submitNewRanking} />
    })
  }

  isOrphan = (index) => {

    const ranking = this.props.ranking || this.state.ranking

    let nLastGroup = ranking.length % this.props.competition.getSetting("groupSize")
    return (index >= ranking.length - nLastGroup && //Is one of the last players
      nLastGroup < this.props.competition.getSetting("minGroupSize")) //There are orphans in this ranking 
  }

  submitNewRanking = () => {

    let {gymID, id: compID} = this.props.competition

    Firebase.updateCompetitionDoc(gymID, compID, {playersIDs: this.state.ranking},
      () => {
        this.props.navigation.goBack()
      }
    )

  }

  setPreviousRanking = async () => {

    let {gymID, id: compID} = this.props.competition

    try {
      let querySnapshot = await Firebase.getPreviousRanking(gymID, compID)

      let {playersIDs: ranking, date} = querySnapshot.docs[0].data()

      this.setState({ranking})
    } catch (error) {
      Toast.show({
        text: translate("errors.could not get previous ranking") + "\n Error: " + error,
        type: "danger"
      })
    }

    
  }

  updateRankingOrder = (keys) => {
    const ranking = this.props.ranking || this.state.ranking

    this.onChange({ranking: keys.map( key => ranking[key])})
  }

  deleteItem = (key, marginHorizontal) => {

    const ranking = this.props.ranking || this.state.ranking

    Animated.timing( marginHorizontal, {
        toValue: w(100),
    } ).start(() => {
        this.onChange({ranking: ranking.filter((_,i) => i !== key) })
    })
      
  }

  render() {

    const ranking = this.props.ranking || this.state.ranking

    return (
    <View style={styles.container}>
        <Text style={styles.title}>{translate("tabs.ranking")}</Text>
        { !_.isEmpty(ranking) ? <SortableList
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        onReleaseRow={(key, newOrder) => this.updateRankingOrder(newOrder)}
        onPressRow={(key) => this.setState({deleteMode: this.state.editable && !this.state.deleteMode})}
        data={ranking}
        renderRow={this._renderRow}
        sortingEnabled={this.state.editable}/> : null}
        <TouchableOpacity onPress={this.setPreviousRanking} style={{paddingVertical: 10}}>
          <Text style={{textTransform: "uppercase"}}>{translate("admin.go back to previous ranking")}</Text>
        </TouchableOpacity>
    </View>
    );
  }

  _renderRow = ({data: uid, active, index}) => {

    let name = this.props.competition.renderName(this.props.relevantUsers, uid)

    return <Row 
            data={name} 
            active={active} 
            index={index}
            deletable={this.state.deleteMode}
            deleteItem={this.deleteItem}
            groupSize={this.props.competition.getSetting("groupSize")}
            isOrphan={this.isOrphan(index)}/>
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
      return deletable ? <Pressable 
                            style={styles.deleteButton}
                            onPress={() => {this.props.deleteItem(index, this._marginHorizontal)}}>
                            <Icon as={Ionicons} size={5} name="close" style={styles.deleteIcon}/>
                        </Pressable> : null;
  }

  render() {
   const {data, index} = this.props;

    return (
      <Animated.View style={{
        ...styles.row,
        ...this._style,
        backgroundColor: (Math.floor(index/this.props.groupSize) % 2 == 0) == this.props.isOrphan ? "#ccc" : "white" ,
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
  competition: selectCurrentCompetition(state),
  relevantUsers: state.relevantUsers,
  currentUser: state.currentUser
})

const mapDispatchToProps = null

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