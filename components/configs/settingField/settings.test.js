import { allFields } from "./index"
import * as allSettings from "../../../constants/Settings"

const availableTypes = Object.keys(allFields)

describe("All settings have a setting field", () => {

    Object.keys(allSettings).forEach(key => {

        if ( ! key.endsWith("SETTINGS") ) return

        test(key, () => {
            const neededTypes = Object.values(allSettings[key]).reduce((types, section) => {
                return [...Object.values(section).map(setting => setting.control.type), ...types]
            } , [])
            expect(availableTypes).toEqual(expect.arrayContaining(neededTypes))
        })
    });
    
    

})