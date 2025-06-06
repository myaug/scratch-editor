import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import {
    LOCALIZATION_MODE_HYBRID,
    LOCALIZATION_MODE_CUSTOM_ONLY,
    LOCALIZATION_MODE_TRANSIFEX_ONLY
} from '../../lib/hybrid-localization/constants';
import {setLocalizationMode} from '../../reducers/locales';

import styles from './localization-settings.css';

const messages = defineMessages({
    title: {
        id: 'gui.localizationSettings.title',
        defaultMessage: 'Localization Settings',
        description: 'Title for localization settings component'
    },
    modeLabel: {
        id: 'gui.localizationSettings.modeLabel',
        defaultMessage: 'Translation Mode:',
        description: 'Label for localization mode selector'
    },
    hybridMode: {
        id: 'gui.localizationSettings.hybridMode',
        defaultMessage: 'Hybrid (Custom + Official)',
        description: 'Label for hybrid localization mode'
    },
    customOnlyMode: {
        id: 'gui.localizationSettings.customOnlyMode',
        defaultMessage: 'Custom Only',
        description: 'Label for custom-only localization mode'
    },
    transifexOnlyMode: {
        id: 'gui.localizationSettings.transifexOnlyMode',
        defaultMessage: 'Official Only',
        description: 'Label for Transifex-only localization mode'
    },
    hybridDescription: {
        id: 'gui.localizationSettings.hybridDescription',
        defaultMessage: 'Uses custom translations when available, falls back to official translations',
        description: 'Description for hybrid mode'
    },
    customOnlyDescription: {
        id: 'gui.localizationSettings.customOnlyDescription',
        defaultMessage: 'Uses only custom translations (may have missing strings)',
        description: 'Description for custom-only mode'
    },
    transifexOnlyDescription: {
        id: 'gui.localizationSettings.transifexOnlyDescription',
        defaultMessage: 'Uses only official Transifex translations',
        description: 'Description for Transifex-only mode'
    },
    statsTitle: {
        id: 'gui.localizationSettings.statsTitle',
        defaultMessage: 'Translation Statistics',
        description: 'Title for translation statistics section'
    },
    customTranslations: {
        id: 'gui.localizationSettings.customTranslations',
        defaultMessage: 'Custom translations: {count}',
        description: 'Count of custom translations'
    },
    officialTranslations: {
        id: 'gui.localizationSettings.officialTranslations',
        defaultMessage: 'Official translations: {count}',
        description: 'Count of official translations'
    },
    coverage: {
        id: 'gui.localizationSettings.coverage',
        defaultMessage: 'Coverage: {percent}%',
        description: 'Translation coverage percentage'
    }
});

class LocalizationSettings extends React.Component {
    constructor (props) {
        super(props);
        this.handleModeChange = this.handleModeChange.bind(this);
    }

    handleModeChange (event) {
        this.props.onSetLocalizationMode(event.target.value);
    }

    render () {
        const {
            localizationMode,
            customMessages,
            messages: officialMessages
        } = this.props;

        const customCount = Object.keys(customMessages).length;
        const officialCount = Object.keys(officialMessages).length;
        const totalKeys = new Set([
            ...Object.keys(customMessages),
            ...Object.keys(officialMessages)
        ]).size;
        const coverage = totalKeys > 0 ? Math.round((customCount + officialCount) / totalKeys * 100) : 0;

        return (
            <div className={styles.container}>
                <h3 className={styles.title}>
                    <FormattedMessage {...messages.title} />
                </h3>
                
                <div className={styles.section}>
                    <label className={styles.label}>
                        <FormattedMessage {...messages.modeLabel} />
                    </label>
                    
                    <div className={styles.radioGroup}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value={LOCALIZATION_MODE_HYBRID}
                                checked={localizationMode === LOCALIZATION_MODE_HYBRID}
                                onChange={this.handleModeChange}
                                className={styles.radio}
                            />
                            <span className={styles.radioText}>
                                <FormattedMessage {...messages.hybridMode} />
                            </span>
                            <div className={styles.description}>
                                <FormattedMessage {...messages.hybridDescription} />
                            </div>
                        </label>
                        
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value={LOCALIZATION_MODE_CUSTOM_ONLY}
                                checked={localizationMode === LOCALIZATION_MODE_CUSTOM_ONLY}
                                onChange={this.handleModeChange}
                                className={styles.radio}
                            />
                            <span className={styles.radioText}>
                                <FormattedMessage {...messages.customOnlyMode} />
                            </span>
                            <div className={styles.description}>
                                <FormattedMessage {...messages.customOnlyDescription} />
                            </div>
                        </label>
                        
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value={LOCALIZATION_MODE_TRANSIFEX_ONLY}
                                checked={localizationMode === LOCALIZATION_MODE_TRANSIFEX_ONLY}
                                onChange={this.handleModeChange}
                                className={styles.radio}
                            />
                            <span className={styles.radioText}>
                                <FormattedMessage {...messages.transifexOnlyMode} />
                            </span>
                            <div className={styles.description}>
                                <FormattedMessage {...messages.transifexOnlyDescription} />
                            </div>
                        </label>
                    </div>
                </div>

                <div className={styles.section}>
                    <h4 className={styles.statsTitle}>
                        <FormattedMessage {...messages.statsTitle} />
                    </h4>
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <FormattedMessage
                                {...messages.customTranslations}
                                values={{count: customCount}}
                            />
                        </div>
                        <div className={styles.stat}>
                            <FormattedMessage
                                {...messages.officialTranslations}
                                values={{count: officialCount}}
                            />
                        </div>
                        <div className={styles.stat}>
                            <FormattedMessage
                                {...messages.coverage}
                                values={{percent: coverage}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

LocalizationSettings.propTypes = {
    localizationMode: PropTypes.string.isRequired,
    customMessages: PropTypes.object.isRequired,
    messages: PropTypes.object.isRequired,
    onSetLocalizationMode: PropTypes.func.isRequired,
    intl: intlShape.isRequired
};

const mapStateToProps = state => ({
    localizationMode: state.locales.localizationMode,
    customMessages: state.locales.customMessages,
    messages: state.locales.messages
});

const mapDispatchToProps = dispatch => ({
    onSetLocalizationMode: mode => dispatch(setLocalizationMode(mode))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(LocalizationSettings));
