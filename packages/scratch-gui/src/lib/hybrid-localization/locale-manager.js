import {DEFAULT_CONFIG, CACHE_KEYS, LOCALIZATION_MODES} from './constants.js';

class LocaleManager {
    constructor (config = {}) {
        this.config = {...DEFAULT_CONFIG, ...config};
        this.customMessages = {};
        this.loadedLocales = new Set();
        this.cache = new Map();
        this.stats = {
            totalKeys: 0,
            customKeys: 0,
            coverage: {}
        };
    }

    /**
     * Load custom messages for a specific locale
     * @param {string} locale - The locale to load
     * @returns {Promise<object>} Custom messages for the locale
     */
    async loadCustomLocale (locale) {
        if (this.loadedLocales.has(locale)) {
            return this.customMessages[locale] || {};
        }

        try {
            // Try to load from cache first
            if (this.config.enableCache) {
                const cached = this.getCachedMessages(locale);
                if (cached) {
                    this.customMessages[locale] = cached;
                    this.loadedLocales.add(locale);
                    return cached;
                }
            }

            // Load from file
            const response = await fetch(`${this.config.customLocalesPath}${locale}.json`);
            if (response.ok) {
                const messages = await response.json();
                this.customMessages[locale] = messages;
                this.loadedLocales.add(locale);
                
                // Cache the result
                if (this.config.enableCache) {
                    this.setCachedMessages(locale, messages);
                }
                
                this.updateStats(locale, messages);
                return messages;
            }
        } catch (error) {
            console.warn(`Failed to load custom locale ${locale}:`, error);
        }

        // Return empty object if loading fails
        this.customMessages[locale] = {};
        this.loadedLocales.add(locale);
        return {};
    }

    /**
     * Get hybrid messages combining custom and official translations
     * @param {string} locale - The locale to get messages for
     * @param {object} officialMessages - Official messages from Transifex
     * @returns {object} Combined messages
     */
    getHybridMessages (locale, officialMessages = {}) {
        const customMessages = this.customMessages[locale] || {};
        
        switch (this.config.mode) {
        case LOCALIZATION_MODES.CUSTOM_ONLY:
            return customMessages;
        case LOCALIZATION_MODES.TRANSIFEX_ONLY:
            return officialMessages;
        case LOCALIZATION_MODES.HYBRID:
        default:
            return {
                ...officialMessages,
                ...customMessages // Custom messages override official ones
            };
        }
    }

    /**
     * Get translation for a specific key with fallback logic
     * @param {string} key - Translation key
     * @param {string} locale - Target locale
     * @param {object} officialMessages - Official messages
     * @param {string} defaultMessage - Default fallback message
     * @returns {string} Translation or fallback
     */
    getTranslation (key, locale, officialMessages = {}, defaultMessage = '') {
        const customMessages = this.customMessages[locale] || {};
        
        // Priority: Custom -> Official -> Fallback locale -> Default message
        if (customMessages[key]) {
            return customMessages[key];
        }
        
        if (this.config.mode !== LOCALIZATION_MODES.CUSTOM_ONLY && officialMessages[key]) {
            return officialMessages[key];
        }
        
        // Try fallback locale
        if (locale !== this.config.fallbackLocale) {
            const fallbackCustom = this.customMessages[this.config.fallbackLocale] || {};
            if (fallbackCustom[key]) {
                return fallbackCustom[key];
            }
        }
        
        return defaultMessage || key;
    }

    /**
     * Check if a custom translation exists for a key
     * @param {string} key - Translation key to check
     * @param {string} locale - Target locale
     * @returns {boolean} True if custom translation exists
     */
    hasCustomTranslation (key, locale) {
        const customMessages = this.customMessages[locale] || {};
        return Boolean(customMessages[key]);
    }

    /**
     * Add or update custom translation
     * @param {string} key - Translation key
     * @param {string} value - Translation value
     * @param {string} locale - Target locale
     */
    setCustomTranslation (key, value, locale) {
        if (!this.customMessages[locale]) {
            this.customMessages[locale] = {};
        }
        this.customMessages[locale][key] = value;
        this.updateStats(locale, this.customMessages[locale]);
    }

    /**
     * Remove custom translation
     * @param {string} key - Translation key to remove
     * @param {string} locale - Target locale
     */
    removeCustomTranslation (key, locale) {
        if (this.customMessages[locale]) {
            delete this.customMessages[locale][key];
            this.updateStats(locale, this.customMessages[locale]);
        }
    }

    /**
     * Get translation statistics
     * @returns {object} Current translation statistics
     */
    getStats () {
        return {...this.stats};
    }

    /**
     * Set localization mode
     * @param {string} mode - New localization mode
     */
    setMode (mode) {
        if (Object.values(LOCALIZATION_MODES).includes(mode)) {
            this.config.mode = mode;
        }
    }

    /**
     * Get current mode
     * @returns {string} Current localization mode
     */
    getMode () {
        return this.config.mode;
    }

    /**
     * Export custom messages for backup/sync
     * @param {string} locale - Locale to export
     * @returns {object} Custom messages for the locale
     */
    exportCustomMessages (locale) {
        return JSON.stringify(this.customMessages[locale] || {}, null, 2);
    }

    /**
     * Import custom messages
     * @param {string} locale - Target locale
     * @param {string|object} messagesJson - Messages to import (JSON string or object)
     * @returns {boolean} Success status
     */
    importCustomMessages (locale, messagesJson) {
        try {
            const messages = typeof messagesJson === 'string' ?
                JSON.parse(messagesJson) :
                messagesJson;
            this.customMessages[locale] = messages;
            this.updateStats(locale, messages);
            return true;
        } catch (error) {
            console.error('Failed to import custom messages:', error);
            return false;
        }
    }

    /**
     * Clear cache
     */
    clearCache () {
        this.cache.clear();
        if (typeof localStorage !== 'undefined') {
            Object.values(CACHE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }

    // Private methods
    getCachedMessages (locale) {
        if (typeof localStorage === 'undefined') return null;
        try {
            const cached = localStorage.getItem(`${CACHE_KEYS.CUSTOM_MESSAGES}_${locale}`);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }

    setCachedMessages (locale, messages) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(
                `${CACHE_KEYS.CUSTOM_MESSAGES}_${locale}`,
                JSON.stringify(messages)
            );
        } catch (error) {
            console.warn('Failed to cache messages:', error);
        }
    }

    updateStats (locale, messages) {
        const keyCount = Object.keys(messages).length;
        this.stats.coverage[locale] = keyCount;
        this.stats.customKeys = Object.values(this.stats.coverage).reduce((a, b) => a + b, 0);
    }
}

// Export singleton instance
export const localeManager = new LocaleManager();
export default LocaleManager;
