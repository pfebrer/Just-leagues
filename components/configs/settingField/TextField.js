import React, { Component } from "react";

import { Form, Item, Label, Input, View, Text} from 'native-base';

export default class TextField extends Component {

    static _type = "text"

    render(){
        return <Form style={{width: "100%"}}>
                <Item inlineLabel style={{marginTop: 0, marginBottom: 10}}>
                    <Label >{this.props.name}</Label>
                    <Input
                        onChangeText={this.props.onValueChange}
                        value={this.props.value}/>
                </Item>
                <View style={{paddingLeft: 15}}>
                    <Text note>{this.props.description}</Text>
                </View> 
            </Form>

    }
}