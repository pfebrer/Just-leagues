import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text} from 'react-native';

import HeaderIcon from "../../components/header/HeaderIcon"
import { translate } from "../../assets/translations/translationManager"

import { USERSETTINGS} from "../../constants/Settings"

//Redux stuff
import { connect } from 'react-redux'
import { selectCurrentCompetition } from '../../redux/reducers'

import CompetitionComponent from '../../components/competition/CompetitionComponent';

class CompetitionScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};

        props.navigation.setParams({competitionName: props.competition.name})

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: <HeaderIcon name="arrow-back" onPress={navigation.pop}/>,
            headerTitle: navigation.getParam("competitionName", ""),
            headerRight: <HeaderIcon name="menu" onPress={navigation.openDrawer}/>
        }
    };

    /*componentDidMount(){

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
        
    }*/

    render() {

        return <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                    <CompetitionComponent what="stats" competition={this.props.competition}  navigation={this.props.navigation}/>
                </View>
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
})

export default connect(mapStateToProps)(CompetitionScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default
    },

});