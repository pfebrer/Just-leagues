import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text} from 'react-native';

import HeaderIcon from "../components/header/HeaderIcon"
import { translate } from "../assets/translations/translationManager"

import { USERSETTINGS} from "../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'

class CompetitionScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};

        props.navigation.setParams({competitionName: props.competition.name})

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.getParam("competitionName", ""),
            headerRight: <HeaderIcon name="settings" onPress={() => {navigation.navigate("SettingsScreen")}}/>
        }
    };

    componentDidMount(){

        this.setUpCompetition()

    }

    setUpCompetition = () => {

        this.props.navigation.setParams({competitionName: this.props.competition.name})

        if (this.listener) this.listener();

        this.listener = this.props.competition.compScreenListener(
            listenerResult => this.setState({listenerResult})
        );
    }

    componentWillUnmount(){
        if (this.listener) this.listener()
    }

    componentDidUpdate(prevProps){

        if (!prevProps.competition || prevProps.competition.name != this.props.competition.name){
            this.setUpCompetition()
        }
        
    }

    render() {

        if (!this.state.listenerResult) {
            return (
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    <Text>{translate("info.loading classifications")}</Text>
                    <ActivityIndicator size="large" color="black"/>
                </View>
            );
        }

        return <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                    {this.props.competition.renderCompScreen({navigation: this.props.navigation, listenerResult: this.state.listenerResult})}
                </View>
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: state.competition
})

export default connect(mapStateToProps)(CompetitionScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

    addMatchButton: {
        position: "absolute",
        left: 0,
        top: 0,
        height: 90,
        paddingBottom: 10,
        width: 90,
        paddingRight: 15,
        alignItems: "center",
        justifyContent: "center",
        borderBottomRightRadius: 90,
        borderRightWidth: 10,
        borderBottomWidth: 10,
        backgroundColor: "green",
        borderColor: "#00ff0033"
    },

    editCompButton: {
        position: "absolute",
        right: 0,
        top: 0,
        height: 90,
        paddingBottom: 10,
        width: 90,
        paddingLeft: 15,
        alignItems: "center",
        justifyContent: "center",
        borderBottomLeftRadius: 90,
        borderLeftWidth: 10,
        borderBottomWidth: 10,
        backgroundColor: "gray",
        borderColor: "#00333333"
    },

    addMatchText: {
        color: "white",
        fontSize: 35
    }
});