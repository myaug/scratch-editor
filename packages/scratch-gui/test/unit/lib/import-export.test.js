import {
    exportCustomTranslations,
    importCustomTranslations,
    importFromCSV,
    mergeTranslations
} from '../../src/lib/hybrid-localization/import-export';

describe('Import/Export Utilities', () => {
    const sampleData = {
        en: {
            'test.key1': 'Test Message 1',
            'test.key2': 'Test Message 2'
        },
        es: {
            'test.key1': 'Mensaje de Prueba 1',
            'test.key2': 'Mensaje de Prueba 2'
        }
    };

    describe('exportCustomTranslations', () => {
        it('should export to JSON format', () => {
            const result = exportCustomTranslations(sampleData, 'json');
            const parsed = JSON.parse(result);
            expect(parsed).toEqual(sampleData);
        });

        it('should export to CSV format', () => {
            const result = exportCustomTranslations(sampleData, 'csv');
            const lines = result.split('\n');
            
            expect(lines[0]).toBe('key,en,es');
            expect(lines[1]).toBe('test.key1,"Test Message 1","Mensaje de Prueba 1"');
            expect(lines[2]).toBe('test.key2,"Test Message 2","Mensaje de Prueba 2"');
        });

        it('should handle empty data', () => {
            const result = exportCustomTranslations({}, 'csv');
            expect(result).toBe('key\n');
        });

        it('should throw error for unsupported format', () => {
            expect(() => {
                exportCustomTranslations(sampleData, 'xml');
            }).toThrow('Unsupported export format: xml');
        });
    });

    describe('importCustomTranslations', () => {
        it('should import valid JSON data', () => {
            const jsonData = JSON.stringify(sampleData);
            const result = importCustomTranslations(jsonData);
            expect(result).toEqual(sampleData);
        });

        it('should throw error for invalid JSON', () => {
            expect(() => {
                importCustomTranslations('invalid json');
            }).toThrow('Failed to import translations');
        });

        it('should throw error for invalid structure', () => {
            expect(() => {
                importCustomTranslations('"not an object"');
            }).toThrow('Invalid data structure: expected object');
        });

        it('should throw error for invalid locale data', () => {
            const invalidData = {
                en: 'not an object'
            };
            
            expect(() => {
                importCustomTranslations(JSON.stringify(invalidData));
            }).toThrow('Invalid messages for locale en: expected object');
        });

        it('should throw error for non-string message values', () => {
            const invalidData = {
                en: {
                    'test.key': 123
                }
            };
            
            expect(() => {
                importCustomTranslations(JSON.stringify(invalidData));
            }).toThrow('Invalid message value for en.test.key: expected string');
        });
    });

    describe('importFromCSV', () => {
        const csvData = 'key,en,es\ntest.key1,"Test Message 1","Mensaje de Prueba 1"\ntest.key2,"Test Message 2","Mensaje de Prueba 2"';

        it('should import valid CSV data', () => {
            const result = importFromCSV(csvData);
            expect(result).toEqual(sampleData);
        });

        it('should handle quoted values with commas', () => {
            const csvWithCommas = 'key,en\ntest.key,"Hello, world!"';
            const result = importFromCSV(csvWithCommas);
            expect(result.en['test.key']).toBe('Hello, world!');
        });

        it('should handle escaped quotes', () => {
            const csvWithQuotes = 'key,en\ntest.key,"He said ""Hello"" to me"';
            const result = importFromCSV(csvWithQuotes);
            expect(result.en['test.key']).toBe('He said "Hello" to me');
        });

        it('should skip empty keys', () => {
            const csvWithEmpty = 'key,en\n,"Empty key"\ntest.key,"Valid"';
            const result = importFromCSV(csvWithEmpty);
            expect(result.en).toEqual({'test.key': 'Valid'});
        });

        it('should throw error for empty CSV', () => {
            expect(() => {
                importFromCSV('');
            }).toThrow('Empty CSV data');
        });

        it('should throw error for invalid header', () => {
            expect(() => {
                importFromCSV('invalid,header\ntest,value');
            }).toThrow('Invalid CSV format: first column must be "key"');
        });

        it('should throw error for mismatched columns', () => {
            expect(() => {
                importFromCSV('key,en\ntest.key,"value1","value2"');
            }).toThrow('Invalid CSV row 2: expected 2 columns, got 3');
        });
    });

    describe('mergeTranslations', () => {
        const existing = {
            en: {
                'key1': 'Existing 1',
                'key2': 'Existing 2'
            }
        };

        const imported = {
            en: {
                'key2': 'Imported 2',
                'key3': 'Imported 3'
            },
            es: {
                'key1': 'Importado 1'
            }
        };

        it('should merge without overwriting by default', () => {
            const result = mergeTranslations(existing, imported);
            
            expect(result).toEqual({
                en: {
                    'key1': 'Existing 1',
                    'key2': 'Existing 2', // Not overwritten
                    'key3': 'Imported 3'
                },
                es: {
                    'key1': 'Importado 1'
                }
            });
        });

        it('should overwrite when specified', () => {
            const result = mergeTranslations(existing, imported, {overwrite: true});
            
            expect(result).toEqual({
                en: {
                    'key1': 'Existing 1',
                    'key2': 'Imported 2', // Overwritten
                    'key3': 'Imported 3'
                },
                es: {
                    'key1': 'Importado 1'
                }
            });
        });

        it('should merge only specified locales', () => {
            const result = mergeTranslations(existing, imported, {
                locales: ['es']
            });
            
            expect(result).toEqual({
                en: {
                    'key1': 'Existing 1',
                    'key2': 'Existing 2'
                },
                es: {
                    'key1': 'Importado 1'
                }
            });
        });

        it('should handle missing imported locales', () => {
            const result = mergeTranslations(existing, imported, {
                locales: ['fr'] // Not in imported data
            });
            
            expect(result).toEqual(existing);
        });
    });
});
