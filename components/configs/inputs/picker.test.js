import PickerInput from "./PickerInput"
import React from "react"
import { render, fireEvent } from '@testing-library/react-native';

test('Picker works', () => {

    const mockFn = jest.fn();

    const { getByText } = render(
        <PickerInput value="HE" items={[{label: "HA", value: "HE"}, {label: "UF", value: "FU"}]} onValueChange={(value) => mockFn(value)} />
    );

    fireEvent.press(getByText("UF"));

    expect(mockFn).toBeCalledWith("FU");

});