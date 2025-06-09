/**
 * @fileoverview
 * Utility function to detect and manage block level setting.
 */

import {BLOCK_LEVELS} from './block-levels';

const LEVEL_KEY = 'scratchBlockLevel';

/**
 * Get the saved block level from localStorage or default to Explorer
 * @return {string} the preferred block level
 */
const getStoredLevel = () => {
    try {
        const stored = localStorage.getItem(LEVEL_KEY);
        if (stored && Object.values(BLOCK_LEVELS).includes(stored)) {
            return stored;
        }
    } catch (e) {
        // localStorage might not be available
        console.warn('Could not access localStorage for block level');
    }
    return BLOCK_LEVELS.EXPLORER; // default
};

/**
 * Save the block level to localStorage
 * @param {string} level the block level to save
 */
const setStoredLevel = level => {
    try {
        if (Object.values(BLOCK_LEVELS).includes(level)) {
            localStorage.setItem(LEVEL_KEY, level);
        }
    } catch (e) {
        // localStorage might not be available
        console.warn('Could not save block level to localStorage');
    }
};

export {
    getStoredLevel,
    setStoredLevel
};
