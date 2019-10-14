import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import Table from "./Table"
import Firebase from "../api/Firebase"
import {Collections} from "../constants/CONSTANTS";

export default class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            groupsResults: false,
            renderedGroups: []
        };
        this.groupsRef = Firebase.firestore.collection(Collections.GROUPS);
    }

    componentDidMount() {

        this.unsub = this.groupsRef.onSnapshot((querySnapshot) => {
            let groups = [];
            querySnapshot.forEach((group) => {
                if (/^\d+$/.test(group.id)) {
                    let {results} = group.data()
                    groups.push(results)
                }
            });

            this.setState({
                groupsResults: groups
            })
            this.props.returnGroups(groups)
        })

        /*this.rankingsRef.doc("squashRanking").set({
          ranking: ["David Febrer","Pol Febrer","Albert Robleda","Dani Ramírez","Óliver Haldon","Laszlo Kubala","Quim Martínez","Martín Sombra","Miguel Aranda","Pol Rami","Marc Sabadell","David Biern","Ángel González","David Ordeig","Quim Torrents","Miquel Juan","Jan González","Xavier Rami","Maribel Calabozo","Enric Calafell","Carlos Tomás","Robert del Canto","Claudio Sánchez","Guilleume","Álex Miravalles","August Tanari","Víctor Uruel","Javier Artigas","Joseph Uguet","Javi Hernando","Sergio Uruel","Gerard Torres"]
        })*/
        /*for ( let i = 0; i < 8; i++) { 
        this.groupsRef.doc(String(i+1)).set({
          results: [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
        })
        }*/
        /*Firebase.firestore.collection(Collections.PLAYERS).get().then((snapShot) => {
          snapShot.forEach((playerdoc)=>{
            let {playerName} = playerdoc.data();
            let position = this.props.ranking.indexOf(playerName)
            Firebase.firestore.collection(Collections.PLAYERS).doc(playerdoc.id).set({
              currentGroup: Math.trunc(position/4)+1
              //currentGroup: "Reptes"
            },{merge: true})
  
          })
        }).catch(err => alert(err.message))*/
    }

    componentWillUnmount() {
        //Dessubscribirse dels listeners
        this.unsub();
    }

    componentDidUpdate(prevProps, prevState) {
        function areEqual(a1, a2) {
            return JSON.stringify(a1) == JSON.stringify(a2);
        }

        if (!areEqual(this.props.ranking, prevProps.ranking) || !areEqual(this.state.groupsResults, prevState.groupsResults)) {
            let position = 0;
            if (!this.props.ranking) {
                return [];
            }
            let ranking = this.props.ranking.map((playerName) => {
                position += 1;
                return [position, playerName]
            });
            let groupsResults = this.state.groupsResults;
            let groups = [];
            let iGroup = 0;
            let isNextGroup = true;
            if (groupsResults.length > 0) {
                while (isNextGroup) {
                    iGroup += 1;
                    let nPlayers = 0;
                    if (ranking.length > 6) {
                        nPlayers = 4;
                    } else {
                        nPlayers = ranking.length;
                        isNextGroup = false;
                    }
                    let group = ranking.slice(0, nPlayers);
                    let groupResults = groupsResults[iGroup - 1];
                    groups.push(<Table key={"Group" + String(iGroup)} group={group} iGroup={iGroup}
                                       groupResults={groupResults} handlePress={this.props.handlePress}/>)
                    ranking = ranking.slice(nPlayers, ranking.length)
                }

            }

            this.setState({
                renderedGroups: groups,
                shouldRenderGroups: false
            });
        }
        ;

    }

    render() {

        if (this.state.renderedGroups.length == 0) {
            return (
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <Text>Carregant classificacions</Text>
                    <ActivityIndicator size="large"/>
                </View>
            );
        }
        return (
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} ref={(scroller) => {
                    this.scroller = scroller
                }} bounces={true}>
                    {this.state.renderedGroups}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30
    },
    loadingMessageView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 20
    }
});