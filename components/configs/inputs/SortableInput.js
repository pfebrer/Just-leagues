import React , {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Easing, Animated} from "react-native"
import { totalSize } from '../../../api/Dimensions';

import { translate } from "../../../assets/translations/translationManager"

import SortableList from 'react-native-sortable-list';

import _ from "lodash"

export default class SortableInput extends Component  {

    static _type = "sortable"

    constructor(props){
        super(props)

        this.state = {
          value: props.defaultValue
        }
    }

    updateValues = (newOrder) => {

        let newValue = newOrder.map(key => this.state.value[key])

        this.setState({value: newValue}, () => this.props.reportValue(newValue))
    }

    renderRow = ({data, active, index}) => {

        const name = this.props.items[data].translatename ? translate(this.props.items[data].translatename) : this.props.items[data].name
        return <Row 
                data={name} 
                active={active} 
                index={index}
                //deletable={this.state.deleteMode}
                //deleteItem={this.deleteItem}
                //isOrphan={this.isOrphan(index)}
            />
    }

    render() {

        return (
            <SortableList
                style={styles.list}
                contentContainerStyle={{...styles.contentContainer, ...this.props.style}}
                onReleaseRow={(key, newOrder) => this.updateValues(newOrder)}
                //onPressRow={(key) => this.setState({deleteMode: this.state.editable && !this.state.deleteMode})}
                data={this.state.value}
                renderRow={this.renderRow}
                sortingEnabled={true}/>
        )
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
          backgroundColor: "#ccc",
          marginHorizontal: this._marginHorizontal
          }}>
          <View style={styles.indexView}>
              <Text style={styles.indexText}>{index+1}</Text>
          </View>
          <View style={styles.dataView}> 
              <Text style={styles.dataText}>{data}</Text>
          </View>
          {this.renderDeleteButton(this.props.deletable, index)}
        </Animated.View>
      );
    }
  }

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    sortableItem: {
        paddingVertical: 15,
        flexDirection: "row",
        marginVertical: 10,
        marginHorizontal: 20,
        backgroundColor: "#ccc",
        borderRadius: 5,
    },

    indexView: {
        paddingHorizontal: 20
    },

    indexText: {
        fontWeight: "bold"
    },

    dataView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    dataText: {

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

})