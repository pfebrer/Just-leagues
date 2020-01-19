import React , {Component} from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from "react-native"
import { Icon, List, ListItem, Body, Right, Button } from 'native-base';
import { totalSize } from '../../api/Dimensions';

import NumericInput from "./NumericInput"

import _ from "lodash"

export default class RelationsInput extends Component  {

    constructor(props){
        super(props)

        this.state = {
            value: props.defaultValue
        }
    }

    updateValue = (relationIndex, key, valueIndex, value) => {

        let newValue = _.cloneDeep(this.state.value)

        newValue[relationIndex][key][valueIndex] = value

        this.setState({value: newValue}, () => this.props.reportValue(newValue))
    }

    addNewRelation = () => {
        let newValue = [...this.state.value, {[this.props.independentVar]: [0,0], [this.props.dependentVar]: [0,0]}]

        this.setState({value: newValue}, () => this.props.reportValue(newValue))
    }

    removeRelation = (index) => {

        let newValue = _.cloneDeep(this.state.value) 
        newValue.splice(index, 1)

        this.setState({value: newValue}, () => this.props.reportValue(newValue))
    }

    renderNumericInputs = (relationIndex, varKey, arrValue) => {

        return arrValue.map( (value, index) => (
            <NumericInput
                key={index} 
                value={value}
                onValueChange={(value)=>this.updateValue(relationIndex, varKey, index , value)}/>
        ))
        
    }

    render() {

        const indVar = this.props.independentVar; 
        const depVar = this.props.dependentVar;

        let layout = this.state.value.map( ({[indVar]: indValue, [depVar]: depValue }, index) => (
            <ListItem style={styles.relationView}>
                <View style={styles.indVarView}>
                    {this.renderNumericInputs(index, indVar, indValue)}
                </View>
                <Icon name="arrow-forward" style={styles.relationIndicatorIcon}/>
                <View style={styles.depVarView}>
                    {this.renderNumericInputs(index, depVar, depValue)}
                </View>
                <Icon name="close" style={styles.remoVeItemIcon} onPress={() => {this.removeRelation(index)}}/>
                
            </ListItem>
        ))

        return (
            <View>
                <List>
                    {layout}
                </List>
                <Button style={styles.addItemButton} onPress={this.addNewRelation}>
                    <Icon name="add"/>
                </Button>
            </View>
            
        )
    }

}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    relationView: {
        flexDirection: "row",
        paddingVertical: 10,
        justifyContent: "center",
        alignItems: "center"
    },

    indVarView: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row"
    },

    depVarView: {
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row"
    },

    remoVeItemIcon: {
        color: "darkred"
    },

    relationIndicatorIcon: {
        color: "#ccc"
    },

    addItemButton: {
        marginHorizontal: 30,
        justifyContent: "center",
        alignItems: "center"
    }

})