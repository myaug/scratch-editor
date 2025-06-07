import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {loadCustomLocaleAsync} from '../../reducers/locales';

/**
 * Component that ensures custom locales are loaded before rendering children
 * This prevents the "Missing message" errors by waiting for custom locale to load
 */
class LocaleLoader extends React.Component {
    async componentDidMount() {
        const {locale, customLocalesLoaded, customLocalesLoading, onLoadCustomLocale} = this.props;
        
        // Load custom locale if not loaded and not loading
        if (!customLocalesLoaded[locale] && !customLocalesLoading[locale]) {
            await onLoadCustomLocale(locale);
        }
    }

    async componentDidUpdate(prevProps) {
        const {locale, customLocalesLoaded, customLocalesLoading, onLoadCustomLocale} = this.props;
        
        // If locale changed, load the new custom locale if needed
        if (prevProps.locale !== locale && !customLocalesLoaded[locale] && !customLocalesLoading[locale]) {
            await onLoadCustomLocale(locale);
        }
    }

    render() {
        const {children, locale, customLocalesLoading, customLocalesLoaded} = this.props;

        // Show loading state if currently loading or custom locale not loaded yet
        const isLoading = customLocalesLoading[locale] || !customLocalesLoaded[locale];
        
        if (isLoading) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#f0f0f0',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{textAlign: 'center'}}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid #f3f3f3',
                            borderTop: '3px solid #ff6900',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }}></div>
                        <p style={{margin: 0, color: '#666'}}>
                            Loading localization...
                        </p>
                        <style>
                            {`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}
                        </style>
                    </div>
                </div>
            );
        }

        return children;
    }
}

LocaleLoader.propTypes = {
    children: PropTypes.node.isRequired,
    locale: PropTypes.string.isRequired,
    customLocalesLoaded: PropTypes.object.isRequired,
    customLocalesLoading: PropTypes.object.isRequired,
    onLoadCustomLocale: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    locale: state.locales.locale,
    customLocalesLoaded: state.locales.customLocalesLoaded || {},
    customLocalesLoading: state.locales.customLocalesLoading || {}
});

const mapDispatchToProps = dispatch => ({
    onLoadCustomLocale: locale => dispatch(loadCustomLocaleAsync(locale))
});

export default connect(mapStateToProps, mapDispatchToProps)(LocaleLoader);
