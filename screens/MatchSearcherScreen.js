import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import MatchFilter from "../components/matchSearcher/MatchFilter"
import MatchHistory from "../components/matchSearcher/MatchHistory"
import { USERSETTINGS } from "../constants/Settings"

import { connect } from 'react-redux'

class MatchSearcher extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filter: false,
            filter2: false
        };
    }

    applyFilter = (filter, clearInput) => {
        if (this.state.filter && filter || this.state.filter2 && !filter) {
            this.setState({
                filter2: filter
            })
        } else {
            this.setState({filter})
        }
        clearInput();
    }

    render() {
        return (
            <View style={{...styles.container, backgroundColor: this.props.currentUser.settings["General appearance"].backgroundColor}}>
                <MatchFilter filter={this.state.filter} filter2={this.state.filter2} applyFilter={this.applyFilter}
                                filterApplied={this.filterApplied}/>
                <MatchHistory filter={this.state.filter} filter2={this.state.filter2}/>
            </View>
        );
    }
}

const mapStateToProps = state => ({
    currentUser: state.currentUser,
})

export default connect(mapStateToProps)(MatchSearcher);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: USERSETTINGS["General appearance"].backgroundColor.default,
    },
});