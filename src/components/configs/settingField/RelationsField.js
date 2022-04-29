import React, { Component } from "react";

import { TouchableOpacity } from "react-native"
import Modal from "react-native-modal"
import { Text, View, Icon} from 'native-base';
import { AntDesign, Ionicons } from '@expo/vector-icons'

import InputField from "../inputs";

export default class RelationsField extends Component {

    static _type = "relations"

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
            return <View style={{flex: 1}}>
                <Text style={{marginBottom: 10}}>{this.props.name}</Text>
                <Modal isVisible={true} style={{ marginVertical: "30%", backgroundColor: "white", flexDirection: "row", alignItems: "center", ...this.props.style}}>
                    <TouchableOpacity onPress={() => this.endSelecting(true)}><AntDesign name="check" {...iconProps}/></TouchableOpacity>
                    <View style={{flex: 1}}>
                        <InputField
                            type="relations" 
                            defaultValue={this.props.value} 
                            {...this.props.control} 
                            reportValue={(val) => this.setState({tempValue: val})}
                            
                        />
                    </View>
                    <TouchableOpacity onPress={() => this.endSelecting(false)}><AntDesign name="close" {...iconProps}/></TouchableOpacity>
                </Modal>
            </View>
        } else {
            return <View>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
                    <View>
                        <Text>{this.props.name}</Text>
                    </View>
                    <View style={{flex: 1, flexDirection: "row", justifyContent: "flex-end", padding: 10}}>
                        <TouchableOpacity 
                            style={{width: 30, height: 30, justifyContent: "center", alignItems: "center"}} 
                            onPress={() => this.setState({selecting: true})}>
                            <Icon as={Ionicons} size={5} name="arrow-forward"/>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <Text fontSize={"xs"} color="#ccc">{this.props.description}</Text>
                </View> 
            </View>
        }
       
    }
}