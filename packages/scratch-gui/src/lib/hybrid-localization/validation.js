// Helper function to validate custom locale files
export const validateCustomLocale = customMessages => {
    const errors = [];
    const warnings = [];
    
    // Check for missing required keys
    const requiredKeys = [
        'gui.menuBar.settings',
        'gui.menuBar.file',
        'gui.menuBar.edit'
    ];
    
    requiredKeys.forEach(key => {
        if (!customMessages[key]) {
            errors.push(`Missing required key: ${key}`);
        }
    });
    
    // Check for empty values
    Object.entries(customMessages).forEach(([key, value]) => {
        if (!value || value.trim() === '') {
            warnings.push(`Empty value for key: ${key}`);
        }
    });
    
    return {errors, warnings};
};

// Check if custom translation exists for a specific ID
export const hasCustomTranslation = (id, customMessages, locale) =>
    customMessages[locale] && customMessages[locale][id];
