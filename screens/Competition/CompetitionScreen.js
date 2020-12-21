import React, {Component} from 'react';

import { connect } from 'react-redux'
import { selectCurrentCompetition } from '../../redux/reducers'


import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from "react-native"

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { translate } from "../../assets/translations/translationWorkers"
import { compTabBarOptions } from "../../navigation/MainTabNavigator"
import { selectUserSetting } from '../../redux/reducers';

const initialLayout = { width: Dimensions.get('window').width };

class CompetitionScreen extends Component {

    /* this.props.what determines the content of the component.
    This two static properties determines the functions to be called in each case */
    get listener(){

        const comp = this.props.competition

        const listeners = {
            main: comp.compScreenListener,
            compState: comp.compStateListener,
            matches: comp.compMatchesListener,
            stats: comp.compStatsListener
        }

        return listeners[this.props.what]
    }

    get renderer (){

        const comp = this.props.competition

        const renderFuncs = {
            main: comp.renderCompScreen,
            compState: comp.renderCompState,
            matches: comp.renderCompMatches,
            stats: comp.renderCompStats
        }

        return renderFuncs[this.props.what]
        
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: navigation.getParam("competitionName", ""),
        }
    };

    constructor(props){
        super(props);

        this.tabKeys = ['main', 'matches', 'stats']

        //const startIndex = this.tabKeys.indexOf(props.navigation.getParam("tab", "main"))

        this.state = {
            index: 0,
            routes: [
                { key: this.tabKeys[0], title: translate("tabs.competition overview") },
                { key: this.tabKeys[1], title: translate("tabs.matches") },
                { key: this.tabKeys[2], title: translate("tabs.stats") }
                //{ key: 'betting', title: translate("tabs.betting")},
            ]
        }

    }

    render(){

        //if (!this.renderer) return null
        if (!this.props.competition) return null

        //return this.renderer(this.state, this.props)

        const renderScene = ({ route }) => {
            switch (route.key) {
                case 'main':
                    return this.props.competition.renderCompScreen({navigation: this.props.navigation});
                case 'matches':
                    return this.props.competition.renderCompMatches({navigation: this.props.navigation});
                case 'stats':
                    return this.props.competition.renderCompStats({navigation: this.props.navigation});
                default:
                    return null;
            }
        };

        return (
            <View style={{backgroundColor: this.props.backgroundColor, flex: 1}}>
                <TabView
                    lazy
                    navigationState={this.state}
                    renderScene={renderScene}
                    onIndexChange={(index) => this.setState({index})}
                    initialLayout={initialLayout}
                    swipeEnabled={true}
                    renderTabBar={(props) => <TabBar {...props} scrollEnabled {...compTabBarOptions} /> }
                />
            </View>
            
        )

    }
    
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
    competition: selectCurrentCompetition(state),
    backgroundColor: selectUserSetting(state, "General appearance", "backgroundColor")
})

export default connect(mapStateToProps)(CompetitionScreen);