import React from 'react';
import {FlatList, ImageBackground, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Loading from "../Loading";
import {Collections, Documents} from "../../constants/CONSTANTS";
import {auth, firestore} from "firebase";
import {Foundation, MaterialIcons, Entypo} from '@expo/vector-icons';


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

        firestore().collection(Collections.PLAYERS).doc(auth().currentUser.uid).get().then((docSnapshot) => {
            let {playerName, admin} = docSnapshot.data();
            this.setState({playerName, admin});
        }).catch(err => {
            alert("No s'ha pogut carregar la informació de l'usuari", err);
        });
        firestore().collection(Collections.RANKINGS).onSnapshot((snapshot) => {
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
        //debugger;
        //console.log("EditRankingScreen::component updated", prevProps, prevState, snapshot);
    }

    onBtnDelPress(player) {
        alert("Eliminar el player:" + player);
    };

    onBtnEditPress(player) {
        alert("EDITAR player " + player);
    };

    onBtnAddPress() {
        alert("CREATE new player ");
    };

    onBtnPress = (player) => {
        alert("soc el player:" + player);
    };

    iconSize = 30;
    iconColor = '#515054'

    renderRow(player, position, ranking) {
        let rankingPos = ranking.indexOf(player) + 1;
        //console.log("EditRankingScreen::renderRow player[" + player + "] rankingPos[" + rankingPos + "] position[" + position + "]")
        let adminOptions = null;
        if (this.state.admin) {
            adminOptions = (<View style={[styles.centered, styles.containerBTNS]}>
                <TouchableHighlight style={[styles.btn]}
                                    onPress={() => this.onBtnEditPress(player)} underlayColor='rgb(192,192,192)'>
                    <MaterialIcons name="reorder" size={this.iconSize} color="{iconColor}"/>
                </TouchableHighlight>

                <TouchableHighlight style={[styles.btn]}
                                    onPress={() => this.onBtnDelPress(player)} underlayColor='rgb(192,192,192)'>
                    <Entypo name="cross" size={this.iconSize} color="{iconColor}"/>
                </TouchableHighlight>
            </View>)
        }
        return (
            <TouchableHighlight
                underlayColor='rgb(192,192,192)'
                onPress={() => this.onBtnPress(player)} style={styles.row}>
                <View style={styles.row}>
                    <View style={[styles.centered, styles.cellBorderRight, styles.containerPosition]}>
                        <Text style={[styles.fontBold, styles.positionText]}> {rankingPos} </Text>
                    </View>
                    <View style={[styles.centered, styles.cellBorderRight, styles.containerPlayerName]}>
                        <Text style={[styles.playerText]}> {player} </Text>
                    </View>
                    {adminOptions}
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
            let adminOptions = null;
            if (this.state.admin) {
                adminOptions = (<View style={[styles.centered, styles.containerBTNS]}>
                    <TouchableHighlight style={[styles.btn]}
                                        onPress={this.onBtnAddPress} underlayColor='rgb(192,192,192)'>
                        <MaterialIcons name="add-circle" size={this.iconSize} color="{iconColor}"/>
                    </TouchableHighlight>
                </View>)
            }
            view =
                <View style={styles.container}>
                    <View style={[styles.row, styles.header]}>
                        <View style={[styles.centered, styles.cellBorderRight, styles.containerPosition]}>
                            <View style={[styles.centered, styles.containerPositionInner]}>
                                <Text style={[styles.fontBold, styles.centered, styles.positionText,{alignSelf: 'stretch'}]}>POS</Text>
                            </View>
                        </View>
                        <View style={[styles.centered, styles.cellBorderRight, styles.containerPlayerName,{alignSelf: 'stretch'}]}>
                            <View style={[styles.centered,{alignSelf: 'stretch'}]}>
                                <Text style={[styles.fontBold, styles.playerText]}>Jugador</Text>
                            </View>
                        </View>
                        {adminOptions}
                    </View>
                    <View style={[styles.playerList]}>
                        <FlatList data={this.state.ranking} renderItem={(playerItem) => {
                            console.log("Rendering player", playerItem.item, playerItem.index);
                            return this.renderRow(playerItem.item, playerItem.index, this.state.ranking);
                        }} style={styles.flatList}/>
                    </View>
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
        paddingTop: 10
    },
    //Block Config
    header: {
        flex: 0
    },
    playerList: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    //ROW CONFIG
    row: {
        flexDirection: 'row',
        height: 35,
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#8a8a8a',
        backgroundColor: 'rgba(255,255,255,0.6)'
    },
    //CONTAINERS CONFIG
    centered: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    containerPosition: {
        width: 50,
        flexDirection: 'row'
    },
    containerPositionInner: {
        flex: 1,
        marginLeft: 12.5
    },
    containerPlayerName: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerBTNS: {
        //width: 100
        flexDirection: 'row'
    },
    cellBorderRight: {
        borderRightColor: 'black',
        borderRightWidth: 1
    },

    // TEXT FORMAT
    positionText: {
        // flex: 1,
    },
    playerText: {
        //flex: 1
    },
    btn: {
        width: 30,
        marginRight: 10,
        alignItems: "flex-end"
    },
    fontBold: {
        fontWeight: 'bold'
    }
});