import LocaleManager from '../../src/lib/hybrid-localization/locale-manager';
import {
    LOCALIZATION_MODE_HYBRID,
    LOCALIZATION_MODE_CUSTOM_ONLY,
    LOCALIZATION_MODE_TRANSIFEX_ONLY
} from '../../src/lib/hybrid-localization/constants';

describe('LocaleManager', () => {
    let localeManager;

    beforeEach(() => {
        localeManager = new LocaleManager();
    });

    describe('loadCustomLocale', () => {
        it('should load custom locale data', async () => {
            const mockData = {'test.key': 'Test Value'};
            
            // Mock fetch for testing
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockData)
                })
            );

            const result = await localeManager.loadCustomLocale('en');
            expect(result).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledWith('/custom-locales/en.json');
        });

        it('should handle load errors gracefully', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 404
                })
            );

            const result = await localeManager.loadCustomLocale('nonexistent');
            expect(result).toEqual({});
        });

        it('should cache loaded locales', async () => {
            const mockData = {'test.key': 'Test Value'};
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockData)
                })
            );

            // Load twice
            await localeManager.loadCustomLocale('en');
            await localeManager.loadCustomLocale('en');

            // Should only fetch once due to caching
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('combineMessages', () => {
        const transifexMessages = {
            'common.key': 'Official Message',
            'official.only': 'Official Only'
        };

        const customMessages = {
            'common.key': 'Custom Message',
            'custom.only': 'Custom Only'
        };

        it('should combine messages in hybrid mode', () => {
            const result = localeManager.combineMessages(
                transifexMessages,
                customMessages,
                LOCALIZATION_MODE_HYBRID
            );

            expect(result).toEqual({
                'common.key': 'Custom Message', // Custom overrides official
                'official.only': 'Official Only',
                'custom.only': 'Custom Only'
            });
        });

        it('should use only custom messages in custom-only mode', () => {
            const result = localeManager.combineMessages(
                transifexMessages,
                customMessages,
                LOCALIZATION_MODE_CUSTOM_ONLY
            );

            expect(result).toEqual(customMessages);
        });

        it('should use only official messages in transifex-only mode', () => {
            const result = localeManager.combineMessages(
                transifexMessages,
                customMessages,
                LOCALIZATION_MODE_TRANSIFEX_ONLY
            );

            expect(result).toEqual(transifexMessages);
        });

        it('should handle empty custom messages', () => {
            const result = localeManager.combineMessages(
                transifexMessages,
                {},
                LOCALIZATION_MODE_HYBRID
            );

            expect(result).toEqual(transifexMessages);
        });

        it('should handle empty official messages', () => {
            const result = localeManager.combineMessages(
                {},
                customMessages,
                LOCALIZATION_MODE_HYBRID
            );

            expect(result).toEqual(customMessages);
        });
    });

    describe('getMessageSource', () => {
        const transifexMessages = {'test.key': 'Official Message'};
        const customMessages = {'test.key': 'Custom Message'};

        beforeEach(() => {
            localeManager.cache.set('en-transifex', transifexMessages);
            localeManager.cache.set('en-custom', customMessages);
        });

        it('should identify custom source', () => {
            const source = localeManager.getMessageSource('test.key', 'en');
            expect(source).toBe('custom');
        });

        it('should identify transifex source when no custom override', () => {
            const source = localeManager.getMessageSource('official.only', 'en');
            expect(source).toBe('transifex');
        });

        it('should return unknown for missing keys', () => {
            const source = localeManager.getMessageSource('missing.key', 'en');
            expect(source).toBe('unknown');
        });
    });

    describe('getStatistics', () => {
        beforeEach(() => {
            localeManager.cache.set('en-transifex', {
                'key1': 'Official 1',
                'key2': 'Official 2',
                'key3': 'Official 3'
            });
            localeManager.cache.set('en-custom', {
                'key1': 'Custom 1',
                'key4': 'Custom 4'
            });
        });

        it('should calculate correct statistics', () => {
            const stats = localeManager.getStatistics('en');
            
            expect(stats).toEqual({
                customCount: 2,
                transifexCount: 3,
                overrideCount: 1,
                totalKeys: 4,
                coverage: 100
            });
        });

        it('should handle missing locales', () => {
            const stats = localeManager.getStatistics('nonexistent');
            
            expect(stats).toEqual({
                customCount: 0,
                transifexCount: 0,
                overrideCount: 0,
                totalKeys: 0,
                coverage: 0
            });
        });
    });

    describe('clearCache', () => {
        it('should clear specific locale cache', () => {
            localeManager.cache.set('en-custom', {'test': 'value'});
            localeManager.cache.set('es-custom', {'test': 'valor'});
            
            localeManager.clearCache('en');
            
            expect(localeManager.cache.has('en-custom')).toBe(false);
            expect(localeManager.cache.has('es-custom')).toBe(true);
        });

        it('should clear all cache when no locale specified', () => {
            localeManager.cache.set('en-custom', {'test': 'value'});
            localeManager.cache.set('es-custom', {'test': 'valor'});
            
            localeManager.clearCache();
            
            expect(localeManager.cache.size).toBe(0);
        });
    });
});
