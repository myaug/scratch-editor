import {addLocaleData} from 'react-intl';

import {localeData, isRtl} from 'scratch-l10n';
import editorMessages from 'scratch-l10n/locales/editor-msgs';
import {
    LOCALIZATION_MODE_HYBRID,
    LOCALIZATION_MODE_CUSTOM_ONLY,
    LOCALIZATION_MODE_TRANSIFEX_ONLY,
    SET_LOCALIZATION_MODE,
    UPDATE_CUSTOM_MESSAGES,
    CLEAR_CUSTOM_MESSAGES,
    DEFAULT_CONFIG
} from '../lib/hybrid-localization/constants';
import {localeManager} from '../lib/hybrid-localization/locale-manager';

addLocaleData(localeData);

const UPDATE_LOCALES = 'scratch-gui/locales/UPDATE_LOCALES';
const SELECT_LOCALE = 'scratch-gui/locales/SELECT_LOCALE';

const initialState = {
    isRtl: false,
    locale: 'en',
    messagesByLocale: editorMessages,
    messages: editorMessages.en,
    // Hybrid localization state - use DEFAULT_CONFIG mode
    localizationMode: DEFAULT_CONFIG.mode,
    customMessages: {},
    customMessagesByLocale: {},
    combinedMessages: editorMessages.en
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SELECT_LOCALE:
        return Object.assign({}, state, {
            isRtl: isRtl(action.locale),
            locale: action.locale,
            messagesByLocale: state.messagesByLocale,
            messages: state.messagesByLocale[action.locale],
            customMessages: state.customMessagesByLocale[action.locale] || {},
            combinedMessages: getCombinedMessages(
                state.messagesByLocale[action.locale] || {},
                state.customMessagesByLocale[action.locale] || {},
                state.localizationMode
            )
        });
    case UPDATE_LOCALES:
        return Object.assign({}, state, {
            isRtl: state.isRtl,
            locale: state.locale,
            messagesByLocale: action.messagesByLocale,
            messages: action.messagesByLocale[state.locale],
            combinedMessages: getCombinedMessages(
                action.messagesByLocale[state.locale] || {},
                state.customMessages,
                state.localizationMode
            )
        });
    case SET_LOCALIZATION_MODE:
        return Object.assign({}, state, {
            localizationMode: action.mode,
            combinedMessages: getCombinedMessages(
                state.messages,
                state.customMessages,
                action.mode
            )
        });
    case UPDATE_CUSTOM_MESSAGES: {
        const updatedCustomMessagesByLocale = Object.assign({}, state.customMessagesByLocale, {
            [action.locale]: action.messages
        });
        return Object.assign({}, state, {
            customMessages: action.locale === state.locale ? action.messages : state.customMessages,
            customMessagesByLocale: updatedCustomMessagesByLocale,
            combinedMessages: getCombinedMessages(
                state.messages,
                action.locale === state.locale ? action.messages : state.customMessages,
                state.localizationMode
            )
        });
    }
    case CLEAR_CUSTOM_MESSAGES: {
        const clearedCustomMessagesByLocale = Object.assign({}, state.customMessagesByLocale);
        if (action.locale) {
            delete clearedCustomMessagesByLocale[action.locale];
        } else {
            Object.keys(clearedCustomMessagesByLocale).forEach(locale => {
                delete clearedCustomMessagesByLocale[locale];
            });
        }
        return Object.assign({}, state, {
            customMessages: action.locale === state.locale || !action.locale ? {} : state.customMessages,
            customMessagesByLocale: clearedCustomMessagesByLocale,
            combinedMessages: getCombinedMessages(
                state.messages,
                action.locale === state.locale || !action.locale ? {} : state.customMessages,
                state.localizationMode
            )
        });
    }
    default:
        return state;
    }
};

/**
 * Combine Transifex and custom messages based on localization mode
 * @param {object} transifexMessages - Messages from Transifex
 * @param {object} customMessages - Custom messages
 * @param {string} mode - Localization mode
 * @returns {object} Combined messages
 */
const getCombinedMessages = (transifexMessages = {}, customMessages = {}, mode) => {
    switch (mode) {
    case LOCALIZATION_MODE_CUSTOM_ONLY:
        return customMessages;
    case LOCALIZATION_MODE_TRANSIFEX_ONLY:
        return transifexMessages;
    case LOCALIZATION_MODE_HYBRID:
    default:
        // Custom messages take priority over Transifex messages
        return Object.assign({}, transifexMessages, customMessages);
    }
};

const selectLocale = function (locale) {
    return {
        type: SELECT_LOCALE,
        locale: locale
    };
};

const setLocales = function (localesMessages) {
    return {
        type: UPDATE_LOCALES,
        messagesByLocale: localesMessages
    };
};

const setLocalizationMode = function (mode) {
    return {
        type: SET_LOCALIZATION_MODE,
        mode: mode
    };
};

const updateCustomMessages = function (locale, messages) {
    return {
        type: UPDATE_CUSTOM_MESSAGES,
        locale: locale,
        messages: messages
    };
};

const clearCustomMessages = function (locale) {
    return {
        type: CLEAR_CUSTOM_MESSAGES,
        locale: locale
    };
};

/**
 * Action creator for loading custom locale automatically
 * @param {string} locale - The locale to load
 * @returns {Function} Thunk function
 */
const loadCustomLocaleAsync = (locale) => async (dispatch) => {
    try {
        const customMessages = await localeManager.loadCustomLocale(locale);
        if (customMessages && Object.keys(customMessages).length > 0) {
            dispatch(updateCustomMessages(locale, customMessages));
        }
    } catch (error) {
        console.warn(`Failed to load custom locale ${locale}:`, error);
    }
};

const initLocale = function (currentState, locale) {
    if (Object.prototype.hasOwnProperty.call(currentState.messagesByLocale, locale)) {
        const newState = Object.assign(
            {},
            currentState,
            {
                isRtl: isRtl(locale),
                locale: locale,
                messagesByLocale: currentState.messagesByLocale,
                messages: currentState.messagesByLocale[locale],
                customMessages: currentState.customMessagesByLocale[locale] || {}
            }
        );
        
        // Update combined messages
        newState.combinedMessages = getCombinedMessages(
            newState.messages,
            newState.customMessages,
            currentState.localizationMode
        );
        
        return newState;
    }
    // don't change locale if it's not in the current messages
    return currentState;
};

export {
    reducer as default,
    initialState as localesInitialState,
    initLocale,
    selectLocale,
    setLocales,
    setLocalizationMode,
    updateCustomMessages,
    clearCustomMessages,
    loadCustomLocaleAsync
};
