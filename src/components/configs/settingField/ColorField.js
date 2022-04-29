import React, { Component } from "react";

import { Body, Right, Text, View} from 'native-base';

import InputField from "../inputs";

export default class ColorField extends Component {

    static _type = "color"

    constructor(props){
        super(props)
        this.state = {
            selecting: false
        }
    }

    render(){

        const styles = this.state.selecting ? {
            justifyContent: "space-around"
        } : {
            width: 30, height: 30
        }

        const picker = <InputField 
            onSelecting={() => this.setState({selecting: true})}
            onSelected={() => this.setState({selecting: false})}
            selecting={this.state.selecting}
            hideSliders={true}
            wheelStyles={{height: 80}}
            iconProps={{size: 30, style:{ paddingHorizontal: 20}}}
            {...this.props}
            style={{...styles, ...this.props.pickerStyles}}
        />

        if (this.state.selecting) {
            return <View style={{flex: 1}}>
                <Text style={{marginBottom: 10}}>{this.props.name}</Text>
                {picker}
            </View>
        } else {
            return <View>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                    <View>
                        <Text>{this.props.name}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: "row", justifyContent: "flex-end", padding: 10}}>
                        {picker}
                    </View>
                </View>
                <View>
                    <Text fontSize={"xs"} color="#ccc">{this.props.description}</Text>
                </View> 
            </View>
        }
       
    }
}