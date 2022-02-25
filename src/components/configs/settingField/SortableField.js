import React, { Component } from "react";

import { TouchableOpacity } from "react-native"
import Modal from "react-native-modal"
import { Body, Right, Text, View, Icon} from 'native-base';
import { AntDesign } from '@expo/vector-icons'

import InputField from "../inputs";

export default class SortableField extends Component {

    static _type = "sortable"

    constructor(props){
        super(props)
        this.state = {
            selecting: false,
            tempValue: null,
        }
    }

    endSelecting = (submit) => {
        if (submit && this.state.tempValue) this.props.onValueChange(this.state.tempValue);

        this.setState({selecting: false, tempValue: null})
    }

    render(){

        const iconProps = {size: 30, style:{ paddingHorizontal: 20}}

        if (this.state.selecting) {
            return <Body style={{flex: 1}}>
                <Text style={{marginBottom: 10}}>{this.props.name}</Text>
                <Modal isVisible={true} style={{ marginVertical: "30%", backgroundColor: "white", flexDirection: "row", alignItems: "center", ...this.props.style}}>
                    <TouchableOpacity onPress={() => this.endSelecting(true)}><AntDesign name="check" {...iconProps}/></TouchableOpacity>
                    <View style={{flex: 1}}>
                        <InputField
                            type="sortable" 
                            defaultValue={this.props.value} 
                            {...this.props.control} 
                            reportValue={(val) => this.setState({tempValue: val})}
                            
                        />
                    </View>
                    <TouchableOpacity onPress={() => this.endSelecting(false)}><AntDesign name="close" {...iconProps}/></TouchableOpacity>
                </Modal>
            </Body>
        } else {
            return [
                <Body>
                    <Text>{this.props.name}</Text>
                    <Text note>{this.props.description} </Text>
                </Body>
                ,
                <Right>
                    <TouchableOpacity 
                        style={{width: 30, height: 30, justifyContent: "center", alignItems: "center"}} 
                        onPress={() => this.setState({selecting: true})}>
                        <Icon name="arrow-forward"/>
                    </TouchableOpacity>
                </Right>
            ]
        }
       
    }
}