import React from 'react';
import {Button, FlatList, ImageBackground, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Loading from "../Loading";
import {CONSTANTS} from "../../constants/CONSTANTS";
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
        this.rankingsRef = firestore().collection(CONSTANTS.RANKINGS).doc(CONSTANTS.SQUASH_RANKING);
        // this.rankingsRef.get().then((snapshot) => {
        //     let r = snapshot.data().ranking
        //     this.setState({
        //         ranking: r,
        //         isLoading: false
        //     });
        // });
    }

    componentDidMount() {
        this.ranking = this.rankingsRef.onSnapshot((docSnapshot) => {
            const {ranking} = docSnapshot.data();
            this.setState({ranking});
            this.setState({isLoading: false});
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        debugger;
        console.log("EditRankingScreen::component updated", prevProps, prevState, snapshot);
    }

    renderRow(player, ranking) {
        let rankingPos = ranking.indexOf(player) + 1;

        let onBtnPress = (player) => {
            alert("soc el player:" + player)
        };
        return (
            <TouchableHighlight
                underlayColor='rgba(192,192,192,1,0.6)'
                onPress={() => onBtnPress(player)}>
                <View style={styles.row}>
                    <View style={styles.rowPosition}>
                        <Text style={styles.positionText}>[ {rankingPos} ]</Text>
                    </View>
                    <View style={styles.rowPlayerName}>
                        <Text style={styles.playerText}> {player} </Text>
                    </View>
                    <TouchableHighlight style={styles.rowDelBtn} onPress={() => onBtnPress(player)}>
                        <Foundation name="skull"/>
                    </TouchableHighlight>
                    <Button
                        large
                        icon={{name: 'skull', type: 'foundation'}}
                        onPress={() => onBtnPress(player)}
                    />
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
            view = <FlatList data={this.state.ranking} renderItem={(player) => {
                return this.renderRow(player, this.state.ranking);
            }}/>
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
    },
    row: {flex: 1, flexDirection: 'row'},
    rowPosition: {},
    positionText: {},
    rowPlayerName: {},
    playerText: {}
});