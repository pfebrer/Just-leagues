import React, {Component} from 'react';

import { connect } from 'react-redux'
import { selectCurrentCompetition } from '../../redux/reducers'


import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from "react-native"

import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { translate } from "../../assets/translations/translationManager"
import { compTabBarOptions } from "../../navigation/MainTabNavigator"

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


        this.state = {
            index: 0,
            routes: [
                { key: 'main', title: translate("tabs.competition overview") },
                { key: 'matches', title: translate("tabs.matches") },
                { key: 'stats', title: translate("tabs.stats") },
                //{ key: 'betting', title: translate("tabs.betting")},
            ]
        }

    }

    componentDidMount(){
        
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
                case 'betting':
                    let {Component, props} = this.props.competition.renderCompBetting()
                    return <Component {...props}/>;
                default:
                    return null;
            }
          };

        return (
            <View style={{backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor, flex: 1}}>
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
})

export default connect(mapStateToProps)(CompetitionScreen);