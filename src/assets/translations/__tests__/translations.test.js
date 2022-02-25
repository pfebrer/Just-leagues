import i18n from "i18n-js";
import flatten from "flat"
import _ from "lodash"

import { USERSETTINGS } from "../../../constants/Settings"
import { setI18nConfig, translate } from "../translationWorkers"

var supportedLanguages = []
var translations = {}

describe("Translation correctly set up", () => {

    test("There's a setting for language", () => {
        expect(USERSETTINGS["General appearance"]).toBeTruthy()
        expect(USERSETTINGS["General appearance"].language).toBeTruthy()
    })
    
    supportedLanguages = USERSETTINGS["General appearance"].language.items.map(({value}) => value).filter(value => value)
    
    test("We can retrieve supported languages", () => {
        expect(supportedLanguages.length).toBeGreaterThan(0)
    })
    
    translations = supportedLanguages.reduce((transl, language) => {
        try {
            transl[language] = require(`./${language}.json`)
        } catch {}
        
        return transl
    }, {})
    
    test("All supported languages have a translation file", () => {
        expect(Object.keys(translations)).toEqual(expect.arrayContaining(supportedLanguages))
    })
})

describe("Translation files contain all translations", () => {

    const allKeys = Object.keys(translations).reduce((keys, lang) => {
        keys[lang] = Object.keys(flatten(translations[lang]))
        return keys
    }, {})

    // Get the reference language (i.e. the one that contains more keys)
    const {reflang} = Object.keys(allKeys).reduce(({max, reflang}, lang) => {
        if (allKeys[lang].length > max){
            return {max: allKeys[lang].length, reflang: lang}
        } else {
            return {max, reflang}
        } 
    }, {max: 0, reflang: ""})

    // Match all languages against the reference language
    supportedLanguages.forEach((lang) => {
        test(lang, () => {
            const diff = _.difference(allKeys[reflang], allKeys[lang])
            if (diff.length != 0){
                throw(`Translations for "${lang}" missing the following keys: ${diff}`)
            }
        }) 
    })
})

describe("Translation functions work properly", () => {

    test("Language can be correctly set", () => {
        setI18nConfig("en")

        expect(i18n.locale).toBe("en")
    })

    test("Language defaults to catalan if none found", () => {
        setI18nConfig("non-existing language")

        expect(i18n.locale).toBe("ca")
    })

    test("'translate' returns the correct translation", () => {
        expect(translate("vocabulary.yes")).toBe("Sí")
    })

    

})