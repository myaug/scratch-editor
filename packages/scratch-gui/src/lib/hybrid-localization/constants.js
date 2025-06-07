// Constants for hybrid localization system

export const LOCALIZATION_MODES = {
    HYBRID: 'hybrid',
    CUSTOM_ONLY: 'custom-only',
    TRANSIFEX_ONLY: 'transifex-only'
};

// Legacy constants for backward compatibility
export const LOCALIZATION_MODE_HYBRID = LOCALIZATION_MODES.HYBRID;
export const LOCALIZATION_MODE_CUSTOM_ONLY = LOCALIZATION_MODES.CUSTOM_ONLY;
export const LOCALIZATION_MODE_TRANSIFEX_ONLY = LOCALIZATION_MODES.TRANSIFEX_ONLY;

export const REDUX_ACTIONS = {
    SET_LOCALIZATION_MODE: 'scratch-gui/locales/SET_LOCALIZATION_MODE',
    UPDATE_CUSTOM_MESSAGES: 'scratch-gui/locales/UPDATE_CUSTOM_MESSAGES',
    CLEAR_CUSTOM_MESSAGES: 'scratch-gui/locales/CLEAR_CUSTOM_MESSAGES',
    SET_HYBRID_LOCALE: 'scratch-gui/locales/SET_HYBRID_LOCALE',
    START_LOADING_CUSTOM_LOCALE: 'scratch-gui/locales/START_LOADING_CUSTOM_LOCALE',
    FINISH_LOADING_CUSTOM_LOCALE: 'scratch-gui/locales/FINISH_LOADING_CUSTOM_LOCALE'
};

// Export individual action constants
export const SET_LOCALIZATION_MODE = REDUX_ACTIONS.SET_LOCALIZATION_MODE;
export const UPDATE_CUSTOM_MESSAGES = REDUX_ACTIONS.UPDATE_CUSTOM_MESSAGES;
export const CLEAR_CUSTOM_MESSAGES = REDUX_ACTIONS.CLEAR_CUSTOM_MESSAGES;
export const SET_HYBRID_LOCALE = REDUX_ACTIONS.SET_HYBRID_LOCALE;
export const START_LOADING_CUSTOM_LOCALE = REDUX_ACTIONS.START_LOADING_CUSTOM_LOCALE;
export const FINISH_LOADING_CUSTOM_LOCALE = REDUX_ACTIONS.FINISH_LOADING_CUSTOM_LOCALE;

export const DEFAULT_CONFIG = {
    mode: LOCALIZATION_MODES.HYBRID,
    customLocalesPath: '/custom-locales/',
    fallbackLocale: 'en',
    enableCache: true,
    enableDevMode: process.env.NODE_ENV === 'development'
};

export const SUPPORTED_LOCALES = [
    'en', 'vi'
];

export const CACHE_KEYS = {
    CUSTOM_MESSAGES: 'hybrid_localization_custom_messages',
    LOCALE_STATS: 'hybrid_localization_stats'
};
