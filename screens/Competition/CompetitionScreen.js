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

        this.setUpCompetition()
        
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.getParam("competitionName", ""),
        }
    };

    setUpCompetition = () => {

        this.props.navigation.setParams({competitionName: this.props.competition.name})

    }

    componentDidUpdate(prevProps){

        if (!prevProps.competition || prevProps.competition.name != this.props.competition.name){
            this.setUpCompetition()
        }
        
    }

    render() {

        return <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                    <CompetitionComponent what="main" competition={this.props.competition}  navigation={this.props.navigation}/>
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