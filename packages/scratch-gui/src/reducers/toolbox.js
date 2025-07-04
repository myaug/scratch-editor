const UPDATE_TOOLBOX = 'scratch-gui/toolbox/UPDATE_TOOLBOX';
import makeToolboxXML from '../lib/make-toolbox-xml';
import {BLOCK_LEVELS} from '../lib/block-levels';

const initialState = {
    toolboxXML: makeToolboxXML(true, true, undefined, [], '', '', '', undefined, BLOCK_LEVELS.STUDIO)
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case UPDATE_TOOLBOX:
        return Object.assign({}, state, {
            toolboxXML: action.toolboxXML
        });
    default:
        return state;
    }
};

const updateToolbox = function (toolboxXML) {
    return {
        type: UPDATE_TOOLBOX,
        toolboxXML: toolboxXML
    };
};

export {
    reducer as default,
    initialState as toolboxInitialState,
    updateToolbox
};
