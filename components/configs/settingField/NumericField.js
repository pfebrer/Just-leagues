import React, { Component } from "react";

import { Body, Right, Text} from 'native-base';

import InputField from "../inputs";

export default class NumericField extends Component {

    static _type = "integer"

    render(){
        return [
            <Body>
                <Text>{this.props.name}</Text>
                <Text note>{this.props.description} </Text>
            </Body>, 
            <Right>
                <InputField {...this.props} type="number"/>
            </Right>
        ]
                    
    }
}