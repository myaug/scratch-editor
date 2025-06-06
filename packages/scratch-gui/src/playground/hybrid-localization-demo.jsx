import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import localesReducer, {localesInitialState} from '../reducers/locales';
import HybridLocalizationDemo from '../components/hybrid-localization-demo/hybrid-localization-demo.jsx';
import TranslationImportExport from '../components/translation-import-export/translation-import-export.jsx';
import LocalizationHOC from '../lib/localization-hoc.jsx';

import './index.css';

// Create a minimal store for the demo
const rootReducer = combineReducers({
    locales: localesReducer
});

const store = createStore(rootReducer, {
    locales: localesInitialState
});

// Wrap the demo with localization HOC
const LocalizedDemo = LocalizationHOC(() => (
    <div
        style={{padding: '2rem', maxWidth: '1200px', margin: '0 auto'}}
    >
        <h1
            style={{
                textAlign: 'center',
                marginBottom: '2rem',
                color: '#2c3e50'
            }}
        >
            {'Scratch GUI Hybrid Localization System Demo'}
        </h1>
        
        <div
            style={{
                display: 'grid',
                gap: '2rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
            }}
        >
            <div>
                <HybridLocalizationDemo />
            </div>
            <div>
                <TranslationImportExport />
            </div>
        </div>
        
        <div
            style={{
                marginTop: '3rem',
                padding: '1.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
            }}
        >
            <h3 style={{marginTop: 0, color: '#495057'}}>
                {'How to Use Hybrid Localization'}
            </h3>
            <ol style={{color: '#6c757d', lineHeight: '1.6'}}>
                <li>{'Switch between different localization modes using the settings above'}</li>
                <li>{'Add custom translations using the form in the demo section'}</li>
                <li>{'Import/export translations using JSON or CSV format'}</li>
                <li>{'See how custom translations take priority over official ones in hybrid mode'}</li>
                <li>{'Use custom-only mode to use only your translations'}</li>
                <li>{'Use official-only mode to disable custom translations'}</li>
            </ol>
        </div>
    </div>
));

// Render the demo
ReactDOM.render(
    <Provider store={store}>
        <LocalizedDemo />
    </Provider>,
    document.getElementById('app')
);
