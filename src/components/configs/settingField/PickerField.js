import React, { Component } from "react";

import { Text, View} from 'native-base';

import InputField from "../inputs";

export default class PickerField extends Component {

    static _type = "picker"

    render(){
        return <View>
                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems:"center"}}>
                    <Text style={{paddingRight: 20}}>{this.props.name}</Text>
                    <View style={{flex: 1}}>
                        <InputField {...this.props} type="picker"/>
                    </View>
                </View>
                <Text fontSize={"xs"} color="#ccc">{this.props.description} </Text>
            </View>
                    
    }
}