/**
 * Block-level categorization system for progressive Scratch learning
 * Based on analysis of tutorial content and learning progression
 * 
 * LEVELS:
 * - Explorer (Level 1): Basic movement, appearance, and simple interactions
 * - Creator (Level 2): Events, basic control structures, and user input
 * - Master (Level 3): Advanced logic, variables, sensing, and complex interactions
 * - Studio (Level 4): All blocks including extensions and advanced features
 */

export const BLOCK_LEVELS = {
    EXPLORER: 'explorer',
    CREATOR: 'creator', 
    MASTER: 'master',
    STUDIO: 'studio'
};

/**
 * Block categorization by level based on tutorial analysis
 * Each block is assigned to the earliest appropriate level
 */
export const BLOCK_LEVEL_CONFIG = {
    
    // EXPLORER LEVEL - Basic Movement and Appearance
    [BLOCK_LEVELS.EXPLORER]: {
        motion: [
            'motion_movesteps',
            'motion_turnright',
            'motion_turnleft'
        ],
        looks: [
            'looks_say',
            'looks_sayforsecs',
            'looks_show',
            'looks_hide',
            'looks_switchcostumeto',
            'looks_nextcostume',
            'looks_changecoloreffectby',
            'looks_setcoloreffectto',
            'looks_cleargraphiceffects'
        ],
        sound: [
            'sound_play',
            'sound_playuntildone'
        ],
        events: [
            'event_whenflagclicked',
            'event_whenkeypressed',
            'event_whenstageclicked',
            'event_whenthisspriteclicked'
        ],
        control: [
            'control_wait',
            'control_repeat',
            'control_forever'
        ],
        sensing: [
            'sensing_keypressed',
            'sensing_mousedown',
            'sensing_mousex',
            'sensing_mousey'
        ],
        operators: [
            'operator_add',
            'operator_subtract',
            'operator_equals'
        ]
    },

    // CREATOR LEVEL - Events, Basic Control, and Interaction  
    [BLOCK_LEVELS.CREATOR]: {
        motion: [
            'motion_goto',
            'motion_gotoxy',
            'motion_glideto',
            'motion_glidesecstoxy',
            'motion_pointindirection',
            'motion_changexby',
            'motion_changeyby',
            'motion_setx',
            'motion_sety'
        ],
        looks: [
            'looks_think',
            'looks_thinkforsecs',
            'looks_switchbackdropto',
            'looks_switchbackdroptoandwait',
            'looks_nextbackdrop',
            'looks_changesizeby',
            'looks_setsizeto',
            'looks_changeeffectby',
            'looks_seteffectto',
            'looks_gotofrontback',
            'looks_goforwardbackwardlayers'
        ],
        sound: [
            'sound_playuntildone',
            'sound_stopallsounds',
            'sound_setvolumeto',
            'sound_changevolumeby',
            'sound_seteffectto',
            'sound_changeeffectby',
            'sound_cleareffects'
        ],
        events: [
            'event_whenkeypressed',
            'event_whenbackdropswitchesto',
            'event_whengreaterthan'
        ],
        control: [
            'control_wait',
            'control_repeat',
            'control_forever',
            'control_if',
            'control_if_else'
        ],
        sensing: [
            'sensing_keypressed',
            'sensing_mousedown',
            'sensing_mousex',
            'sensing_mousey'
        ]
    },

    // MASTER LEVEL - Advanced Logic, Variables, and Complex Interactions
    [BLOCK_LEVELS.MASTER]: {
        motion: [
            'motion_pointtowards',
            'motion_ifonedgebounce',
            'motion_setrotationstyle',
            'motion_xposition',
            'motion_yposition',
            'motion_direction'
        ],
        looks: [
            'looks_costumenumbername',
            'looks_backdropnumbername',
            'looks_size'
        ],
        sound: [
            'sound_volume',
            'sound_settempoto',
            'sound_changetempeby'
        ],
        events: [
            'event_whenbroadcastreceived',
            'event_broadcast',
            'event_broadcastandwait'
        ],
        control: [
            'control_wait_until',
            'control_repeat_until',
            'control_stop',
            'control_start_as_clone',
            'control_create_clone_of',
            'control_delete_this_clone'
        ],
        sensing: [
            'sensing_touchingobject',
            'sensing_touchingcolor',
            'sensing_coloristouchingcolor',
            'sensing_distanceto',
            'sensing_askandwait',
            'sensing_answer',
            'sensing_setdragmode',
            'sensing_loudness',
            'sensing_timer',
            'sensing_resettimer',
            'sensing_of',
            'sensing_current',
            'sensing_dayssince2000',
            'sensing_username'
        ],
        operators: [
            'operator_add',
            'operator_subtract', 
            'operator_multiply',
            'operator_divide',
            'operator_random',
            'operator_gt',
            'operator_lt',
            'operator_equals',
            'operator_and',
            'operator_or',
            'operator_not',
            'operator_join',
            'operator_letter_of',
            'operator_length',
            'operator_contains',
            'operator_mod',
            'operator_round',
            'operator_mathop'
        ],
        data: [
            'data_variable',
            'data_setvariableto',
            'data_changevariableby',
            'data_showvariable',
            'data_hidevariable',
            'data_listcontents',
            'data_addtolist',
            'data_deleteoflist',
            'data_deletealloflist',
            'data_insertatlist',
            'data_replaceitemoflist',
            'data_itemoflist',
            'data_itemnumoflist',
            'data_lengthoflist',
            'data_listcontainsitem',
            'data_showlist',
            'data_hidelist'
        ]
    },

    // STUDIO LEVEL - All Blocks Including Extensions
    [BLOCK_LEVELS.STUDIO]: {
        // All remaining blocks including extensions
        procedures: [
            'procedures_definition',
            'procedures_call',
            'procedures_prototype',
            'argument_reporter_string_number',
            'argument_reporter_boolean'
        ],
        // Extension blocks would be added here
        // pen, music, video sensing, text2speech, etc.
    }
};

/**
 * Get all blocks available at a specific level and below
 * @param {string} level - The target level
 * @returns {Object} Object with categories and their allowed blocks
 */
export function getBlocksForLevel(level) {
    const levels = [BLOCK_LEVELS.EXPLORER, BLOCK_LEVELS.CREATOR, BLOCK_LEVELS.MASTER, BLOCK_LEVELS.STUDIO];
    const levelIndex = levels.indexOf(level);
    
    if (levelIndex === -1) {
        return {};
    }
    
    const allowedBlocks = {};
    
    // Include blocks from current level and all previous levels
    for (let i = 0; i <= levelIndex; i++) {
        const currentLevel = levels[i];
        const levelConfig = BLOCK_LEVEL_CONFIG[currentLevel];
        
        Object.keys(levelConfig).forEach(category => {
            if (!allowedBlocks[category]) {
                allowedBlocks[category] = [];
            }
            allowedBlocks[category] = [...allowedBlocks[category], ...levelConfig[category]];
        });
    }
    
    return allowedBlocks;
}

/**
 * Check if a block is allowed at a specific level
 * @param {string} blockType - The block type to check
 * @param {string} level - The level to check against
 * @returns {boolean} True if block is allowed at this level
 */
export function isBlockAllowedAtLevel(blockType, level) {
    const allowedBlocks = getBlocksForLevel(level);
    
    for (const category of Object.keys(allowedBlocks)) {
        if (allowedBlocks[category].includes(blockType)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Tutorial to level mapping based on content analysis
 */
export const TUTORIAL_LEVEL_MAPPING = {
    // Getting Started Category -> Explorer Level
    'intro-move-sayhello': BLOCK_LEVELS.EXPLORER,
    'intro-getting-started-ASL': BLOCK_LEVELS.EXPLORER,
    'add-sprite': BLOCK_LEVELS.EXPLORER,
    'add-a-backdrop': BLOCK_LEVELS.EXPLORER,
    'switch-costume': BLOCK_LEVELS.EXPLORER,

    // Basics Category -> Creator Level  
    'move-around-with-arrow-keys': BLOCK_LEVELS.CREATOR,
    'change-size': BLOCK_LEVELS.CREATOR,
    'glide-around': BLOCK_LEVELS.CREATOR,
    'spin-video': BLOCK_LEVELS.CREATOR,
    'record-a-sound': BLOCK_LEVELS.CREATOR,
    'hide-and-show': BLOCK_LEVELS.CREATOR,

    // Intermediate Category -> Master Level
    'add-effects': BLOCK_LEVELS.MASTER,
    'make-it-fly': BLOCK_LEVELS.MASTER,
    'Make-Music': BLOCK_LEVELS.MASTER,
    'pong': BLOCK_LEVELS.MASTER,
    'video-sensing': BLOCK_LEVELS.MASTER,

    // Prompts Category -> Mixed levels based on complexity
    'animate-a-name': BLOCK_LEVELS.CREATOR,
    'Animate-A-Character': BLOCK_LEVELS.CREATOR,
    'Tell-A-Story': BLOCK_LEVELS.CREATOR,
    'Chase-Game': BLOCK_LEVELS.MASTER, // Uses variables and scoring
    'say-it-out-loud': BLOCK_LEVELS.MASTER, // Uses extensions
    'imagine': BLOCK_LEVELS.CREATOR,
    'code-cartoon': BLOCK_LEVELS.CREATOR,
    'talking': BLOCK_LEVELS.MASTER // Advanced text-to-speech features
};

/**
 * Get recommended level for a tutorial
 * @param {string} tutorialId - The tutorial identifier
 * @returns {string} The recommended block level
 */
export function getTutorialLevel(tutorialId) {
    return TUTORIAL_LEVEL_MAPPING[tutorialId] || BLOCK_LEVELS.STUDIO;
}
