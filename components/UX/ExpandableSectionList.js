import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, SectionList} from 'react-native';
import { Icon } from "native-base";

import { totalSize } from '../../api/Dimensions';

import _ from "lodash"

export default class ExpandableSectionList extends React.Component{

    constructor(props){
        super(props);

        let initiallyExpanded = this.props.initiallyExpanded || []

        this.state = {
            expandedSection: initiallyExpanded.reduce((expanded, key) => {expanded[key] = true; return expanded}, {})
        }
    }

    renderItem = ({item, section}) => {

        const heightStyle = this.state.expandedSection[section.key] ? {} : styles.hiddenItem

        return <View style={{ ...styles.itemContainer, ...this.props.itemContainerStyle, ...heightStyle}}>{this.props.renderItem({item, section})}</View>
    }

    renderHeaders = ({section}) => {

        return(
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => this.setState({expandedSection: {...this.state.expandedSection, [section.key]: !this.state.expandedSection[section.key]}})}>
            <Text style={styles.sectionTitleText} >{this.props.sectionTitles[section.key]}</Text>
            {this.state.expandedSection[section.key]
                    ? <Icon style={{ fontSize: 18 }} name="remove-circle" />
                    : <Icon style={{ fontSize: 18 }} name="add-circle" />}
        </TouchableOpacity>
        )
    }

    render(){

        return <SectionList
                    style={{...styles.sectionListContainer, ...this.props.style}}
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderHeaders}
                    sections={this.props.sections}
                    keyExtractor={item => {return typeof item != "string" ? item.id : item}}
                />         
    }

}

const styles = StyleSheet.create({

    hiddenItem: {
        height:0, 
        margin: 0, 
        padding: 0, 
        paddingVertical: 0, 
        paddingTop: 0, 
        paddingBottom: 0, 
        overflow: "hidden"
    },

    sectionListContainer: {
        marginTop: 10
    },

    sectionHeader: {
        flexDirection: "row",
        paddingVertical: 20,
        justifyContent: "center",
        alignItems: "center"
    },

    sectionTitleText: {
        flex: 1,
        fontFamily: "bold",
        fontSize: totalSize(1.8)
    },

});