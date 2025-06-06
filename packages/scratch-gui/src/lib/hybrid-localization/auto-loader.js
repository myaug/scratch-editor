/**
 * Auto-loader for custom locale files
 * This module provides utilities to automatically load custom locale files when the app starts
 */

import {DEFAULT_CONFIG} from './constants';
import {localeManager} from './locale-manager';
import {updateCustomMessages} from '../../reducers/locales';

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

    try {
        console.log(`🌐 Auto-loading custom locale: ${locale}`);
        const customMessages = await localeManager.loadCustomLocale(locale);
        
        if (customMessages && Object.keys(customMessages).length > 0) {
            console.log(`✅ Loaded ${Object.keys(customMessages).length} custom messages for ${locale}`);
            dispatch(updateCustomMessages(locale, customMessages));
            return true;
        } else {
            console.log(`ℹ️ No custom messages found for ${locale}`);
            return false;
        }
    } catch (error) {
        console.warn(`❌ Failed to auto-load custom locale ${locale}:`, error);
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
        console.log('🌐 Skipping custom locale auto-load (transifex-only mode)');
        return;
    }

    console.log(`🌐 Initializing custom locales (mode: ${localizationMode}, locale: ${currentLocale})`);
    
    // Load custom locale for current language
    await autoLoadCustomLocale(currentLocale, dispatch);
};
