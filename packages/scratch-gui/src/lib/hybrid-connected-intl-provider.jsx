import {IntlProvider as ReactIntlProvider} from 'react-intl';
import {connect} from 'react-redux';

/**
 * Connected IntlProvider that uses combined messages from hybrid localization system
 * @param {object} state - Redux state
 * @returns {object} Props for IntlProvider
 */
const mapStateToProps = state => ({
    key: state.locales.locale,
    locale: state.locales.locale,
    messages: state.locales.combinedMessages || state.locales.messages
});

export default connect(mapStateToProps)(ReactIntlProvider);
