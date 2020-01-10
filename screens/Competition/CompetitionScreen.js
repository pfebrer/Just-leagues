import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text} from 'react-native';

import HeaderIcon from "../../components/header/HeaderIcon"
import { translate } from "../../assets/translations/translationManager"

import { USERSETTINGS} from "../../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'

class CompetitionScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: <HeaderIcon name="arrow-back" onPress={navigation.pop}/>,
            headerTitle: navigation.getParam("competitionName", ""),
            headerRight: <HeaderIcon name="menu" onPress={navigation.openDrawer}/>
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
                <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
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

});