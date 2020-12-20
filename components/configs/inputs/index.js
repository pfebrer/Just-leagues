import React, { Component } from 'react'

import NumericInput from './NumericInput'
import RelationsInput from './RelationsInput'
import SortableInput from './SortableInput'
import ColorPicker from './ColorWheel'

const allInputs = [NumericInput, RelationsInput, SortableInput, ColorPicker].reduce((inps, current) => {
    inps[current._type] = current
    return inps
}, {})

export default class InputField extends Component {

    render(){
        const InputComponent = allInputs[this.props.type]
        return <InputComponent {...this.props} />
    }
    
}