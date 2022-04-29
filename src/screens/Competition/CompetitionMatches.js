import React from 'react';
import { StyleSheet, View} from 'react-native';

//Redux stuff
import { connect } from 'react-redux'
import { selectCurrentCompetition, selectUserSetting } from '../../redux/reducers'

import CompetitionComponent from './CompetitionScreen';

class CompetitionMatches extends React.Component {

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

        /*if (!this.state.listenerResult) {
            return (
                <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                    <Text>{translate("info.loading classifications")}</Text>
                    <ActivityIndicator size="large" color="black"/>
                </View>
            );
        }*/

        return <View style={{...styles.container, backgroundColor: this.props.backgroundColor}}>
                    <CompetitionComponent what="matches" competition={this.props.competition}  navigation={this.props.navigation}/>
                </View>
    }

}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor")
})

export default connect(mapStateToProps)(CompetitionMatches);

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

});