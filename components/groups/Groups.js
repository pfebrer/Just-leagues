import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import Table from "./Table"
import Firebase from "../../api/Firebase"
import { translate } from '../../assets/translations/translationManager';

//Redux stuff
import { connect } from 'react-redux'

class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            groups: [],
        };

    }

    componentDidMount() {

        let {gymID, sportID} = this.props.competition

        this.groupsSub = Firebase.groupsRef(gymID,sportID).onSnapshot((querySnapshot) => {
            
            let groups = querySnapshot.docs.map((group) => {
                let {results} = group.data()
                return {group: Number(group.id), results: results}
            });

            groups = groups.sort((a,b) => a.group - b.group)

            this.setState({groups})

            this.props.returnGroups(groups)
        })

    }

    componentWillUnmount() {
        //Dessubscribirse dels listeners
        this.groupsSub();
    }

    renderGroups = (groups) => {

        return groups.map( (group) => (

            <View style={{...styles.groupContainer}}>
                <View style={styles.groupTitle}>
                    <Text style={styles.groupTitleText}> {(translate("vocabulary.group") + " " + iGroup).toUpperCase()}</Text>
                </View>
                <Table
                    containerStyles={styles.groupContainer}
                    key={"Group" + String(group.group)} 
                    iGroup={group.group} 
                    groupResults={group.results}
                    goToUserProfile={this.props.goToUserProfile} 
                    handlePress={this.props.handlePress}
                />
            </View>
        
        ))

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
                {this.renderGroups(this.state.groups)}
            </ScrollView>
        );
    }
}

const mapStateToProps = state => ({
    competition: state.competition
})

export default connect(mapStateToProps)(Groups);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        marginBottom: 50
    },

    groupContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex:1,
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
    },
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