import React from 'react';
import {FlatList, ImageBackground, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Loading from "../Loading";
import {Collections, CONSTANTS, Documents} from "../../constants/CONSTANTS";
import {firestore} from "firebase";
import {Foundation} from '@expo/vector-icons';


export default class EditRankingScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ranking: [],
            spinner: false,
            isLoading: true
        };
        this.rankingsRef = firestore().collection(Collections.RANKINGS).doc(Documents.RANKINGS.squashRanking);
        // this.rankingsRef.get().then((snapshot) => {
        //     let r = snapshot.data().ranking
        //     this.setState({
        //         ranking: r,
        //         isLoading: false
        //     });
        // });
        let aa = firestore().collection(Collections.RANKINGS).onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((snapshotChanges) => {
                console.log("EditRankingScreen::changeScanner ", snapshotChanges.doc.data());
                this.setState({ranking: snapshotChanges.doc.data().ranking});
            });

        });
    }

    componentDidMount() {

        this.ranking = this.rankingsRef.onSnapshot((docSnapshot) => {

            const {ranking} = docSnapshot.data(); //["Fabià Figueras","Enric Calafell",""]
            this.setState({ranking});
            this.setState({isLoading: false});
        });

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        debugger;
        console.log("EditRankingScreen::component updated", prevProps, prevState, snapshot);
    }

    renderRow(player, position, ranking) {
        let rankingPos = ranking.indexOf(player) + 1;
        console.log("EditRankingScreen::renderRow player[" + player + "] rankingPos[" + rankingPos + "] position[" + position + "]")
        let onBtnPress = (player) => {
            alert("soc el player:" + player)
        };
        return (
            <TouchableHighlight
                underlayColor='rgb(192,192,192)'
                onPress={() => onBtnPress(player)} style={styles.row}>
                <View style={styles.row}>
                    <View style={styles.rowPosition}>
                        <Text style={styles.positionText}> {rankingPos} </Text>
                    </View>
                    <View style={styles.rowPlayerName}>
                        <Text style={styles.playerText}> {player} </Text>
                    </View>
                    <TouchableHighlight style={styles.rowDelBtn} onPress={() => onBtnPress(player)}>
                        <Foundation name="skull" size={32} color="green"/>
                    </TouchableHighlight>
                </View>
            </TouchableHighlight>
        )
    }


    render() {
        let view = null;
        let bgAsset = require("../../assets/images/loginBG2.jpg");
        if (this.state.isLoading) {
            view = (<Loading checkUser={false} msg={"Carregant ranking"} bg={bgAsset}/>);
        } else {

            view =
                <View style={styles.container}>
                    <View style={[styles.row, styles.header]}>
                        <View style={styles.rowPosition}>
                            <Text style={styles.positionText}>Position</Text>
                        </View>
                        <View style={styles.rowPlayerName}>
                            <Text style={styles.playerText}>PlayerName</Text>
                        </View>
                        <View style={styles.rowDelBtn}>
                            <Text style={styles.delBtnText}>Options</Text>
                        </View>
                    </View>

                    <FlatList data={this.state.ranking} renderItem={(playerItem) => {
                        console.log("Rendering player", playerItem.item, playerItem.index);
                        return this.renderRow(playerItem.item, playerItem.index, this.state.ranking);
                    }} style={styles.flatList}/>
                </View>
        }
        return (

            <ImageBackground style={{flex: 1}} source={bgAsset}>
                <View style={styles.container}>
                    {view}
                </View>
            </ImageBackground>

        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30
    },
    header: {
        flex: 1,
        height: 45,
        paddingTop: 30,
        flexDirection: 'row'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        height: 45,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        backgroundColor: 'rgba(255,255,255,0.5)'
    },
    rowPosition: {
        width: 30,
        alignItems: "center",
        justifyContent: "center"
    },
    positionText: {
        flex: 1,
        fontWeight: 'bold',
        alignItems: 'center'
    },
    rowDelBtn: {
        width: 30,
        marginRight: 10,
        alignItems: "flex-end"
    },
    rowPlayerName: {
        flex: 1,
        alignItems: "flex-start",
        alignContent: 'center',
        justifyContent: "center",
        backgroundColor: 'red'
    },
    playerText: {
        flex: 1,
        backgroundColor: 'pink'
    },
    flatList: {}
});