import React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import { translate } from '../../assets/translations/translationManager';

import { totalSize, w } from '../../api/Dimensions';

import { connect } from 'react-redux'

import { Card, Icon} from "native-base"
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { compTabBarOptions } from "../../navigation/MainTabNavigator"

class Fork extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        return (

            
            <Card style={styles.forkCard}>
                <View style={styles.forkView}>
                    <View style={{...styles.matchView, borderBottomColor: "#ccc", borderBottomWidth: 1}}>
                        <TouchableOpacity style={styles.backArrow} onPress={this.props.jumpBack}>
                            <Icon name="ios-arrow-back" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.matchInfoView}>
                            <View style={styles.playerView}>
                                <Text style={{...styles.playerText, ...styles.winnerText}}>Santiago Barneda</Text>
                                <Text style={{...styles.scoreText, ...styles.winnerText}}>3</Text>
                            </View>
                            <View style={styles.playerView}>
                                <Text style={styles.playerText}>Pol Febrer</Text>
                                <Text style={styles.scoreText}>1</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.matchView}>
                        <TouchableOpacity style={styles.backArrow} onPress={this.props.jumpBack}>
                            <Icon name="ios-arrow-back" style={styles.arrowIcon}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.matchInfoView}>
                            <View style={styles.playerView}>
                                <Text style={styles.playerText}>Josep El Haddadi</Text>
                                <Text style={styles.scoreText}>0</Text>
                            </View>
                            <View style={styles.playerView}>
                                <Text style={{...styles.playerText, ...styles.winnerText}}>Maria del Mar</Text>
                                <Text style={{...styles.scoreText, ...styles.winnerText}}>3</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.forwardArrow} onPress={this.props.jumpForward}>
                    <Icon name="ios-arrow-forward" style={styles.arrowIcon}/>
                </TouchableOpacity>
            </Card>
        );
    }
}

const FirstRound = ({route, jumpTo}) => {

    return (
        <ScrollView style={{...styles.container}}>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
            <Fork jumpBack={() => {}} jumpForward={() => jumpTo("second")}/>
        </ScrollView>
    )
    
};

const SecondRound = ({route, jumpTo}) => {

    return (
        <ScrollView style={{...styles.container}}>
            <Fork jumpBack={() => jumpTo("first")} jumpForward={() => {}}/>
            <Fork jumpBack={() => jumpTo("first")} jumpForward={() => {}}/>
            <Fork jumpBack={() => jumpTo("first")} jumpForward={() => {}}/>
            <Fork jumpBack={() => jumpTo("first")} jumpForward={() => {}}/>
            <Fork jumpBack={() => jumpTo("first")} jumpForward={() => {}}/>
        </ScrollView>
    )
    
};

const initialLayout = { width: Dimensions.get('window').width };

class Knockout extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            index: 0,
            routes: [
                { key: 'first', title: '1R' },
                { key: 'second', title: '2R' },
            ]
        }

    }

    render() {

        const renderScene = SceneMap({
            first: FirstRound,
            second: SecondRound,
        });

        return (
            <TabView
                navigationState={this.state}
                renderScene={renderScene}
                onIndexChange={(index) => this.setState({index})}
                initialLayout={initialLayout}
                swipeEnabled={false}
                renderTabBar={(props) => <TabBar {...props} {...compTabBarOptions} /> }
            />
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser || null,
    relevantUsers: state.relevantUsers,
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Knockout);

const styles = StyleSheet.create({

    container : {
        flex: 1,
        paddingHorizontal: 10
    },

    forkCard:{
        flexDirection: "row"
    },

    forkView: {
        flex: 1,
    },

    forwardArrow: {
        width: w(15),
        borderLeftColor: "#ccc",
        borderLeftWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    matchView: {
        flexDirection: "row"
    },

    backArrow: {
        width: w(15),
        justifyContent: "center",
        alignItems: "center",
        borderRightColor: "#ccc",
        borderRightWidth: 1,
        marginVertical: 10
    },

    matchInfoView: {
        flex: 1,
        paddingVertical: 5,
    },

    arrowIcon: {
        color: "#ccc"
    },

    playerView: {
        flexDirection: "row",
        paddingHorizontal: 10,
        paddingVertical: 5
    },

    playerText: {
        flex: 1,
    },

    scoreText: {

    },

    winnerText: {
        fontFamily: "bold"
    }

});