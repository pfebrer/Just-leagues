import React from "react"
import { render, fireEvent } from '@testing-library/react-native';

import InputField from "..";

describe('DatetimeInput works', () => {

    const onValueChange = jest.fn()

    const value = new Date()

    const renderInput = (props) => render(
        <InputField type="datetime" accessibilityLabel={"datetime"} onValueChange={onValueChange} value={value} {...props}/>,
    );

    const cancelText = "Cancel"
    const confirmText = "Confirm"

    var showModalButton, cancelButton, confirmButton;

    test("displays and hides modal", () => {

        const { getByA11yLabel, queryByText } = renderInput()

        // Check that we are not seeing the cancel button (rendered inside the modal) 
        expect(queryByText(cancelText)).toBeNull()
        
        showModalButton = getByA11yLabel("datetimebutton")

        // Make the input display the modal
        fireEvent.press(showModalButton)

        // Check that we are now seeing the cancel and confirm buttons (rendered inside the modal)
        cancelButton = queryByText(cancelText)
        expect(cancelButton).not.toBeNull()
        expect(queryByText(confirmText)).not.toBeNull()

        // Cancel and check that the modal disappears
        fireEvent.press(cancelButton)

        // Also check that onValueChange has not been called
        expect(onValueChange).not.toHaveBeenCalled()
    })

    test("Modal display can be controlled from parent", () => {
        const { queryByText } = renderInput({selecting: true})

        // Check that we are seeing the cancel button (rendered inside the modal) 
        expect(queryByText(cancelText)).not.toBeNull()
    })

    test("calls onValueChange when we press confirm", () => {

        const { getByA11yLabel, queryByText } = renderInput()
        
        // Make the input display the modal
        showModalButton = getByA11yLabel("datetimebutton")
        fireEvent.press(showModalButton)

        // Press the confirm button
        fireEvent.press(queryByText(confirmText))

        // Check that we are receiving the new value
        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange).toHaveBeenCalledWith(value)
    })

});