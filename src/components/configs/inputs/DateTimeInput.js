import React, { Component } from "react"

import DateTimePicker from '@react-native-community/datetimepicker';
import { View } from "react-native"
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
            mode: "date",
            tempDate: null,
        }
    }

    render(){

        const placeholder = this.props.placeholder || translate("vocabulary.fix a date")
        const selecting = this.props.selecting !== undefined ? this.props.selecting : this.state.selecting
        const label = this.props.accessibilityLabel

        const value = this.state.tempDate || this.props.value || new Date()

        var minDate = this.props.minimumDate || undefined
        var maxDate = this.props.maximumDate || undefined

        if(maxDate - minDate < 0){
            // Max date already passed
            minDate = undefined
        }

        const onChange = (event, date) => {
            if (!date){
                // This is a cancelation
                this.setState({selecting: false, mode: "date", tempDate: null})
            } else if (this.state.mode === "date"){
                // Keep on selecting to pick the time
                this.setState({selecting: true, mode: "time", tempDate: date})
            } else {
                // We have both date and time, set value.
                this.setState({selecting: false, mode: "date", tempDate: null})
                this.props.onValueChange(date)
            }     
        }

        return <View style={this.props.containerStyle}>
                <Button accessibilityLabel={`${label}button`} rightIcon={
                    <Icon as={Ionicons} size={5} name="calendar"/>
                } onPress={() => this.setState({selecting: true})} style={this.props.style}>
                    <Text>{this.props.value ? moment(this.props.value).format("DD-MM-YYYY HH:mm") : placeholder}</Text>
                </Button>
                {selecting && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={value}
                    mode={this.state.mode}
                    is24Hour={true}
                    onChange={onChange}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                />
                )}
        </View>
        
    }
}