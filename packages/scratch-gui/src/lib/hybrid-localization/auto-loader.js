/**
 * Auto-loader for custom locale files
 * This module provides utilities to automatically load custom locale files when the app starts
 */

import {DEFAULT_CONFIG} from './constants';
import {localeManager} from './locale-manager';
import {updateCustomMessages, startLoadingCustomLocale, finishLoadingCustomLocale} from '../../reducers/locales';

/**
 * Auto-load custom locale for a given locale
 * @param {string} locale - The locale to load
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<boolean>} Success status
 */
export const autoLoadCustomLocale = async (locale, dispatch) => {
    // Only auto-load if in custom-only or hybrid mode
    if (DEFAULT_CONFIG.mode === 'transifex-only') {
        return false;
    }

    dispatch(startLoadingCustomLocale(locale));

    try {
        const customMessages = await localeManager.loadCustomLocale(locale);
        
        if (customMessages && Object.keys(customMessages).length > 0) {
            dispatch(updateCustomMessages(locale, customMessages));
            dispatch(finishLoadingCustomLocale(locale));
            return true;
        } else {
            dispatch(finishLoadingCustomLocale(locale));
            return false;
        }
    } catch (error) {
        dispatch(finishLoadingCustomLocale(locale));
        return false;
    }
};

/**
 * Auto-load custom locales for multiple locales
 * @param {string[]} locales - Array of locales to load
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<Object>} Results by locale
 */
export const autoLoadCustomLocales = async (locales, dispatch) => {
    const results = {};
    
    for (const locale of locales) {
        results[locale] = await autoLoadCustomLocale(locale, dispatch);
    }
    
    return results;
};

/**
 * Initialize custom locales based on current app state
 * This should be called during app initialization
 * @param {Object} state - Current Redux state
 * @param {Function} dispatch - Redux dispatch function
 * @returns {Promise<void>}
 */
export const initializeCustomLocales = async (state, dispatch) => {
    const currentLocale = state.locales?.locale || 'en';
    const localizationMode = state.locales?.localizationMode || DEFAULT_CONFIG.mode;
    
    // Only auto-load if using custom translations
    if (localizationMode === 'transifex-only') {
        return;
    }

    console.log(`🌐 Initializing custom locales (mode: ${localizationMode}, locale: ${currentLocale})`);
    
    // Load custom locale for current language
    await autoLoadCustomLocale(currentLocale, dispatch);
};
