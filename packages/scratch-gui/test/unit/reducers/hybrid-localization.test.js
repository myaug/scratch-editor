import {
    LOCALIZATION_MODE_HYBRID,
    LOCALIZATION_MODE_CUSTOM_ONLY,
    LOCALIZATION_MODE_TRANSIFEX_ONLY,
    SET_LOCALIZATION_MODE,
    UPDATE_CUSTOM_MESSAGES,
    CLEAR_CUSTOM_MESSAGES
} from '../../../src/lib/hybrid-localization/constants';

import localesReducer, {
    localesInitialState,
    setLocalizationMode,
    updateCustomMessages,
    clearCustomMessages
} from '../../../src/reducers/locales';

describe('Hybrid Localization Reducer', () => {
    const initialState = {
        ...localesInitialState,
        locale: 'en',
        messages: {'test.key': 'Official Message'},
        messagesByLocale: {
            en: {'test.key': 'Official Message'},
            es: {'test.key': 'Mensaje Oficial'}
        }
    };

    it('should return the initial state', () => {
        expect(localesReducer(undefined, {})).toEqual(localesInitialState);
    });

    it('should handle SET_LOCALIZATION_MODE', () => {
        const action = setLocalizationMode(LOCALIZATION_MODE_CUSTOM_ONLY);
        const expectedState = {
            ...initialState,
            localizationMode: LOCALIZATION_MODE_CUSTOM_ONLY,
            combinedMessages: {} // Custom-only mode with no custom messages
        };

        expect(localesReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle UPDATE_CUSTOM_MESSAGES', () => {
        const customMessages = {'test.key': 'Custom Message'};
        const action = updateCustomMessages('en', customMessages);
        
        const expectedState = {
            ...initialState,
            customMessages,
            customMessagesByLocale: {en: customMessages},
            combinedMessages: {'test.key': 'Custom Message'} // Custom overrides official
        };

        expect(localesReducer(initialState, action)).toEqual(expectedState);
    });

    it('should handle CLEAR_CUSTOM_MESSAGES', () => {
        const stateWithCustom = {
            ...initialState,
            customMessages: {'test.key': 'Custom Message'},
            customMessagesByLocale: {en: {'test.key': 'Custom Message'}},
            combinedMessages: {'test.key': 'Custom Message'}
        };

        const action = clearCustomMessages('en');
        const expectedState = {
            ...stateWithCustom,
            customMessages: {},
            customMessagesByLocale: {},
            combinedMessages: {'test.key': 'Official Message'} // Falls back to official
        };

        expect(localesReducer(stateWithCustom, action)).toEqual(expectedState);
    });

    it('should combine messages correctly in hybrid mode', () => {
        const customMessages = {
            'test.key': 'Custom Message',
            'custom.only': 'Custom Only Message'
        };
        
        const action = updateCustomMessages('en', customMessages);
        const result = localesReducer(initialState, action);
        
        expect(result.combinedMessages).toEqual({
            'test.key': 'Custom Message', // Custom overrides official
            'custom.only': 'Custom Only Message' // Custom only
        });
    });

    it('should use only custom messages in custom-only mode', () => {
        const stateWithCustom = {
            ...initialState,
            localizationMode: LOCALIZATION_MODE_CUSTOM_ONLY,
            customMessages: {'custom.key': 'Custom Message'},
            customMessagesByLocale: {en: {'custom.key': 'Custom Message'}}
        };

        const action = setLocalizationMode(LOCALIZATION_MODE_CUSTOM_ONLY);
        const result = localesReducer(stateWithCustom, action);
        
        expect(result.combinedMessages).toEqual({'custom.key': 'Custom Message'});
    });

    it('should use only official messages in transifex-only mode', () => {
        const stateWithCustom = {
            ...initialState,
            customMessages: {'custom.key': 'Custom Message'},
            customMessagesByLocale: {en: {'custom.key': 'Custom Message'}}
        };

        const action = setLocalizationMode(LOCALIZATION_MODE_TRANSIFEX_ONLY);
        const result = localesReducer(stateWithCustom, action);
        
        expect(result.combinedMessages).toEqual({'test.key': 'Official Message'});
    });
});
