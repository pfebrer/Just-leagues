import React, { Component } from "react";

import { Body, Right, Text, View} from 'native-base';

import InputField from "../inputs";

export default class PickerField extends Component {

    static _type = "picker"

    render(){
        return <Body>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems:"center"}}>
                    <Text style={{paddingLeft: 14, paddingRight: 20}}>{this.props.name}</Text>
                    <InputField {...this.props} type="picker"/>
                </View>
                <Text note>{this.props.description} </Text>
            </Body>
                    
    }
}