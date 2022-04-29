import React, { Component } from "react"

import DateTimePickerModal from "react-native-modal-datetime-picker";
import { View, TouchableOpacity } from "react-native"
import { Button, Icon, Text } from "native-base"
import { translate } from "../../../assets/translations/translationWorkers";
import moment from "moment"
import { Ionicons } from "@expo/vector-icons";

export default class DateTimeInput extends Component {

    static _type = "datetime"

    constructor(props){
        super(props)
        this.state = {
            selecting: false,
        }
    }

    render(){

        const placeholder = this.props.placeholder || translate("vocabulary.fix a date")
        const selecting = this.props.selecting !== undefined ? this.props.selecting : this.state.selecting
        const label = this.props.accessibilityLabel

        return <View style={this.props.containerStyle}>
                <Button accessibilityLabel={`${label}button`} rightIcon={
                    <Icon as={Ionicons} size={5} name="calendar"/>
                } onPress={() => this.setState({selecting: true})} style={this.props.style}>
                    <Text>{this.props.value ? moment(this.props.value).format("DD-MM-YYYY HH:mm") : placeholder}</Text>
                </Button>
            <DateTimePickerModal
                isVisible={selecting}
                mode="datetime"
                date={this.props.value}
                onConfirm={(date) => this.setState({selecting: false}, () => this.props.onValueChange(moment(date, "DD-MM-YYYY HH:mm" ).toDate()))}
                onCancel={() => this.setState({selecting: false})}
                {...this.props}
            />
        </View>
        
    }
}