import {defineMessages as originalDefineMessages} from 'react-intl';

/**
 * Enhanced defineMessages that supports hybrid localization
 * This wrapper maintains compatibility with the original defineMessages
 * while adding support for custom message tracking
 * @param {object} messageDescriptors - Message descriptors object
 * @returns {object} Processed message descriptors
 */
export const defineMessages = messageDescriptors => {
    const definedMessages = originalDefineMessages(messageDescriptors);
    
    // Track message IDs for development and debugging
    if (process.env.NODE_ENV === 'development') {
        Object.keys(messageDescriptors).forEach(key => {
            const descriptor = messageDescriptors[key];
            if (descriptor.id && !window.__SCRATCH_HYBRID_LOCALIZATION_IDS__) {
                window.__SCRATCH_HYBRID_LOCALIZATION_IDS__ = new Set();
            }
            if (descriptor.id) {
                window.__SCRATCH_HYBRID_LOCALIZATION_IDS__.add(descriptor.id);
            }
        });
    }
    
    return definedMessages;
};

/**
 * Get all tracked message IDs (development only)
 * @returns {Array} Array of message IDs
 */
export const getTrackedMessageIds = () => {
    if (process.env.NODE_ENV === 'development' && window.__SCRATCH_HYBRID_LOCALIZATION_IDS__) {
        return Array.from(window.__SCRATCH_HYBRID_LOCALIZATION_IDS__);
    }
    return [];
};

/**
 * Export all react-intl components and functions
 * This allows this file to be used as a drop-in replacement for react-intl
 */
export {
    IntlProvider,
    FormattedMessage,
    FormattedDate,
    FormattedTime,
    FormattedNumber,
    FormattedPlural,
    injectIntl,
    intlShape
} from 'react-intl';
