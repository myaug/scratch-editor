import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import {updateCustomMessages} from '../../reducers/locales';
import LocalizationSettings from '../localization-settings/localization-settings.jsx';

import styles from './hybrid-localization-demo.css';

const messages = defineMessages({
    title: {
        id: 'gui.hybridDemo.title',
        defaultMessage: 'Hybrid Localization Demo',
        description: 'Title for the hybrid localization demo'
    },
    description: {
        id: 'gui.hybridDemo.description',
        defaultMessage: 'This demo shows how custom translations work alongside official translations.',
        description: 'Description for the demo'
    },
    exampleSection: {
        id: 'gui.hybridDemo.exampleSection',
        defaultMessage: 'Translation Examples',
        description: 'Section title for translation examples'
    },
    officialExample: {
        id: 'gui.hybridDemo.officialExample',
        defaultMessage: 'Official Translation Example',
        description: 'Label for official translation example'
    },
    customExample: {
        id: 'gui.hybridDemo.customExample',
        defaultMessage: 'Custom Translation Example',
        description: 'Label for custom translation example'
    },
    sourceInfo: {
        id: 'gui.hybridDemo.sourceInfo',
        defaultMessage: 'Source: {source}',
        description: 'Shows the source of a translation'
    },
    addCustomTranslation: {
        id: 'gui.hybridDemo.addCustomTranslation',
        defaultMessage: 'Add Custom Translation',
        description: 'Button to add custom translation'
    },
    customTranslationKey: {
        id: 'gui.hybridDemo.customTranslationKey',
        defaultMessage: 'Translation Key:',
        description: 'Label for translation key input'
    },
    customTranslationValue: {
        id: 'gui.hybridDemo.customTranslationValue',
        defaultMessage: 'Custom Translation:',
        description: 'Label for custom translation input'
    },
    saveCustomTranslation: {
        id: 'gui.hybridDemo.saveCustomTranslation',
        defaultMessage: 'Save',
        description: 'Save button for custom translation'
    },
    cancel: {
        id: 'gui.hybridDemo.cancel',
        defaultMessage: 'Cancel',
        description: 'Cancel button'
    }
});

class HybridLocalizationDemo extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            showAddForm: false,
            newKey: '',
            newValue: ''
        };
        
        this.handleAddCustomTranslation = this.handleAddCustomTranslation.bind(this);
        this.handleSaveTranslation = this.handleSaveTranslation.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleKeyChange = this.handleKeyChange.bind(this);
        this.handleValueChange = this.handleValueChange.bind(this);
    }

    handleAddCustomTranslation () {
        this.setState({showAddForm: true});
    }

    handleSaveTranslation () {
        const {newKey, newValue} = this.state;
        if (newKey && newValue) {
            const updatedMessages = Object.assign({}, this.props.customMessages, {
                [newKey]: newValue
            });
            this.props.onUpdateCustomMessages(this.props.currentLocale, updatedMessages);
            this.setState({
                showAddForm: false,
                newKey: '',
                newValue: ''
            });
        }
    }

    handleCancel () {
        this.setState({
            showAddForm: false,
            newKey: '',
            newValue: ''
        });
    }

    handleKeyChange (event) {
        this.setState({newKey: event.target.value});
    }

    handleValueChange (event) {
        this.setState({newValue: event.target.value});
    }

    render () {
        const {intl} = this.props;
        const {showAddForm, newKey, newValue} = this.state;

        return (
            <div className={styles.container}>
                <h2 className={styles.title}>
                    <FormattedMessage {...messages.title} />
                </h2>
                
                <p className={styles.description}>
                    <FormattedMessage {...messages.description} />
                </p>

                <LocalizationSettings />

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <FormattedMessage {...messages.exampleSection} />
                    </h3>

                    <div className={styles.examples}>
                        <ConnectedExampleTranslation
                            messageId="gui.menuBar.file"
                            label={intl.formatMessage(messages.officialExample)}
                        />
                        <ConnectedExampleTranslation
                            messageId="gui.hybridDemo.customExample"
                            label={intl.formatMessage(messages.customExample)}
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    {showAddForm ? null : (
                        <button
                            className={styles.addButton}
                            onClick={this.handleAddCustomTranslation}
                        >
                            <FormattedMessage {...messages.addCustomTranslation} />
                        </button>
                    )}
                    {showAddForm && (
                        <div className={styles.addForm}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FormattedMessage {...messages.customTranslationKey} />
                                </label>
                                <input
                                    type="text"
                                    value={newKey}
                                    onChange={this.handleKeyChange}
                                    className={styles.input}
                                    placeholder="gui.example.key"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>
                                    <FormattedMessage {...messages.customTranslationValue} />
                                </label>
                                <input
                                    type="text"
                                    value={newValue}
                                    onChange={this.handleValueChange}
                                    className={styles.input}
                                    placeholder="Your custom translation"
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button
                                    className={styles.saveButton}
                                    onClick={this.handleSaveTranslation}
                                >
                                    <FormattedMessage {...messages.saveCustomTranslation} />
                                </button>
                                <button
                                    className={styles.cancelButton}
                                    onClick={this.handleCancel}
                                >
                                    <FormattedMessage {...messages.cancel} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

HybridLocalizationDemo.propTypes = {
    // ... existing propTypes
};

// Component to demonstrate individual translations with source info
const ExampleTranslation = ({messageId, label, intl, customMessages}) => {
    // Simple implementation of translation source detection
    const getTranslationSource = id => {
        if (customMessages && customMessages[id]) {
            return 'custom';
        }
        return 'official';
    };
    
    const source = getTranslationSource(messageId);
        
    return (
        <div className={styles.example}>
            <div className={styles.exampleLabel}>{label}</div>
            <div className={styles.exampleContent}>
                <div className={styles.translationText}>
                    {intl.formatMessage({id: messageId, defaultMessage: `[${messageId}]`})}
                </div>
                <div className={styles.sourceInfo}>
                    <FormattedMessage
                        {...messages.sourceInfo}
                        values={{source}}
                    />
                </div>
            </div>
        </div>
    );
};

ExampleTranslation.propTypes = {
    messageId: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    customMessages: PropTypes.object
};

// Connect ExampleTranslation to Redux
const ConnectedExampleTranslation = connect(
    state => ({
        customMessages: state.locales.customMessages
    })
)(injectIntl(ExampleTranslation));

HybridLocalizationDemo.propTypes = {
    currentLocale: PropTypes.string.isRequired,
    customMessages: PropTypes.object.isRequired,
    onUpdateCustomMessages: PropTypes.func.isRequired,
    intl: intlShape.isRequired
};

const mapStateToProps = state => ({
    currentLocale: state.locales.locale,
    customMessages: state.locales.customMessages
});

const mapDispatchToProps = dispatch => ({
    onUpdateCustomMessages: (locale, localeMessages) => dispatch(updateCustomMessages(locale, localeMessages))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(HybridLocalizationDemo));
