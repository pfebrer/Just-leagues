import React, { Component } from "react";

import { Input, View, Text} from 'native-base';

export default class TextField extends Component {

    static _type = "text"

    render(){

        return <View style={{width: "100%"}}>
                <View style={{marginTop: 0, marginBottom: 10, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                    <View style={{paddingRight: 10}}>
                        <Text>{this.props.name}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <Input
                            style={{marginLeft: 10}}
                            variant="underlined"
                            onChangeText={this.props.onValueChange}
                            value={this.props.value}/>
                    </View>
                </View>
                <View>
                    <Text fontSize={"xs"} color="#ccc">{this.props.description}</Text>
                </View> 
            </View>

    }
}