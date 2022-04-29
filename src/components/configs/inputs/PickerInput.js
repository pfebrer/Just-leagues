import React, { Component } from "react";
import { Select } from "native-base";
import { translate } from "../../../assets/translations/translationWorkers";

export default class PickerInput extends Component {

    static _type = "picker"

    onValueChange = (value) => {
        let itemIndex = 0;
        for (let i = 0; i < this.props.items.length; i++) {
            if (this.props.items[i].value === value) {
                itemIndex = i;
                break;
            }
        }
        this.props.onValueChange(value, itemIndex);
    }

    render() {
        return (
            <Select
            note
            mode="dropdown"
            style={this.props.style}
            _selectedItem={{
                bg: "teal.600"
            }}
            selectedValue={this.props.value}
            onValueChange={this.onValueChange}
            >
                {(this.props.items || []).map( (props) => {
                    const label = props.translatelabel ? translate(props.translatelabel) : (props.label || props.value)
                    return <Select.Item value={props.value} {...props} label={label}/>
                })}
            </Select>
        );
    }
}