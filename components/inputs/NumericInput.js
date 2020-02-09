import React, { Component } from 'react'
import { Text, TextInput, View, TouchableOpacity, StyleSheet} from 'react-native'

import {totalSize, w, h} from '../../api/Dimensions'

import { Icon } from 'native-base'

export default class NumericInput extends Component {ç

    constructor(props){
        super(props);

        this.state = {
            value: props.value || props.defaultValue || 0
        }
    }

    textChange = (text, onValueChange) => {
        if (text){
            console.warn(text)
            onValueChange(Number(text))
        } else {
            onValueChange("")
        }
    }

    render() {

        const value = this.props.value || this.state.value
        const onValueChange = this.props.onValueChange || ((value) => this.setState({value}))
        const stepSize = this.props.stepSize || 1

        if (this.props.disabled){

            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <View style={styles.scoreValueView}>
                        <Text style={styles.scoreValue}>{this.props.value}</Text>
                    </View>
                </View>
            )

        } else {

            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <TouchableOpacity 
                        style={styles.scoreInputControls}
                        onPress={() => onValueChange(value - stepSize)}>
                        <Icon name="arrow-round-back" style={styles.scoreInputControlsIcon}/>
                    </TouchableOpacity>
                    <View style={styles.scoreValueView}>
                        <TextInput 
                            keyboardType="numeric"
                            value={String(value)}
                            style={styles.scoreValue}
                            onChangeText={(text) => this.textChange(text, onValueChange)}/>
                    </View>
                    <TouchableOpacity 
                        style={styles.scoreInputControls}
                        onPress={() => onValueChange(value + stepSize)}
                        >
                        <Icon name="arrow-round-forward" style={styles.scoreInputControlsIcon}/>
                    </TouchableOpacity>
                </View>
            )

        }

        
        
    }
}

const styles = StyleSheet.create({
    //Players
    playerNameView: {
        width: "100%",
    },

    playerNameText: {
        fontSize: totalSize(2)
    },

    //Scores input
    scoreContainer: {
        flexDirection: "row",
        marginVertical: 10,
    },

    scoreInputView: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        flex:1
    },

    scoreValueView: {
        elevation: 3,
        backgroundColor: "white",
        height: h(6),
        width: h(6),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center"
    },

    scoreValue: {
        textAlign: "center",
        fontSize: totalSize(2.5)
    },

    scoreInputControls: {
        padding: 20,
    },

    scoreInputControlsIcon: {
        fontSize: totalSize(1.5)
    },
})

