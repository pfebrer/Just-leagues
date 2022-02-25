import React from "react"
import { render } from "@testing-library/react-native"
import InputField , { allInputs } from "../index"

test("Check that all inputs have a type", () => {
    expect(allInputs[undefined]).toBeUndefined()
})

describe("Check that all inputs work good without a value", () => {
    Object.keys(allInputs).forEach(type => {
        test(type, () => {render(<InputField type={type} value={null}/>)})
    })
})