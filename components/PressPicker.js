import React, { Component } from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'

export default class PressPicker extends Component {

    constructor(props) {
        super(props)
        this.state = {
            pickedValue:props.possibleValues[0],
        }
    }
    componentWillMount(){
        this.props.onNewResult({pKey:this.props.pKey,result:this.state.pickedValue})
    }

    componentDidUpdate(){
        this.props.onNewResult({pKey:this.props.pKey,result:this.state.pickedValue})
    }

    goToNext = () => {
        let possibleValues = this.props.possibleValues;
        let iPicked = possibleValues.indexOf(this.state.pickedValue)
        let newPicked = possibleValues[iPicked+1] || possibleValues[0]
        this.setState({
            pickedValue: newPicked
        });
    }

  render() {
    return (
      <TouchableOpacity style={this.props.viewStyle} onPress={this.goToNext}>
          <Text style={this.props.textStyle}>{this.state.pickedValue}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
});