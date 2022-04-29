import React , {Component} from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native"
import { Icon } from 'native-base';
import { h, totalSize } from '../../../api/Dimensions';
import { Ionicons } from '@expo/vector-icons';

export default class NumericInput extends Component  {

    static _type = "number"

    static _default = 0

    textChange = (text, onValueChange) => {
        if (text){
            onValueChange(Number(text))
        } else {
            onValueChange("")
        }
    }

    get stepSize (){
        return this.props.stepSize || 1
    }

    decrement = () => {
        this.props.onValueChange(this.props.value - this.stepSize)
    }

    increment = () => {
        this.props.onValueChange(this.props.value + this.stepSize)
    }

    render() {

        const value = this.props.value

        if (this.props.disabled){
            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <View style={{...styles.scoreValueView, ...this.props.valueContainerStyle, ...this.props.disabledValueContainerStyle}}>
                        <Text style={{...styles.scoreValue, ...this.props.inputContainerStyle, ...this.props.disabledValueTextStyle}}>{this.props.value}</Text>
                    </View>
                </View>
            )

        }

        const incrementButtonProps = {accessibilityLabel: "increment", onPress: this.increment}
        const decrementButtonProps = {accessibilityLabel: "decrement", onPress: this.decrement}
        
        if (this.props.controlMode === "sideArrows"){

            return <View style={{...styles.container, ...this.props.style}}>
                    <View style={styles.valueView}>
                        <Text style={styles.valueText}>{value}</Text>
                    </View>
                    <View>
                        <TouchableOpacity
                            {...incrementButtonProps}
                            style={styles.iconView}>
                            <Icon name="arrow-up" as={Ionicons} size={5} style={styles.icon}/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            {...decrementButtonProps}
                            style={styles.iconView}>
                            <Icon name="arrow-down" as={Ionicons} size={5} style={styles.icon}/>
                        </TouchableOpacity>
                    </View>
                </View>
        } else if (this.props.controlMode === "keyboard") {
            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <View style={{...styles.scoreValueView, ...this.props.valueContainerStyle}}>
                        <TextInput
                            editable={!this.props.disableTextInput}
                            keyboardType="numeric"
                            value={String(value)}
                            style={{...styles.scoreValue, ...this.props.inputContainerStyle}}
                            onChangeText={(text) => this.textChange(text, this.props.onValueChange)}/>
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{...styles.scoreInputView, ...this.props.style}}>
                    <TouchableOpacity
                        {...decrementButtonProps}
                        style={{...styles.scoreInputControls, ...this.props.inputControlsStyle, ...this.props.leftInputControlStyle}}>
                            {this.props.renderLeftInputControl ? 
                                this.props.renderLeftInputControl() 
                                :
                                <Icon name={this.props.leftControlIcon || "arrow-back"} as={Ionicons} size={5} style={{...styles.scoreInputControlsIcon, ...this.props.inputControlIconStyle}}/>
                            }
                    </TouchableOpacity>
                    <View style={{...styles.scoreValueView, ...this.props.valueContainerStyle}}>
                        <TextInput
                            editable={!this.props.disableTextInput}
                            keyboardType="numeric"
                            value={String(value)}
                            style={{...styles.scoreValue, ...this.props.inputContainerStyle}}
                            onChangeText={(text) => this.textChange(text, this.props.onValueChange)}/>
                    </View>
                    <TouchableOpacity
                        {...incrementButtonProps}
                        style={{...styles.scoreInputControls, ...this.props.inputControlsStyle, ...this.props.rightInputControlStyle}}
                        >
                            {this.props.renderRightInputControl ? 
                                this.props.renderRightInputControl() 
                                :
                                <Icon name={this.props.rightControlIcon || "arrow-forward"} as={Ionicons} size={5} style={{...styles.scoreInputControlsIcon, ...this.props.inputControlIconStyle}}/>
                            }
                    </TouchableOpacity>
                </View>
            )
        }

            
    }

}

const styles = StyleSheet.create({

    container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    valueView: {
        paddingRight: 20
    },

    valueText: {
        fontSize: totalSize(2.5)
    },

    iconView: {
        paddingVertical: 10,
    },

    icon: {
        color:"gray",
        width:"auto",
    },

    // Separated arrows styles
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