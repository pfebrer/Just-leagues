import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import Table from "./Table"
import Firebase from "../api/Firebase"
import {Collections} from "../constants/CONSTANTS";
import { translate } from '../assets/translations/translationManager';
import SETTINGS from '../constants/Settings';

export default class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            groupsResults: false,
            renderedGroups: []
        };

    }

    componentDidMount() {

        this.groupsSub = Firebase.groupsRef.onSnapshot((querySnapshot) => {
            
            let groupsResults = querySnapshot.docs.map((group) => {
                if (/^\d+$/.test(group.id)) {
                    let {results} = group.data()
                    return results
                }
            });

            this.setState({groupsResults})

            this.props.returnGroups(groupsResults)
        })

    }

    componentWillUnmount() {
        //Dessubscribirse dels listeners
        this.groupsSub();
    }

    renderGroups = (groupsResults) => {

        return groupsResults.map( (groupResults, index) => {
            return <Table key={"Group" + String(index + 1)} group={[[1, "Pol"],[2,"Josep"],[3,"Robert"],[4, "Amadeu"]]} iGroup={index + 1}
            groupResults={groupResults} handlePress={this.props.handlePress}/>
        })

    }
    

    render() {

        if (this.state.groupsResults == 0) {
            return (
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <Text>{translate("info.loading classifications")}</Text>
                    <ActivityIndicator size="large"/>
                </View>
            );
        }

        return (
            <ScrollView 
                style={styles.scrollView} 
                ref={(scroller) => {
                    this.scroller = scroller
                }}
                contentContainerStyle={styles.contentContainer}
                bounces={true}>
                {this.renderGroups(this.state.groupsResults)}
            </ScrollView>
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
    },

    contentContainer: {
        paddingTop: 30,
    }
});


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