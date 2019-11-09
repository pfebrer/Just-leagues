import React, {Component} from "react"

import {
    StyleSheet,
    TouchableOpacity,
    TouchableHighlight,
    View, 
    Animated,
    Easing,
} from 'react-native';

import ContentLoader, { Code } from 'react-content-loader/native'

import { Icon, Text} from 'native-base';

import { totalSize, w, h } from '../../api/Dimensions';

export default class Card extends Component{

    render(){

        if (this.props.loading){
            return(
                <Animated.View style={{...styles.gridItem, ...this.props.cardContainerStyles}}>
                    <Code style={{margin:20}}/>
                </Animated.View>
            )
        }

        return(
            <Animated.View style={{...styles.gridItem, ...this.props.cardContainerStyles}}>
                <TouchableOpacity disabled={!this.props.onHeaderPress} style={{...styles.itemTitleView}} onPress={this.props.onHeaderPress}>
                    <Icon name={this.props.titleIcon} style={{...styles.titleIcon,...this.props.titleIconStyles}}/>
                    <Text style={{...styles.titleText,...this.props.titleTextStyles}}>{this.props.title}</Text>
                    <Animated.View style={styles.actionView}>
                        {this.props.actionHelperText ? <Text style={{...styles.actionHelperText, ...this.props.actionHelperTextStyles}} >{this.props.actionHelperText}</Text> : null}
                        {this.props.actionIcon ? (
                            <Animated.View style={this.props.actionIconViewStyles}>
                                <Icon name={this.props.actionIcon} style={{...styles.actionIcon,...this.props.actionIconStyles}}/>
                            </Animated.View>) : null}
                    </Animated.View>
                </TouchableOpacity>
                <View style={this.props.childrenContainerStyles}>
                    {this.props.children}
                </View>
            </Animated.View>
        )
        
    }

}

const styles = StyleSheet.create({

    gridItem : {
        elevation: 5,
        marginHorizontal: 10,
        marginVertical: 10,
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: "white",
        overflow: "hidden"
    },

    itemTitleView : {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingBottom: 20,
    },

    titleIcon: {
        paddingRight: 15,
        color: "gray"
    },

    actionView: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },

    actionHelperText: {
        paddingRight: 10,
    },
    
    actionIcon: {
        color: "gray"
    },

    titleText: {
        fontSize: totalSize(1.8),
        color: "gray"
    },

});