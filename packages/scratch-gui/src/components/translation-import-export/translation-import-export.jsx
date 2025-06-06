import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import {updateCustomMessages, clearCustomMessages} from '../../reducers/locales';
import {
    exportCustomTranslations,
    importCustomTranslations,
    importFromCSV,
    mergeTranslations,
    downloadAsFile,
    readFileAsText
} from '../../lib/hybrid-localization/import-export';

import styles from './translation-import-export.css';

const messages = defineMessages({
    title: {
        id: 'gui.translationImportExport.title',
        defaultMessage: 'Import/Export Translations',
        description: 'Title for translation import/export component'
    },
    exportSection: {
        id: 'gui.translationImportExport.exportSection',
        defaultMessage: 'Export Translations',
        description: 'Section title for export functionality'
    },
    importSection: {
        id: 'gui.translationImportExport.importSection',
        defaultMessage: 'Import Translations',
        description: 'Section title for import functionality'
    },
    exportJson: {
        id: 'gui.translationImportExport.exportJson',
        defaultMessage: 'Export as JSON',
        description: 'Button to export translations as JSON'
    },
    exportCsv: {
        id: 'gui.translationImportExport.exportCsv',
        defaultMessage: 'Export as CSV',
        description: 'Button to export translations as CSV'
    },
    importFile: {
        id: 'gui.translationImportExport.importFile',
        defaultMessage: 'Choose File',
        description: 'Button to choose file for import'
    },
    importButton: {
        id: 'gui.translationImportExport.importButton',
        defaultMessage: 'Import',
        description: 'Button to import translations'
    },
    clearAll: {
        id: 'gui.translationImportExport.clearAll',
        defaultMessage: 'Clear All',
        description: 'Button to clear all custom translations'
    },
    mergeMode: {
        id: 'gui.translationImportExport.mergeMode',
        defaultMessage: 'Merge Mode:',
        description: 'Label for merge mode selection'
    },
    mergeReplace: {
        id: 'gui.translationImportExport.mergeReplace',
        defaultMessage: 'Replace existing',
        description: 'Option to replace existing translations'
    },
    mergeKeep: {
        id: 'gui.translationImportExport.mergeKeep',
        defaultMessage: 'Keep existing',
        description: 'Option to keep existing translations'
    },
    noTranslations: {
        id: 'gui.translationImportExport.noTranslations',
        defaultMessage: 'No custom translations to export',
        description: 'Message when there are no translations to export'
    },
    importSuccess: {
        id: 'gui.translationImportExport.importSuccess',
        defaultMessage: 'Successfully imported {count} translations',
        description: 'Success message for import'
    },
    importError: {
        id: 'gui.translationImportExport.importError',
        defaultMessage: 'Import failed: {error}',
        description: 'Error message for import'
    },
    clearConfirm: {
        id: 'gui.translationImportExport.clearConfirm',
        defaultMessage: 'Are you sure you want to clear all custom translations?',
        description: 'Confirmation message for clearing translations'
    },
    fileFormatInfo: {
        id: 'gui.translationImportExport.fileFormatInfo',
        defaultMessage: 'Supported formats: JSON, CSV',
        description: 'Information about supported file formats'
    }
});

class TranslationImportExport extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            importFile: null,
            mergeMode: 'replace',
            message: null,
            messageType: 'info'
        };
        
        this.fileInputRef = React.createRef();
        
        this.handleExportJson = this.handleExportJson.bind(this);
        this.handleExportCsv = this.handleExportCsv.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleImport = this.handleImport.bind(this);
        this.handleClearAll = this.handleClearAll.bind(this);
        this.handleMergeModeChange = this.handleMergeModeChange.bind(this);
        this.clearMessage = this.clearMessage.bind(this);
    }

    handleExportJson () {
        const {customMessagesByLocale} = this.props;
        if (Object.keys(customMessagesByLocale).length === 0) {
            this.showMessage(this.props.intl.formatMessage(messages.noTranslations), 'warning');
            return;
        }
        
        const data = exportCustomTranslations(customMessagesByLocale, 'json');
        const filename = `scratch-custom-translations-${new Date().toISOString()
            .split('T')[0]}.json`;
        downloadAsFile(data, filename, 'application/json');
    }

    handleExportCsv () {
        const {customMessagesByLocale} = this.props;
        if (Object.keys(customMessagesByLocale).length === 0) {
            this.showMessage(this.props.intl.formatMessage(messages.noTranslations), 'warning');
            return;
        }
        
        const data = exportCustomTranslations(customMessagesByLocale, 'csv');
        const filename = `scratch-custom-translations-${new Date().toISOString()
            .split('T')[0]}.csv`;
        downloadAsFile(data, filename, 'text/csv');
    }

    handleFileChange (event) {
        this.setState({
            importFile: event.target.files[0],
            message: null
        });
    }

    async handleImport () {
        const {importFile, mergeMode} = this.state;
        const {customMessagesByLocale, onUpdateCustomMessages} = this.props;
        
        if (!importFile) {
            this.showMessage('Please select a file to import', 'error');
            return;
        }
        
        try {
            const fileContent = await readFileAsText(importFile);
            let importedData;
            
            if (importFile.name.endsWith('.json')) {
                importedData = importCustomTranslations(fileContent);
            } else if (importFile.name.endsWith('.csv')) {
                importedData = importFromCSV(fileContent);
            } else {
                throw new Error('Unsupported file format. Please use JSON or CSV files.');
            }
            
            const mergedData = mergeTranslations(
                customMessagesByLocale,
                importedData,
                {overwrite: mergeMode === 'replace'}
            );
            
            // Update each locale
            const locales = Object.keys(importedData);
            locales.forEach(locale => {
                onUpdateCustomMessages(locale, mergedData[locale] || {});
            });
            
            const totalCount = Object.values(importedData).reduce(
                (sum, localeMessages) => sum + Object.keys(localeMessages).length,
                0
            );
            
            this.showMessage(
                this.props.intl.formatMessage(messages.importSuccess, {count: totalCount}),
                'success'
            );
            
            // Clear file input
            this.setState({importFile: null});
            this.fileInputRef.current.value = '';
            
        } catch (error) {
            this.showMessage(
                this.props.intl.formatMessage(messages.importError, {error: error.message}),
                'error'
            );
        }
    }

    handleClearAll () {
        // eslint-disable-next-line no-alert
        const confirmed = window.confirm(
            this.props.intl.formatMessage(messages.clearConfirm)
        );
        
        if (confirmed) {
            this.props.onClearCustomMessages();
            this.showMessage('All custom translations cleared', 'success');
        }
    }

    handleMergeModeChange (event) {
        this.setState({mergeMode: event.target.value});
    }

    showMessage (message, type) {
        this.setState({message, messageType: type});
        setTimeout(this.clearMessage, 5000);
    }

    clearMessage () {
        this.setState({message: null});
    }

    handleCloseMessage () {
        this.setState({message: null});
    }

    handleFileButtonClick () {
        this.fileInputRef.current.click();
    }

    render () {
        const {importFile, mergeMode, message, messageType} = this.state;
        
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>
                    <FormattedMessage {...messages.title} />
                </h3>
                
                {message && (
                    <div className={`${styles.message} ${styles[messageType]}`}>
                        {message}
                        <button
                            className={styles.closeMessage}
                            onClick={this.handleCloseMessage}
                        >
                            {'×'}
                        </button>
                    </div>
                )}
                
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <FormattedMessage {...messages.exportSection} />
                    </h4>
                    <div className={styles.buttons}>
                        <button
                            className={styles.exportButton}
                            onClick={this.handleExportJson}
                        >
                            <FormattedMessage {...messages.exportJson} />
                        </button>
                        <button
                            className={styles.exportButton}
                            onClick={this.handleExportCsv}
                        >
                            <FormattedMessage {...messages.exportCsv} />
                        </button>
                    </div>
                </div>
                
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>
                        <FormattedMessage {...messages.importSection} />
                    </h4>
                    
                    <div className={styles.importForm}>
                        <div className={styles.fileInput}>
                            <input
                                ref={this.fileInputRef}
                                type="file"
                                accept=".json,.csv"
                                onChange={this.handleFileChange}
                                className={styles.hiddenInput}
                            />
                            <button
                                className={styles.fileButton}
                                onClick={this.handleFileButtonClick}
                            >
                                <FormattedMessage {...messages.importFile} />
                            </button>
                            {importFile && (
                                <span className={styles.fileName}>
                                    {importFile.name}
                                </span>
                            )}
                        </div>
                        
                        <div className={styles.mergeOptions}>
                            <label className={styles.mergeLabel}>
                                <FormattedMessage {...messages.mergeMode} />
                            </label>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    value="replace"
                                    checked={mergeMode === 'replace'}
                                    onChange={this.handleMergeModeChange}
                                />
                                <FormattedMessage {...messages.mergeReplace} />
                            </label>
                            <label className={styles.radioOption}>
                                <input
                                    type="radio"
                                    value="keep"
                                    checked={mergeMode === 'keep'}
                                    onChange={this.handleMergeModeChange}
                                />
                                <FormattedMessage {...messages.mergeKeep} />
                            </label>
                        </div>
                        
                        <div className={styles.buttons}>
                            <button
                                className={styles.importButton}
                                onClick={this.handleImport}
                                disabled={!importFile}
                            >
                                <FormattedMessage {...messages.importButton} />
                            </button>
                            <button
                                className={styles.clearButton}
                                onClick={this.handleClearAll}
                            >
                                <FormattedMessage {...messages.clearAll} />
                            </button>
                        </div>
                    </div>
                    
                    <div className={styles.info}>
                        <FormattedMessage {...messages.fileFormatInfo} />
                    </div>
                </div>
            </div>
        );
    }
}

TranslationImportExport.propTypes = {
    customMessagesByLocale: PropTypes.object.isRequired,
    onUpdateCustomMessages: PropTypes.func.isRequired,
    onClearCustomMessages: PropTypes.func.isRequired,
    intl: intlShape.isRequired
};

const mapStateToProps = state => ({
    customMessagesByLocale: state.locales.customMessagesByLocale
});

const mapDispatchToProps = dispatch => ({
    onUpdateCustomMessages: (locale, localeMessages) => dispatch(updateCustomMessages(locale, localeMessages)),
    onClearCustomMessages: () => dispatch(clearCustomMessages())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(TranslationImportExport));
