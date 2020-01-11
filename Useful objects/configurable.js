import _ from "lodash"

//This is the parent class of all competitions and contains general flows

export default class Configurable {

    static getSetting = (settings, settingKey) => {
        /* Gets a given setting by key, without needing to specify the group */ 

        let settingValue = undefined 

        Object.values(settings).forEach(settingsGroup => {
            if (settingsGroup[settingKey] != undefined){
                settingValue = settingsGroup[settingKey]
                return
            }
        });

        return _.cloneDeep(settingValue)
    }

}