/*THIS FILE MANAGES TRANSLATIONS. 
Basically, all we need to do anywhere that we require a translated string is:

import { translate } from ../assets/translations/translationManager

and then translate(word)
*/


//import * as RNLocalize from "react-native-localize";
import i18n from "i18n-js";
import memoize from "lodash.memoize"; // Use for caching/memoize for better performance

import {
  I18nManager,
} from "react-native";

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
    
const setI18nConfig = async () => {
    // fallback if no available language fits
    const fallback = { languageTag: "ca", isRTL: false };

    const { languageTag, isRTL } =
    //RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters))
    false||
    fallback;

    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(isRTL);
    // set i18n-js config
    i18n.translations = { [languageTag]: translationGetters[languageTag]() };

    i18n.locale = languageTag;
};

setI18nConfig();

export { translate, setI18nConfig }