import React from 'react';
import { StyleSheet, View, ImageBackground} from 'react-native';
import MatchFilter from "./MatchFilter"
import MatchHistory from "./MatchHistory"

export default class MatchSearcher extends React.Component {
  
    constructor() {
      super()
        this.state = {
          filter: false,
          filter2: false
        };
    }

    applyFilter = (filter,clearInput) => {
      if (this.state.filter && filter || this.state.filter2 && !filter) {
        this.setState({
          filter2: filter
        })
      } else {
        this.setState({filter})
      }
      clearInput()
    }

    render() {
      return (
        <ImageBackground style = {{flex:1}} source={require("../assets/bg.jpg")}>
          <View style = {styles.container}>
            <MatchFilter filter={this.state.filter} filter2={this.state.filter2} applyFilter={this.applyFilter} filterApplied={this.filterApplied}/>
            <MatchHistory filter={this.state.filter} filter2={this.state.filter2}/>
          </View>
        </ImageBackground>
      );
    }
}
  
const styles = StyleSheet.create({
  container:{
    flex: 1,
    paddingTop: 50,
    paddingHorizontal:20,
    backgroundColor: "#ffec8b33",
  },
});