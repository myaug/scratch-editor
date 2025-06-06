import {createStore, combineReducers, compose, Store} from 'redux';
import localesReducer, {initLocale, localesInitialState} from '../reducers/locales';
import locales from 'scratch-l10n';
import {detectLocale} from './detect-locale';
import {GUIConfig} from '../gui-config';
import {initializeCustomLocales} from './hybrid-localization/auto-loader';

interface WindowWithDevtools {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
}

const composeEnhancers = (window as WindowWithDevtools).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// TypeScript doesn't know about require here, and we don't want to change behavior, so...
declare function require(path: '../reducers/gui'): typeof import('../reducers/gui');
declare function require(path: 'scratch-paint'): typeof import('scratch-paint');
declare function require(path: '../legacy-config'): typeof import('../legacy-config');

export interface EditorStateParams {
    localesOnly?: boolean;
    isFullScreen?: boolean;
    isPlayerOnly?: boolean;
    showTelemetryModal?: boolean;
}

/**
 * Manages an editor's Redux state.
 *
 * To be used in tandem with an AppStateHOC component to be provided to the editor.
 */
export class EditorState {
    /**
     * The redux store that this class wraps.
     */
    public readonly store: Store<unknown>;

    constructor (params: EditorStateParams, configFactory: () => GUIConfig) {
        let initialState = {};
        let reducers = {};
        let enhancer;

        let initializedLocales = localesInitialState;
        const locale = detectLocale(Object.keys(locales));
        if (locale !== 'en') {
            initializedLocales = initLocale(initializedLocales, locale);
        }
        if (params.localesOnly) {
            // Used for instantiating minimal state for the unsupported
            // browser modal
            reducers = {locales: localesReducer};
            initialState = {locales: initializedLocales};
            enhancer = composeEnhancers();
        } else {
            // You are right, this is gross. But it's necessary to avoid
            // importing unneeded code that will crash unsupported browsers.
            const guiRedux = require('../reducers/gui');
            const guiReducer = guiRedux.default;
            const {
                buildInitialState,
                guiMiddleware,
                initFullScreen,
                initPlayer,
                initTelemetryModal
            } = guiRedux;
            const {ScratchPaintReducer} = require('scratch-paint');

            const configOrLegacy = configFactory ?
                configFactory() :
                require('../legacy-config').legacyConfig;

            let initializedGui = buildInitialState(configOrLegacy);
            if (params.isFullScreen || params.isPlayerOnly) {
                if (params.isFullScreen) {
                    initializedGui = initFullScreen(initializedGui);
                }
                if (params.isPlayerOnly) {
                    initializedGui = initPlayer(initializedGui);
                }
            } else if (params.showTelemetryModal) {
                initializedGui = initTelemetryModal(initializedGui);
            }
            reducers = {
                locales: localesReducer,
                scratchGui: guiReducer,
                scratchPaint: ScratchPaintReducer
            };
            initialState = {
                locales: initializedLocales,
                scratchGui: initializedGui
            };
            enhancer = composeEnhancers(guiMiddleware);
        }
        const reducer = combineReducers(reducers);
        this.store = createStore(reducer, initialState, enhancer);
        
        // Auto-load custom locales after store initialization
        this.initializeCustomLocales();
    }
    
    /**
     * Initialize custom locale files automatically
     */
    private async initializeCustomLocales() {
        try {
            await initializeCustomLocales(this.store.getState(), this.store.dispatch);
        } catch (error) {
            console.warn('Failed to initialize custom locales:', error);
        }
    }

    dispatch (action) {
        this.store.dispatch(action);
    }
}
