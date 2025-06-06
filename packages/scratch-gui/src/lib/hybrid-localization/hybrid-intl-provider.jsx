import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {IntlProvider} from 'react-intl';
import {connect} from 'react-redux';

import {localeManager} from './locale-manager.js';
import {LOCALIZATION_MODES} from './constants.js';

const HybridIntlProvider = ({
    children,
    locale,
    messages: officialMessages,
    customMessages,
    localizationMode,
    ...otherProps
}) => {
    // Update LocaleManager with current custom messages
    React.useEffect(() => {
        if (customMessages && Object.keys(customMessages).length > 0) {
            localeManager.customMessages[locale] = customMessages;
        }
    }, [locale, customMessages]);

    // Combine official and custom messages based on mode
    const hybridMessages = useMemo(() => {
        // Ensure LocaleManager is using the correct mode
        localeManager.setMode(localizationMode);
        return localeManager.getHybridMessages(locale, officialMessages);
    }, [locale, officialMessages, customMessages, localizationMode]);

    // Calculate stats for development
    const stats = useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            const officialCount = Object.keys(officialMessages || {}).length;
            const customCount = Object.keys(customMessages || {}).length;
            const hybridCount = Object.keys(hybridMessages).length;
            
            return {
                official: officialCount,
                custom: customCount,
                hybrid: hybridCount,
                mode: localizationMode
            };
        }
        return null;
    }, [officialMessages, customMessages, locale, hybridMessages, localizationMode]);

    // Log stats in development
    React.useEffect(() => {
        if (stats && process.env.NODE_ENV === 'development') {
            console.group(`🌐 Hybrid Localization Stats (${locale})`);
            console.log(`Mode: ${stats.mode}`);
            console.log(`Official messages: ${stats.official}`);
            console.log(`Custom messages: ${stats.custom}`);
            console.log(`Total hybrid messages: ${stats.hybrid}`);
            console.log(`Custom override rate: ${stats.custom > 0 ?
                ((stats.custom / (stats.official + stats.custom)) * 100).toFixed(1) : 0}%`);
            console.groupEnd();
        }
    }, [stats, locale]);

    return (
        <IntlProvider
            key={`${locale}-${localizationMode}`} // Force re-render on mode change
            locale={locale}
            messages={hybridMessages}
            {...otherProps}
        >
            {children}
        </IntlProvider>
    );
};

HybridIntlProvider.propTypes = {
    children: PropTypes.node.isRequired,
    locale: PropTypes.string.isRequired,
    messages: PropTypes.object,
    customMessages: PropTypes.object,
    localizationMode: PropTypes.oneOf(Object.values(LOCALIZATION_MODES))
};

HybridIntlProvider.defaultProps = {
    messages: {},
    customMessages: {},
    localizationMode: LOCALIZATION_MODES.HYBRID
};

const mapStateToProps = state => ({
    locale: state.locales.locale,
    messages: state.locales.messages,
    customMessages: state.locales.customMessages || {},
    localizationMode: state.locales.localizationMode || LOCALIZATION_MODES.HYBRID
});

export default connect(mapStateToProps)(HybridIntlProvider);
