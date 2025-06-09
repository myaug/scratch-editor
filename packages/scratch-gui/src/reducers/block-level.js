import {BLOCK_LEVELS} from '../lib/block-levels';
import {getStoredLevel, setStoredLevel} from '../lib/detect-level';

const SET_BLOCK_LEVEL = 'scratch-gui/block-level/SET_BLOCK_LEVEL';

const initialState = {
    level: getStoredLevel() // Load from localStorage
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_BLOCK_LEVEL:
        // Save to localStorage when level changes
        setStoredLevel(action.level);
        return Object.assign({}, state, {
            level: action.level
        });
    default:
        return state;
    }
};

const setLevel = level => ({
    type: SET_BLOCK_LEVEL,
    level: level
});

export {
    reducer as default,
    initialState as blockLevelInitialState,
    setLevel
};
