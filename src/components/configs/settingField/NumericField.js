import React, { Component } from "react";

import { View , Text} from 'native-base';

import InputField from "../inputs";

export default class NumericField extends Component {

    static _type = "integer"

    render(){
        return <View>
            <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                <View>
                    <Text>{this.props.name}</Text>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 10}}>
                    <InputField {...this.props} type="number" controlMode="sideArrows"/>
                </View>
            </View>
            <View>
                <Text fontSize={"xs"} color="#ccc">{this.props.description}</Text>
            </View> 
        </View>
                    
    }
}