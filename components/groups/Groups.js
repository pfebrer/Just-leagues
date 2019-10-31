import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import Table from "./Table"
import Firebase from "../../api/Firebase"
import { translate } from '../../assets/translations/translationManager';

//Redux stuff
import { connect } from 'react-redux'
import { totalSize } from '../../api/Dimensions';

class Groups extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            groups: [],
        };

    }

    componentDidMount() {

        let {gymID, id : compID} = this.props.competition

        this.groupsSub = Firebase.onGroupsSnapshot(gymID, compID, 
            
            groups => this.setState({groups})

        );

    }

    componentDidUpdate(prevProps){

        if ( (!prevProps.competition && this.props.competition) || (prevProps.competition.id != this.props.competition.id) ){

            if (this.groupsSub) this.groupsSub();

            let {gymID, id : compID} = this.props.competition

            this.groupsSub = Firebase.onGroupsSnapshot(gymID, compID, 
                
                groups => this.setState({groups})

            );
        }
    }

    componentWillUnmount() {
        //Dessubscribirse dels listeners
        this.groupsSub();
    }

    renderGroups = (groups) => {

        return groups.map( (group) => (

            <View key={group.iGroup} style={{...styles.groupContainer}}>
                <View style={{...styles.groupTitleView}}>
                    <Text style={styles.groupTitleText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
                </View>
                <Table
                    {...group}
                    competition={this.props.competition}
                    navigation={this.props.navigation}
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

    groupContainer : {
        elevation: 5,
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    groupTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 10,
    },

    groupTitleText: {
        fontSize: totalSize(1.9),
        color: "black",
        fontWeight: "bold"
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