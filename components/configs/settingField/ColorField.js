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
            style={{...styles, ...this.props.pickerStyles}}
            wheelStyles={{height: 80}}
            iconProps={{size: 30, style:{ paddingHorizontal: 20}}}
            {...this.props}
        />

        if (this.state.selecting) {
            return <Body style={{flex: 1}}>
                <Text style={{marginBottom: 10}}>{this.props.name}</Text>
                {picker}
            </Body>
        } else {
            return [
                <Body>
                    <Text>{this.props.name}</Text>
                    <Text note>{this.props.description} </Text>
                </Body>
                ,
                <Right>{picker}</Right>
            ]
        }
       
    }
}