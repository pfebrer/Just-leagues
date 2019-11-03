/*THIS FILE MANAGES TRANSLATIONS. 
Basically, all we need to do anywhere that we require a translated string is:

import { translate } from ../assets/translations/translationManager

and then translate(word)
*/

import i18n from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance
import moment from "moment"
import * as Localization from 'expo-localization';

import {
  I18nManager,
} from "react-native";

import caLocale from "moment/locale/ca"
import esLocale from "moment/locale/es"

const translationGetters = {
    // lazy requires (metro bundler does not support symlinks)
    ca: () => require("./ca.json"),
    en: () => require("./en.json"),
    es: () => require("./es.json"),
};
    
const translate = memoize(
    (key, config) => i18n.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key)
);

findBestAvailableLanguage = (keys, fallback) => {
    
    let phoneLocale = Localization.locale

    let fitsExactly = false, fits = false;
    keys.forEach(key => {
        if (key == phoneLocale){
            fitsExactly = key
        } else if (phoneLocale.indexOf(key) == 0){
            fits = key
        }
    })

    return fitsExactly || fits ? { languageTag: fitsExactly || fits, isRTL: false } : fallback

}
    
const setI18nConfig = async (defaultLanguage) => {
    // fallback if no available language fits
    const fallback = { languageTag: defaultLanguage, isRTL: false };

    //Get the locale
    var { languageTag, isRTL } = findBestAvailableLanguage(Object.keys(translationGetters), fallback)

    languageTag = defaultLanguage

    console.warn(languageTag)

    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(isRTL);
    // set i18n-js config
    i18n.translations = { [languageTag]: translationGetters[languageTag]() };

    i18n.locale = languageTag;

    moment.locale(languageTag)
};

setI18nConfig("ca");

export { translate, setI18nConfig }