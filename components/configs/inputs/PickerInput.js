import React, { Component } from "react";
import { Container, Header, Content, Picker, Form } from "native-base";
import { translate } from "../../../assets/translations/translationWorkers";

export default class PickerInput extends Component {

    static _type = "picker"

    render() {
        return (
            <Picker
            note
            mode="dropdown"
            style={this.props.style}
            selectedValue={this.props.value}
            onValueChange={this.props.onValueChange}
            >
                {(this.props.items || []).map( (props) => {
                    const label = props.translatelabel ? translate(props.translatelabel) : props.label
                    return <Picker.Item {...props} label={label}/>
                })}
            </Picker>
        );
    }
}