import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity, SectionList, Pressable, FlatList} from 'react-native';
import { Icon } from "native-base";

import { totalSize } from '../../api/Dimensions';
import Accordion from "./Accordion"

import _ from "lodash"
import { Ionicons } from '@expo/vector-icons';

export default class _ExpandableSectionList extends React.Component{

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
            style={{...styles.sectionHeader, ...this.props.sectionHeaderStyle}}
            onPress={() => this.setState({expandedSection: {...this.state.expandedSection, [section.key]: !this.state.expandedSection[section.key]}})}>
            <Text style={styles.sectionTitleText} >{this.props.sectionTitles[section.key]}</Text>
            {this.state.expandedSection[section.key]
                    ? <Icon as={Ionicons} size={5} name="remove-circle" />
                    : <Icon as={Ionicons} size={5} name="add-circle" />}
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

export class AccordionSectionList extends React.Component{

    constructor(props){
        super(props);

        let initiallyExpanded = this.props.initiallyExpanded || []

        this.state = {
            activeSections: initiallyExpanded,
        }
    }

    renderItem = ({item, section}) => {
        return <View style={{ ...styles.itemContainer, ...this.props.itemContainerStyle}}>{this.props.renderItem({item, section})}</View>
    }

    renderContent = (section) => {
        return <View key={section.key}>
            {section.data.map(item => this.renderItem({item, section}))}
        </View>
    }

    renderHeader = ({key}, index, expanded) => {

        return(
            <View
                style={{...styles.sectionHeader, ...this.props.sectionHeaderStyle}}>
                <Text style={styles.sectionTitleText} >{this.props.sectionTitles[key]}</Text>
                {expanded
                        ? <Icon as={Ionicons} size={5} name="remove-circle" />
                        : <Icon as={Ionicons} size={5} name="add-circle" />}
            </View>
        )
    }

    render(){

        return <Accordion
            containerStyle={this.props.style}
            sections={this.props.sections}
            activeSections={this.state.activeSections}
            onChange={(activeSections) => this.setState({ activeSections })}
            touchableComponent={Pressable}
            expandMultiple={true}
            renderHeader={this.renderHeader}
            renderContent={this.renderContent}
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

    sectionListContainer: {},

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