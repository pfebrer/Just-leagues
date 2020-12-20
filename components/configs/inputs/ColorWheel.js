import React, { Component } from "react"

import { AntDesign } from '@expo/vector-icons'
import { View, TouchableOpacity } from "react-native"
import { ColorPicker , fromHsv} from 'react-native-color-picker'
import { Text } from "native-base"

export default class ColorWheel extends Component {

    static _type = "color"

    constructor(props){
        super(props)
        this.state = {
            selecting: false,
            tempValue: null
        }
    }

    startSelecting = () => {
        this.setState({selecting: true})

        if (this.props.onSelecting) this.props.onSelecting()
    }

    endSelecting = (submit) => {
        if (submit && this.state.tempValue) this.props.onValueChange(this.state.tempValue);

        this.setState({selecting: false, tempValue: null})

        if (this.props.onSelected) this.props.onSelected()
    }

    render(){

        const selecting = this.props.selecting !== undefined ? this.props.selecting : this.state.selecting 

        if (selecting){
            return <View style={{flex: 1, flexDirection: "row", alignItems: "center", ...this.props.style}}>
                <TouchableOpacity onPress={() => this.endSelecting(true)}><AntDesign name="check" {...this.props.iconProps}/></TouchableOpacity>
                <ColorPicker
                    style={{flex: 1, ...this.props.wheelStyles}}
                    oldColor={this.props.value}
                    onColorChange={(color) => {this.setState({tempValue:fromHsv(color)})}}
                    hideSliders={this.props.hideSliders}
                />
                <TouchableOpacity onPress={() => this.endSelecting(false)}><AntDesign name="close" {...this.props.iconProps}/></TouchableOpacity>
            </View>
        } else {
            return <TouchableOpacity 
                style={{backgroundColor: this.props.value, elevation: 5, ...this.props.style}} 
                onPress={this.startSelecting}>
            </TouchableOpacity>
        }
        
    }
}