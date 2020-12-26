import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    View
} from 'react-native';
import { Text } from 'native-base';

//Redux stuff
import { connect } from 'react-redux'

import HeaderIcon from "../components/UX/HeaderIcon"

import { elevation } from '../assets/utils/utilFuncs'

import _ from "lodash"
import { selectSuperChargedCompetitions } from '../redux/reducers';
import { selectUserSetting } from '../redux/reducers';
import Firebase from '../api/Firebase';
import CompSummary from '../components/competition/CompSummary';


class SearchScreen extends Component {

    constructor(props){
        super(props)

        this.state = {
            competitions: [],
            gyms: []
        }
    }

    componentDidMount(){

        Firebase.onAllCompetitionsSnapshot( competitions => {
            this.setState({competitions: competitions})
        })
        
        Firebase.onGymsSnapshot(gyms => this.setState({gyms}))
    }

    render() {

        const competitions = this.state.competitions

        return (
            <ScrollView 
                style={{...styles.container, backgroundColor: this.props.backgroundColor}}
                contentContainerStyle={{paddingVertical: 10}}>

                {competitions.map(competition => 
                    <CompSummary competition={competition} gyms={this.state.gyms} navigation={this.props.navigation}/>
                )}

            </ScrollView>
        )
    }

}

const mapStateToProps = state => ({
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor"),
    competitions: selectSuperChargedCompetitions(state)
})

export default connect(mapStateToProps)(SearchScreen);

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 10,
    },

});