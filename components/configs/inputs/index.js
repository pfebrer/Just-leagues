import React, { Component } from 'react'

import NumericInput from './NumericInput'
import RelationsInput from './RelationsInput'
import SortableInput from './SortableInput'
import ColorPicker from './ColorWheel'
import PickerInput from './PickerInput'

const allInputs = [NumericInput, RelationsInput, SortableInput, ColorPicker, PickerInput].reduce((inps, current) => {
    inps[current._type] = current
    return inps
}, {})

export default class InputField extends Component {

    constructor(props){
        super(props)

        this.InputComponent = allInputs[props.type]

        this.state = {}
    }

    get onValueChange(){
        return this.props.onValueChange || ((value) => this.setState({value}))
    }

    get value (){
        return this.props.value || this.state.value || this.InputComponent._default
    }

    render(){
        return <this.InputComponent {...this.props} value={this.value} onValueChange={this.onValueChange}/>
    }
    
}