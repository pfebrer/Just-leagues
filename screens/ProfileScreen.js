import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Text,
    Animated,
    ScrollView
} from 'react-native';

import { Icon} from 'native-base';

//Redux stuff
import { connect } from 'react-redux'

import { totalSize, w, h } from '../api/Dimensions';
import { translate } from '../assets/translations/translationManager';
import Table from '../components/groups/Table';
import { USERSETTINGS } from "../constants/Settings"
import HeaderIcon from "../components/header/HeaderIcon"

class HomeScreen extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {

        this.props.navigation.setParams({backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor})

    }

    componentDidUpdate(prevProps){

        let currentbackCol = this.props.currentUser.settings["General appearance"].backgroundColor

        //Update the header color when the background color is updated :)
        if ( prevProps.currentUser.settings["General appearance"].backgroundColor !== currentbackCol){
            this.props.navigation.setParams({backgroundColor: currentbackCol})
        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                elevation: 2,
                backgroundColor: navigation.getParam("backgroundColor")
              },
            headerLeft: <HeaderIcon name="person" />,
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}} />
        }
    };

    render() {

        return (
            <ScrollView style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <View style={styles.gridRow}>
                    <Notifications/>
                </View>
                <View style={styles.gridRow}>
                    <PendingMatches/>
                </View>
                <CompetitionsState/>
            </ScrollView>
        )
    }

}

class Notifications extends Component {

    render(){

        return <Animated.View style={{...styles.gridItem, ...styles.notifications, flex: 1}}>
                    <View style={styles.itemTitleView}>
                        <Icon name="notifications" style={{...styles.titleIcon,color: "green"}}/>
                        <Text style={{...styles.titleText, color: "green", fontFamily: "bold"}}>{translate("vocabulary.notifications")}</Text>
                    </View>
                    <Text>Et reclamen com a jugador de la lliga del nick!</Text>

                </Animated.View>
    }
}

class PendingMatches extends Component {

    render(){

        return <Animated.View style={{...styles.gridItem, flex: 1}}>
                    <View style={styles.itemTitleView}>
                        <Icon name="time" style={styles.titleIcon}/>
                        <Text style={styles.titleText}>{translate("vocabulary.pending matches")}</Text>
                    </View>
                    <Text>No tens cap partit pendent. Pots relaxar-te :)</Text>
                </Animated.View>
    }
}

class CompetitionsState extends Component {

    render(){

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
        )
    }
}


const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(HomeScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
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

    notifications: {
        backgroundColor: "lightgreen"
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