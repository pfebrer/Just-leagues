import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity} from 'react-native';
import { Icon } from 'native-base';

export default class MatchFilter extends React.Component {

    constructor() {
        super()
        this.state = {
            filter: false
        };
        this.myTextInput = React.createRef()
    }

    clearInput = () => {
        this.myTextInput.current.clear()
    }

    render() {
      let removeFilterButton = this.props.filter ? (
        <TouchableOpacity style={styles.filterNoButton} onPress={()=>{this.props.applyFilter(false,this.clearInput)}}></TouchableOpacity>
      ): null;
      let addTextInpStyles = removeFilterButton ? styles.middleTextInp : styles.leftTextInp;
      let placeholder = this.props.filter ? (
          this.props.filter2 ? "Altre rival per "+ this.props.filter+"..." : "Algun adversari en concret?"
          ) : "Persona a buscar...";
      return (
        <View style= {styles.filterView}>
            {removeFilterButton}
            <TextInput
                style={[styles.filterTextInp,addTextInpStyles]}
                onChangeText={(text) => {this.state.filter = text}}
                ref={this.myTextInput} placeholder={placeholder}
            />
            <TouchableOpacity style={styles.filterGoButton} onPress={()=>{this.props.applyFilter(this.state.filter, this.clearInput)}}>
                <Icon name="search" style={styles.filterButtonIcon}/>
            </TouchableOpacity>
        </View>
      );
    }
}
  
const styles = StyleSheet.create({
  filterView: {
    elevation: 5,
    backgroundColor: "white",
    height:60,
    borderRadius: 5,
    overflow: "hidden",
    flexDirection: "row",
  },
  filterTextInp: {
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  leftTextInp: {
    flex:3,
  },
  middleTextInp: {
    flex:2.75,
  },
  filterGoButton: {
    flex:1,
    alignItems: "center",
    backgroundColor: "green",
    justifyContent: "center",
  },
  filterNoButton: {
    flex:0.25,
    alignItems: "center",
    backgroundColor: "red",
    justifyContent: "center",
  },
  filterButtonIcon: {
    color:"white",
  },
});