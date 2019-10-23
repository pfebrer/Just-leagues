import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Text,
    Animated,
    ScrollView
} from 'react-native';
import Groups from "../components/groups/Groups"
import Challenges from "../components/Challenges"
import AddMatchModal from "../components/AddMatchModal"
import AdminAddMatchModal from "../components/AdminAddMatchModal"
import Firebase from "../api/Firebase"

import { Icon} from 'native-base';

//Redux stuff
import { connect } from 'react-redux'

import { totalSize, w, h } from '../api/Dimensions';
import { translate } from '../assets/translations/translationManager';
import Table from '../components/groups/Table';
import { USERSETTINGS } from "../constants/Settings"

class HomeScreen extends React.Component {

    constructor(props) {
        super(props);
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                elevation: 2,
                backgroundColor: USERSETTINGS.generalAppearance.backgroundColor.default
              },
            headerLeft: <TouchableOpacity onPress={() => {}}>
                            <Icon name="person" style={{ paddingLeft: 20 }} />
                        </TouchableOpacity>, 
            headerRight: <TouchableHighlight onPress={() => {navigation.navigate("SettingsScreen")}}>
                            <Icon name="settings" style={{ paddingRight: 20 }} />
                        </TouchableHighlight>
        }
    };

    render() {

        let groupResults =[
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, 5,false,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [3, false,false,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,false,6,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,2,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,2,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,2,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,2,false,false,false,false,false],
                total: 5,
            },
            {
                name: "David Febrer",
                rank: 1,
                scores: [false, false,2,false,false,false,false,false],
                total: 5,
            },
        ]

        return (
            <ScrollView style={styles.container}>
                <View style={styles.gridRow}>
                    <Animated.View style={{...styles.gridItem, flex: 2}}>
                        <View style={styles.itemTitleView}>
                            <Icon name="person" style={styles.titleIcon}/>
                            <Text style={styles.titleText}>{translate("tabs.ranking")}</Text>
                        </View>

                    </Animated.View>
                    <View style={{...styles.gridItem, flex: 1}}>

                    </View>
                </View>
                <View style={styles.gridRow}>
                    <Animated.View style={{...styles.gridItem, flex: 1}}>
                        <TouchableOpacity style={{flex: 1}} onPress={this.changeFlex}>
                            <View style={{...styles.itemTitleView}}>
                                <Icon name="trophy" style={styles.titleIcon}/>
                                <Text style={styles.titleText}>{translate("vocabulary.group") + " 1"}</Text>
                            </View>
                            <View>
                                <Table
                                    iGroup={1}
                                    groupResults={groupResults}
                                    containerStyles={styles.groupContainer}
                                />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                    
                </View>

            </ScrollView>
        )
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser
})

export default connect(mapStateToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: USERSETTINGS.generalAppearance.backgroundColor.default
    },

    gridRow: {
        flexDirection: "row",
        marginVertical: 10
    },

    gridItem : {
        elevation: 5,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    itemTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 20,
    },

    titleIcon: {
        paddingRight: 15,
        color: "gray"
    },

    titleText: {
        fontSize: totalSize(1.8),
        color: "gray"
    },

});