import React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity, SectionList} from 'react-native';
import { Icon } from "native-base";
import Table from "./Table"
import { translate } from '../../assets/translations/translationManager';

import { GroupBet } from "../../components/groups/GroupsBetting"
import MatchSummary from "../match/MatchSummary"

import { totalSize } from '../../api/Dimensions';

import _ from "lodash"
import { elevation } from '../../assets/utils/utilFuncs'

class Group extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            expandable: false,
            expanded: false,
            expandedSection: {}
        }
    }

    componentDidMount(){
        //This is so that first render is fast and after that we start to render the hidden parts
        this.setState({expandable: true})
    }

    renderPlugIns = ({item, section}) => {

        const heightStyle = this.state.expandedSection[section.key] ? {} : {height:0, margin: 0, padding: 0, overflow: "hidden"}

        let content = null

        if (item == "groupBet") { content = <GroupBet noHeader group={this.props.group} competition={this.props.competition}/>}

        else if (section.key == "matches") { content = <MatchSummary match={item} /> } 

        return <View style={{ ...styles.plugInItemContainer, ...heightStyle}}>{content}</View>
    }

    renderHeaders = ({section}, sectionTitles) => {

        return(
        <TouchableOpacity
            style={styles.plugInSectionHeader}
            onPress={() => this.setState({expandedSection: {...this.state.expandedSection, [section.key]: !this.state.expandedSection[section.key]}})}>
            <Text style={styles.pluginSectionTitle} >{sectionTitles[section.key]}</Text>
            {this.state.expandedSection[section.key]
                    ? <Icon style={{ fontSize: 18 }} name="remove-circle" />
                    : <Icon style={{ fontSize: 18 }} name="add-circle" />}
        </TouchableOpacity>
        )
    }

    render(){

        let group = this.props.group

        const sections = [
            {key: "betting", data: ["groupBet"]},
            {key: "matches", data: this.props.competition.getGroupMatches(group.id)}
        ]

        const sectionTitles = {
            betting: translate("tabs.betting"),
            matches: translate("tabs.matches")
        }

        return <View style={{...styles.groupContainer}}>
            <TouchableOpacity onPress={() => this.setState({expanded: !this.state.expanded})} style={{...styles.groupTitleView}}>
                <Text style={styles.groupTitleText}>{translate("vocabulary.group") + " " + (group.name)}</Text>
            </TouchableOpacity>
            <Table
                {...group}
                competition={this.props.competition}
                navigation={this.props.navigation}
            />
            {this.state.expandable ? <View style={{height: this.state.expanded ? undefined: 0, overflow: "hidden"}}>
                <SectionList
                    style={styles.plugInsSectionList}
                    renderItem={this.renderPlugIns}
                    renderSectionHeader={(args) =>  this.renderHeaders(args, sectionTitles)}
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

        if (!this.props.groups) return null

        return (
            <FlatList 
                style={styles.scrollView} 
                ref={(scroller) => {
                    this.scroller = scroller
                }}
                data={this.props.groups}
                renderItem={({ item }) => this.renderGroup(item)}
                initialNumToRender={5}
                keyExtractor={group => group.iGroup}
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
        fontWeight: "bold"
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
        borderLeftWidth: 1
    }
});