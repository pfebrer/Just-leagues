import React, {Component} from 'react';

import { connect } from 'react-redux'
import { selectCurrentCompetition } from '../../redux/reducers'

import Groups from '../groups/Groups'
import RankingEditScreen from '../../screens/Admin/RankingEditScreen'
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from "react-native"

import Firebase from '../../api/Firebase'

import HeaderIcon from '../UX/HeaderIcon';

import { translate } from '../../assets/translations/translationWorkers'

export class NewRankingScreen extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            ranking: props.competition.getNewRanking(),
        }
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: translate("tabs.new ranking"), 
            headerRight: <HeaderIcon name="checkmark" onPress={navigation.getParam("submitNewRanking")} />
        }
    };

    componentDidMount(){

        this.props.navigation.setParams({submitNewRanking: this.submitNewRanking})
    }

    submitNewRanking = () => {

        let {gymID, id: compID} = this.props.competition

        Firebase.updateCompetitionDoc(gymID, compID, {playersIDs: this.state.ranking},
            () => {
                this.props.navigation.goBack()
            }
        )
    }

    render(){

        //if (!this.renderer) return null
        if (!this.props.competition) return null

        return (
            <View style={{backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor, flex: 1}}>
                <Groups competition={this.props.competition} groups={this.props.competition.groups} navigation={this.props.navigation}/>
                <RankingEditScreen 
                    ranking={this.state.ranking}
                    onChange={({ranking}) => this.setState({ranking})}
                    navigation={this.props.navigation}/>
            </View>

        )

    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
})

export default connect(mapStateToProps)(NewRankingScreen);

const styles = StyleSheet.create({
    matchModalContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: "#00000066",
        paddingHorizontal: 30,
        paddingBottom: 30,
        paddingTop: 50,
    },
    matchModalView: {
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderRadius: 2,
        backgroundColor: "white"
    },
    hideModalButton: {
        paddingTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    questionView: {
        justifyContent: "center",
        alignItems: "center"
    },
    questionText: {
        textAlign: "center",
        fontFamily: "bold"
    },
    addMatchText: {
        color: "green",
        fontSize: 15
    },
    dismissText: {
        color: "darkred",
        fontSize: 15
    },
});