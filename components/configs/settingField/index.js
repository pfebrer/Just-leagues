import React, { Component } from "react";

import { ListItem } from "native-base";

import { translate } from "../../../assets/translations/translationManager";

import NumericField from './NumericField'
import TextField from './TextField'
import ColorField from "./ColorField";
import SortableField from "./SortableField";
import RelationsField from "./RelationsField";
import PickerField from "./PickerField";

const allFields = [ TextField, NumericField, ColorField, SortableField, RelationsField, PickerField ].reduce((fields, current) => {
    fields[current._type] = current
    return fields
}, {})

export default class SettingField extends Component {
    
    render(){
        const FieldComponent = allFields[this.props.type]

        if (FieldComponent) {
            const description = this.props.description ? translate(this.props.description) : ""
            const name = translate(this.props.name)

            return <ListItem key={this.props.key}>
                        <FieldComponent {...this.props} description={description} name={name}/>
                    </ListItem>
        } else {
            return null
        }
    }
}

export { allFields }