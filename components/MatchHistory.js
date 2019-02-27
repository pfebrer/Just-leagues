import React from 'react';
import { StyleSheet, ScrollView, View, Text} from 'react-native';
import MatchRow from "./MatchRow"
import {firebase,firestore} from "../Firebase"


export default class MatchHistory extends React.Component {

    constructor(props) {
      super(props)
        this.state = {
          matches:[],
        };
        this.matchesRef = firestore.collection("matches");
    }

    componentDidMount() {
        this.unsub = this.matchesRef.orderBy("date").onSnapshot((querySnapshot)=>{
          let matches = this.state.matches;
          querySnapshot.docChanges().forEach((change)=>{
            if (change.type = "added"){
              const {matchPlayers,matchResult} = change.doc.data()
              matches.push([change.doc.id,matchPlayers,matchResult])
            }
          });
          this.setState({matches});
        })
    }

    componentWillUnmount() {
      this.unsub()
    }

    filterMatches = (passedMatch) => {
      let match = passedMatch[1].slice();
      let isInMatch = true;
      match[0]= match[0].slice().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      match[1]= match[1].slice().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
      let filter = this.props.filter ? this.props.filter.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : false;
      let filter2 = this.props.filter2 ? this.props.filter2.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : false;
      if (filter) {
        isInMatch = false;
        if (match.indexOf(filter) >= 0 ){
          if (filter2 && match.indexOf(filter2) >= 0){
            isInMatch = true
          } else if (!filter2) {
            isInMatch = true;
          }
        }
      }
      return isInMatch;
    }

    orderPlayers = (match) => {
      let orderedMatch = match[1][0] == this.props.filter ? match : (
        [match[0], match[1].reverse(), match[2].reverse()]
      )
      return orderedMatch;
    }

    renderMatches = () => {
      let matches = [];
      let totals = null;
      let unFilteredMatches = this.state.matches.slice();
      let filteredMatches = unFilteredMatches.reverse().filter(this.filterMatches);
      let scrollViewStyle = this.props.fromMatchModal? styles.scrollViewMM : styles.scrollViewMS
      let scrollViewContStyle = this.props.filter2? styles.scrollViewContainerMM : styles.scrollViewContainerMS
      if(filteredMatches.length > 0){
        let setTotals = [0,0];
        let matchTotals = [0,0];
        filteredMatches.forEach((match,index) => {
          //Ordenació i calcul de totals en cas que sigui pel H2H
          if (this.props.filter2){
            match = this.orderPlayers(match);
            for (let i = 0; i < 2; i++ ){setTotals[i] += match[2][i]};
            let iWinner = match[2].indexOf(3)
            matchTotals[iWinner] += 1
          }
          //Treure el borde de l'última fila
          let noBottomBorder = false;
          if (index == filteredMatches.length-1) {
            noBottomBorder = true;
          }
          matches.push(
            <MatchRow key={match[0]} match={match} noBottomBorder={noBottomBorder}/>
          )
        });
        matches = (
          <ScrollView style={scrollViewStyle}>
            {matches}
          </ScrollView>
        );
        //Renderitzem els totals
        if (this.props.filter2) {
          let orderedPlayers = this.orderPlayers(filteredMatches[0])[1];
          let totalSets = ["Total de jocs:",orderedPlayers,setTotals];
          let totalMatches = ["Total de partits:",orderedPlayers,matchTotals];
          totals = (
            <View key="fixed" style={styles.totalH2HView} contentContainerStyle={{justifyContent: "flex-end"}}>
              <MatchRow match={totalSets} isTotal={true}/>
              <MatchRow match={totalMatches} isTotal={true} noBottomBorder={true}/>
            </View>
          )
        }
        
      } else if (this.state.matches.length > 0){
        let noMatchesText = this.props.filter2 ? (
          "No s'han trobat partits entre:\n\n"+this.props.filter+" i "+ this.props.filter2
        ) : "No s'han trobat partits de "+this.props.filter
        matches = (
          <View style={styles.noMatchesView}>
            <Text style={styles.noMatchesText} >{noMatchesText}</Text>
          </View>
        )
      }
      
    
    return ([
      <View key="scroll" style={scrollViewContStyle}>
        {matches}
      </View>
      ,
      totals
      ]
    );
  }

  render() {

    let wrappingViewStyle = this.props.fromMatchModal ? styles.wrappingViewMM : styles.wrappingViewMS;
    return (
      <View style={wrappingViewStyle}>
        {this.renderMatches()}
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  noMatchesView: {
    paddingTop: 20,
    alignItems:"center",
    justifyContent: "center",
  },
  noMatchesText: {
    color: "black",
    fontSize: 15
  },
  wrappingViewMM: {
    flex:3,
  },
  wrappingViewMS: {
    flex: 8,
  },
  scrollViewContainerMS: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollViewContainerMM: {
    flex:1,
    paddingTop: 20,
  },
  scrollViewMS: {
    backgroundColor: "#ffffffA6",
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  scrollViewMM: {
    flex:1,
    backgroundColor: "#ffffffA6",
    paddingHorizontal: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },
  totalH2HView: {
    height: 110,
    backgroundColor: "#ffffffA6",
    marginBottom: 20,
    borderTopWidth: 3,
    borderTopColor: "black",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5
  }
});