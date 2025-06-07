import React from 'react';
import {IntlProvider as ReactIntlProvider} from 'react-intl';
import {connect} from 'react-redux';
import LocaleLoader from '../components/locale-loader/locale-loader.jsx';

/**
 * Connected IntlProvider that uses combined messages from hybrid localization system
 * with locale loading support to prevent missing message errors
 */
const HybridConnectedIntlProvider = ({children, ...intlProps}) => (
    <LocaleLoader>
        <ReactIntlProvider {...intlProps}>
            {children}
        </ReactIntlProvider>
    </LocaleLoader>
);

/**
 * @param {object} state - Redux state
 * @returns {object} Props for IntlProvider
 */
const mapStateToProps = state => ({
    key: state.locales.locale,
    locale: state.locales.locale,
    messages: state.locales.combinedMessages || state.locales.messages
});

export default connect(mapStateToProps)(HybridConnectedIntlProvider);
