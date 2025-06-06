/**
 * Import/Export utilities for custom translations
 */

/**
 * Export custom translations to JSON format
 * @param {object} customMessagesByLocale - Custom messages by locale
 * @param {string} format - Export format ('json' or 'csv')
 * @returns {string} Exported data
 */
export const exportCustomTranslations = (customMessagesByLocale, format = 'json') => {
    switch (format.toLowerCase()) {
    case 'json':
        return JSON.stringify(customMessagesByLocale, null, 2);
    case 'csv':
        return exportToCSV(customMessagesByLocale);
    default:
        throw new Error(`Unsupported export format: ${format}`);
    }
};

/**
 * Import custom translations from JSON format
 * @param {string} data - JSON string to import
 * @returns {object} Parsed custom messages by locale
 */
export const importCustomTranslations = data => {
    try {
        const parsed = JSON.parse(data);
        
        // Validate structure
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Invalid data structure: expected object');
        }
        
        // Validate each locale's messages
        Object.keys(parsed).forEach(locale => {
            if (typeof parsed[locale] !== 'object' || parsed[locale] === null) {
                throw new Error(`Invalid messages for locale ${locale}: expected object`);
            }
            
            // Validate message values are strings
            Object.keys(parsed[locale]).forEach(key => {
                if (typeof parsed[locale][key] !== 'string') {
                    throw new Error(`Invalid message value for ${locale}.${key}: expected string`);
                }
            });
        });
        
        return parsed;
    } catch (error) {
        throw new Error(`Failed to import translations: ${error.message}`);
    }
};

/**
 * Export to CSV format
 * @param {object} customMessagesByLocale - Custom messages by locale
 * @returns {string} CSV data
 */
const exportToCSV = customMessagesByLocale => {
    const locales = Object.keys(customMessagesByLocale);
    if (locales.length === 0) {
        return 'key\n';
    }
    
    // Get all unique keys
    const allKeys = new Set();
    locales.forEach(locale => {
        Object.keys(customMessagesByLocale[locale]).forEach(key => {
            allKeys.add(key);
        });
    });
    
    // Create CSV header
    const header = ['key', ...locales].join(',');
    
    // Create CSV rows
    const rows = Array.from(allKeys).map(key => {
        const values = [key];
        locales.forEach(locale => {
            const value = customMessagesByLocale[locale][key] || '';
            // Escape CSV values
            values.push(`"${value.replace(/"/g, '""')}"`);
        });
        return values.join(',');
    });
    
    return [header, ...rows].join('\n');
};

/**
 * Import from CSV format
 * @param {string} csvData - CSV string to import
 * @returns {object} Parsed custom messages by locale
 */
export const importFromCSV = csvData => {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        throw new Error('Empty CSV data');
    }
    
    // Parse header
    const header = lines[0].split(',').map(col => col.trim());
    if (header[0] !== 'key') {
        throw new Error('Invalid CSV format: first column must be "key"');
    }
    
    const locales = header.slice(1);
    const result = {};
    
    // Initialize locale objects
    locales.forEach(locale => {
        result[locale] = {};
    });
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== header.length) {
            throw new Error(`Invalid CSV row ${i + 1}: expected ${header.length} columns, got ${values.length}`);
        }
        
        const key = values[0];
        if (!key) {
            continue; // Skip empty keys
        }
        
        locales.forEach((locale, index) => {
            const value = values[index + 1];
            if (value) {
                result[locale][key] = value;
            }
        });
    }
    
    return result;
};

/**
 * Parse a CSV line handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} Parsed values
 */
const parseCSVLine = line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // End of value
            values.push(current);
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    // Add final value
    values.push(current);
    
    return values;
};

/**
 * Merge imported translations with existing ones
 * @param {object} existing - Existing custom messages by locale
 * @param {object} imported - Imported custom messages by locale
 * @param {object} options - Merge options
 * @returns {object} Merged custom messages by locale
 */
export const mergeTranslations = (existing, imported, options = {}) => {
    const {
        overwrite = false,
        locales = null // null means all locales
    } = options;
    
    const result = JSON.parse(JSON.stringify(existing)); // Deep clone
    
    const targetLocales = locales || Object.keys(imported);
    
    targetLocales.forEach(locale => {
        if (!imported[locale]) return;
        
        if (!result[locale]) {
            result[locale] = {};
        }
        
        Object.keys(imported[locale]).forEach(key => {
            if (overwrite || !result[locale][key]) {
                result[locale][key] = imported[locale][key];
            }
        });
    });
    
    return result;
};

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
export const downloadAsFile = (data, filename, mimeType = 'application/json') => {
    const blob = new Blob([data], {type: mimeType});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
export const readFileAsText = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
});
