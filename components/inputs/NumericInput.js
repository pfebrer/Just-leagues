import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Text, TextInput, View, TouchableOpacity, StyleSheet} from 'react-native'

import {totalSize, w, h} from '../../api/Dimensions'

import { Icon } from 'native-base'

class NumericInput extends Component {

    constructor(props){
        super(props);

        this.state = {
            value: props.value || props.defaultValue || 0
        }
    }


    textChange = (text, onValueChange) => {
        if (text){
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
                    <View style={{...styles.scoreValueView, ...this.props.valueContainerStyle, ...this.props.disabledValueContainerStyle}}>
                        <Text style={{...styles.scoreValue, ...this.props.inputContainerStyle, ...this.props.disabledValueTextStyle}}>{this.props.value}</Text>
                    </View>
                </View>
            )

        } else {

            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <TouchableOpacity 
                        style={{...styles.scoreInputControls, ...this.props.inputControlsStyle, ...this.props.leftInputControlStyle}}
                        onPress={() => onValueChange(value - stepSize)}>
                            {this.props.renderLeftInputControl ? 
                                this.props.renderLeftInputControl() 
                                :
                                <Icon name={this.props.leftControlIcon || "arrow-round-back"} style={{...styles.scoreInputControlsIcon, ...this.props.inputControlIconStyle}}/>
                            }
                    </TouchableOpacity>
                    <View style={{...styles.scoreValueView, ...this.props.valueContainerStyle}}>
                        <TextInput
                            editable={!this.props.disableTextInput}
                            keyboardType="numeric"
                            value={String(value)}
                            style={{...styles.scoreValue, ...this.props.inputContainerStyle}}
                            onChangeText={(text) => this.textChange(text, onValueChange)}/>
                    </View>
                    <TouchableOpacity 
                        style={{...styles.scoreInputControls, ...this.props.inputControlsStyle, ...this.props.rightInputControlStyle}}
                        onPress={() => onValueChange(value + stepSize)}
                        >
                            {this.props.renderRightInputControl ? 
                                this.props.renderRightInputControl() 
                                :
                                <Icon name={this.props.rightControlIcon || "arrow-round-forward"} style={{...styles.scoreInputControlsIcon, ...this.props.inputControlIconStyle}}/>
                            }
                    </TouchableOpacity>
                </View>
            )

        }

        
        
    }
}

NumericInput.propTypes = {
    style: PropTypes.object,
};

export default NumericInput

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

