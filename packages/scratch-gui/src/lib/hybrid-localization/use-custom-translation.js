// import React from 'react';
// import {connect} from 'react-redux';
// import {injectIntl} from 'react-intl';
// import LocaleManager from './locale-manager';

// Create a singleton instance of LocaleManager
// const localeManager = new LocaleManager();

/**
 * Legacy hook-style function for backward compatibility
 * This creates a pseudo-hook that works with the older React version
 * @returns {object} Translation utilities object
 */
const useCustomTranslation = () =>
    // This is a fallback implementation that can be used in class components
    // by calling it in render() method
    ({
        formatMessage: descriptor => (
            console.warn('useCustomTranslation should be used with withCustomTranslation HOC') ||
            descriptor.defaultMessage || descriptor.id || ''
        ),
        formatMessageSafe: (id, defaultMessage = '') => defaultMessage,
        getTranslationSource: () => 'unknown',
        hasCustomTranslation: () => false,
        getCustomTranslation: () => null,
        locale: 'en',
        localizationMode: 'hybrid',
        getStats: () => ({})
    })
;

export default useCustomTranslation;
