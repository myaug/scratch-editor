#!/usr/bin/env node

const fs = require('fs');
// const path = require('path');
const glob = require('glob');

/**
 * Extract FormattedMessage IDs from React components
 * @param {string} content - File content to scan
 * @returns {Array<string>} Array of translation IDs
 */
const extractIds = function (content) {
    const idRegex = /<FormattedMessage[^>]*id=["']([^"']+)["'][^>]*>/g;
    const ids = [];
    let match;
    
    while ((match = idRegex.exec(content)) !== null) {
        ids.push(match[1]);
    }
    
    return ids;
};

/**
 * Scan all JSX files for translation IDs
 * @returns {Array<string>} Array of all found translation IDs
 */
const scanFiles = function () {
    const files = glob.sync('src/**/*.{js,jsx}', {
        cwd: process.cwd()
    });
    
    const allIds = new Set();
    
    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        const ids = extractIds(content);
        ids.forEach(id => allIds.add(id));
    });
    
    return Array.from(allIds).sort();
};

/**
 * Generate template for custom locale
 * @param {Array<string>} ids - Array of translation IDs
 * @returns {object} Template object with placeholder values
 */
const generateTemplate = function (ids) {
    const template = {};
    ids.forEach(id => {
        template[id] = `[TRANSLATE: ${id}]`;
    });
    return template;
};

// Main execution
const ids = scanFiles();
const template = generateTemplate(ids);

// Write to file
fs.writeFileSync(
    'src/lib/custom-locales/template.json',
    JSON.stringify(template, null, 2)
);
