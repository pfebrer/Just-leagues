import React from "react"
import { render, fireEvent } from '@testing-library/react-native';

import InputField from "../index"

describe('Picker works', () => {

    const renderInput = (props) => render(
        <InputField type="picker" {...props}/>
    );

    const checkWorking = (props, textToPressForSecondValue) => {
        const onValueChange = jest.fn();

        const value = props.items[0].value
        const secondValue = props.items[1].value

        const { getByText } = renderInput({...props, value, onValueChange: (value) => onValueChange(value)})

        fireEvent.press(getByText(textToPressForSecondValue));

        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange).toHaveBeenCalledWith(secondValue);
    }

    test("Works with label-value pairs", () => {
        checkWorking({items: [{label: "HA", value: "HE"}, {label: "UF", value: "FU"}]}, "UF")
    })

    test("Uses value as label if not provided", () => {
        checkWorking({items: [{label: "HA", value: "HE"}, {value: "FU"}]}, "FU")
    })

    test("Accepts label to translate", () => {
        checkWorking({items: [{label: "HA", value: "HE"}, {translatelabel: "_", value: "FU"}]}, "__")
    })
    

});