import React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity, SectionList, Platform} from 'react-native';
import { Icon } from "native-base";
import Table from "./Table"
import { translate } from '../../assets/translations/translationWorkers';

import { GroupBet, PlayerPointsBet } from "../betting/GroupsBetting"
import MatchSummary from "../match/MatchSummary"
import ExpandableSectionList from '../UX/ExpandableSectionList'

import { totalSize } from '../../api/Dimensions';
import { sortMatchesByDate } from '../../assets/utils/utilFuncs'

import _ from "lodash"
import { elevation } from '../../assets/utils/utilFuncs'

class Group extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            expandable: false,
            expanded: false
        }
    }

    componentDidMount(){
        //This is so that first render is fast and after that we start to render the hidden parts
        //this.setState({expandable: true})
    }

    renderPlugIns = ({item, section}) => {

        if (section.key == "betting") {
            if (item == "groupBet") return <GroupBet noHeader group={this.props.group} competition={this.props.competition}/>
            else return <PlayerPointsBet playerID={item} group={this.props.group} competition={this.props.competition}/>
        }

        else if (section.key == "matches") return <MatchSummary navigation={this.props.navigation} match={item} />

    }

    render(){

        let group = this.props.group

        const sections = [
            {key: "matches", data: sortMatchesByDate(this.props.competition.getGroupMatches(group.id))},
            ...Platform.select({
                ios: [], //No betting in iOs :(
                android: [{key: "betting", data: ["groupBet", ...group.playersIDs]}]
            })
        ]

        const sectionTitles = {
            betting: translate("tabs.betting"),
            matches: translate("tabs.matches")
        }

        return <View style={{...styles.groupContainer}}>
            <TouchableOpacity onPress={() => this.setState({expandable: true, expanded: !this.state.expanded})} style={{...styles.groupTitleView}}>
                <Text style={styles.groupTitleText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
                <Icon style={styles.groupExpandingIcon} name={this.state.expanded ? "arrow-dropup" : "arrow-dropdown"}/>
            </TouchableOpacity>
            <Table
                {...group}
                competition={this.props.competition}
                navigation={this.props.navigation}
            />
            {this.state.expandable ? <View style={{height: this.state.expanded ? undefined: 0, overflow: "hidden"}}>
                <ExpandableSectionList
                    itemContainerStyle={styles.plugInItemContainer}
                    renderItem={this.renderPlugIns}
                    sectionTitles={sectionTitles}
                    sections={sections}
                />         
            </View> : null}
            
        </View>
    }

}

export default class Groups extends React.Component {

    constructor(props) {
        super(props);

    }

    renderGroup = (group) => {
         
        return <Group group={group} {...this.props}/>

    }

    render() {

        if (!this.props.groups) return <View style={{flex:1}}/>

        return (
            <FlatList 
                style={styles.scrollView} 
                ref={(scroller) => {
                    this.scroller = scroller
                }}
                data={this.props.groups}
                renderItem={({ item }) => this.renderGroup(item)}
                initialNumToRender={5}
                keyExtractor={group => group.iGroup.toString()}
                contentContainerStyle={styles.contentContainer}
                bounces={true}/>
        );

    }
}

export {Group}

const styles = StyleSheet.create({

    groupContainer : {
        ...elevation(5),
        marginVertical: 10,
        marginHorizontal: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    groupTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 10,
    },

    groupTitleText: {
        fontSize: totalSize(1.9),
        color: "black",
        fontWeight: "bold",
        flex:1
    },

    groupExpandingIcon: {
        paddingRight: 5,
        color: "#555"
    },

    loadingMessageView: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    scrollView: {
        flex: 1,
    },

    contentContainer: {
        paddingVertical: 10,
    },

    plugInsSectionList: {
        marginTop: 10
    },

    plugInSectionHeader: {
        flexDirection: "row",
        paddingVertical: 20,
        justifyContent: "center",
        alignItems: "center"
    },

    pluginSectionTitle: {
        flex: 1,
        fontFamily: "bold",
        fontSize: totalSize(1.8)
    },

    pluginSectionIcon: {

    },

    plugInItemContainer: {
        marginLeft: 5,
        paddingLeft: 10,
        borderLeftColor: "black",
        borderLeftWidth: 1,
        paddingVertical: 10,
    }
});