import React from "react"
import { render, fireEvent } from '@testing-library/react-native';

import InputField from "../index"

describe('DatetimeInput works', () => {

    const value = 2

    const renderInput = (props) => render(
        <InputField type="number" value={value} {...props}/>,
    );

    const checkChanges = (props) => {

        const onValueChange = jest.fn()

        const { getByA11yLabel } = renderInput({...props, onValueChange})

        const stepSize = (props || {}).stepSize || 1

        fireEvent.press(getByA11yLabel("increment"))
        fireEvent.press(getByA11yLabel("decrement"))
        expect(onValueChange).toHaveBeenCalledTimes(2)
        expect(onValueChange).nthCalledWith(1, 2 + stepSize)
        expect(onValueChange).nthCalledWith(2, 2 - stepSize)

    }

    test("works with step size", () => {
        checkChanges({stepSize: 2})
    })

    test("step size defaults to 1", () => {
        checkChanges()
    })

    test("sideArrows control mode works", () => {
        checkChanges({controlMode: "sideArrows"})
    })

    test("doesn't work if disabled", () => {
        try{
            checkChanges({disabled: false})
            throw "We were able to change the value with the input disabled"
        } catch {}
        
    })

});