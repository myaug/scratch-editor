import ScratchBlocks from 'scratch-blocks';
import {defaultColors} from './themes';
import {getBlocksForLevel, BLOCK_LEVELS} from './block-levels';

const categorySeparator = '<sep gap="36"/>';

const blockSeparator = '<sep gap="36"/>'; // At default scale, about 28px

/**
 * Filter block XML content based on the current level
 * @param {string} blockXML - The XML content containing blocks
 * @param {string} categoryName - The category name (motion, looks, etc.)
 * @param {string} currentLevel - The current block level
 * @returns {string} - Filtered XML content
 */
const filterBlocksForLevel = function (blockXML, categoryName, currentLevel) {
    if (!currentLevel || currentLevel === BLOCK_LEVELS.STUDIO) {
        return blockXML; // Show all blocks for Studio level or if no level specified
    }
    
    const allowedBlocks = getBlocksForLevel(currentLevel);
    const categoryBlocks = allowedBlocks[categoryName] || [];
    
    if (categoryBlocks.length === 0) {
        return 'undefined';
    }
    
    // Extract category opening and closing tags
    const categoryOpenMatch = blockXML.match(/^(.*?<category[^>]*>)/s);
    const categoryCloseMatch = blockXML.match(/(<\/category>.*)$/s);
    if (!categoryOpenMatch || !categoryCloseMatch) return blockXML;
    
    const categoryOpen = categoryOpenMatch[1];
    const categoryClose = categoryCloseMatch[1];
    const categoryContent = blockXML.slice(categoryOpen.length, blockXML.length - categoryClose.length);

    // Parse the content sequentially, preserving order and existing separators
    const parseContent = (content) => {
        const elements = [];
        let position = 0;
        
        while (position < content.length) {
            // Skip empty spaces/newlines
            const nextElementStart = content.slice(position).search(/<(?:block|sep|label|comment)/);
            if (nextElementStart === -1) break;
            
            position += nextElementStart;
            
            // Check what type of element we found
            if (content.slice(position).startsWith('<block')) {
                // Extract block
                const typeMatch = content.slice(position).match(/^<block[^>]*type\s*=\s*["']([^"']+)["']/);
                if (!typeMatch) {
                    position++;
                    continue;
                }
                
                const blockType = typeMatch[1];
                
                // Find the end of this block (handling nested blocks)
                let depth = 0;
                let currentPos = position;
                let blockEnd = -1;
                
                while (currentPos < content.length) {
                    const nextBlockStart = content.indexOf('<block', currentPos === position ? currentPos + 6 : currentPos);
                    const nextBlockEnd = content.indexOf('</block>', currentPos);
                    const selfClosing = content.slice(currentPos, currentPos + 200).match(/^<block[^>]*\/>/);
                    
                    if (selfClosing && currentPos === position) {
                        // Self-closing block
                        blockEnd = position + selfClosing[0].length;
                        break;
                    }
                    
                    if (nextBlockEnd === -1) break;
                    
                    if (nextBlockStart !== -1 && nextBlockStart < nextBlockEnd) {
                        depth++;
                        currentPos = nextBlockStart + 6;
                    } else {
                        if (depth === 0) {
                            blockEnd = nextBlockEnd + 8; // '</block>'.length
                            break;
                        }
                        depth--;
                        currentPos = nextBlockEnd + 8;
                    }
                }
                
                if (blockEnd !== -1) {
                    const blockContent = content.slice(position, blockEnd);
                    elements.push({
                        type: 'block',
                        blockType: blockType,
                        content: blockContent,
                        allowed: categoryBlocks.includes(blockType)
                    });
                    position = blockEnd;
                } else {
                    position++;
                }
            } else if (content.slice(position).startsWith('<sep')) {
                // Extract separator
                const sepMatch = content.slice(position).match(/^<sep[^>]*(?:\/>|>[^<]*<\/sep>)/);
                if (sepMatch) {
                    elements.push({
                        type: 'separator',
                        content: sepMatch[0]
                    });
                    position += sepMatch[0].length;
                } else {
                    position++;
                }
            } else if (content.slice(position).match(/^<(?:label|comment)/)) {
                // Extract other elements (labels, comments)
                const otherMatch = content.slice(position).match(/^<(?:label|comment)[^>]*(?:\/>|>.*?<\/(?:label|comment)>)/s);
                if (otherMatch) {
                    elements.push({
                        type: 'other',
                        content: otherMatch[0]
                    });
                    position += otherMatch[0].length;
                } else {
                    position++;
                }
            } else {
                position++;
            }
        }
        
        return elements;
    };
    
    const elements = parseContent(categoryContent);
    
    // Filter elements: keep allowed blocks, preserve other elements and separators
    const filteredElements = elements.filter(element => {
        if (element.type === 'block') {
            return element.allowed;
        }
        return true; // Keep separators and other elements
    });
    
    if (filteredElements.filter(el => el.type === 'block').length === 0) {
        // Return empty category if no blocks remain
        return categoryOpen + '\n' + categoryClose;
    }
    
    // Build the filtered content
    let filteredContent = filteredElements.map(el => el.content).join('\n');
    
    // Clean up consecutive separators and separators at beginning/end
    filteredContent = filteredContent
        // Remove multiple consecutive separators (with possible whitespace between)
        .replace(/(<sep[^>]*(?:\/>|>[^<]*<\/sep>))\s*\n\s*(<sep[^>]*(?:\/>|>[^<]*<\/sep>))/g, '$1')
        // Remove separators at the very beginning (right after category opening)
        .replace(/^\s*<sep[^>]*(?:\/>|>[^<]*<\/sep>)\s*\n?/, '');
    
    // Ensure there's always a separator before the closing category tag
    if (filteredContent && !filteredContent.trim().endsWith('/>') && !filteredContent.includes(categorySeparator)) {
        filteredContent += '\n' + categorySeparator;
    } else if (filteredContent && !filteredContent.trim().endsWith('/>')) {
        // If content doesn't end with a separator, add one
        if (!/<sep[^>]*(?:\/>|>[^<]*<\/sep>)\s*$/.test(filteredContent)) {
            filteredContent += '\n' + categorySeparator;
        }
    }
    
    return categoryOpen + '\n' + filteredContent + '\n' + categoryClose;
};

/* eslint-disable no-unused-vars */
const motion = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    const stageSelected = ScratchBlocks.ScratchMsgs.translate(
        'MOTION_STAGE_SELECTED',
        'Stage selected: no motion blocks'
    );
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const motionXML = `
    <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${isStage ? `
        <label text="${stageSelected}"></label>
        ` : `
        <block type="motion_movesteps">
            <value name="STEPS">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnright">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        <block type="motion_turnleft">
            <value name="DEGREES">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_goto">
            <value name="TO">
                <shadow type="motion_goto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_gotoxy">
            <value name="X">
                <shadow id="movex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="movey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_glideto" id="motion_glideto">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="motion_glideto_menu">
                </shadow>
            </value>
        </block>
        <block type="motion_glidesecstoxy">
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="X">
                <shadow id="glidex" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="Y">
                <shadow id="glidey" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_pointindirection">
            <value name="DIRECTION">
                <shadow type="math_angle">
                    <field name="NUM">90</field>
                </shadow>
            </value>
        </block>
        <block type="motion_pointtowards">
            <value name="TOWARDS">
                <shadow type="motion_pointtowards_menu">
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_changexby">
            <value name="DX">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_setx">
            <value name="X">
                <shadow id="setx" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="motion_changeyby">
            <value name="DY">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="motion_sety">
            <value name="Y">
                <shadow id="sety" type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="motion_ifonedgebounce"/>
        ${blockSeparator}
        <block type="motion_setrotationstyle"/>
        ${blockSeparator}
        <block id="${targetId}_xposition" type="motion_xposition"/>
        <block id="${targetId}_yposition" type="motion_yposition"/>
        <block id="${targetId}_direction" type="motion_direction"/>`}
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(motionXML, 'motion', currentLevel);
};

const xmlEscape = function (unsafe) {
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        }
    });
};

const looks = function (isInitialSetup, isStage, targetId, costumeName, backdropName, colors, currentLevel) {
    const hello = ScratchBlocks.ScratchMsgs.translate('LOOKS_HELLO', 'Hello!');
    const hmm = ScratchBlocks.ScratchMsgs.translate('LOOKS_HMM', 'Hmm...');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const looksXML = `
    <category name="%{BKY_CATEGORY_LOOKS}" id="looks" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${isStage ? '' : `
        <block type="looks_sayforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="looks_say">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hello}</field>
                </shadow>
            </value>
        </block>
        <block type="looks_thinkforsecs">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
            <value name="SECS">
                <shadow type="math_number">
                    <field name="NUM">2</field>
                </shadow>
            </value>
        </block>
        <block type="looks_think">
            <value name="MESSAGE">
                <shadow type="text">
                    <field name="TEXT">${hmm}</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        `}
        ${isStage ? `
            <block type="looks_switchbackdropto">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_switchbackdroptoandwait">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextbackdrop"/>
        ` : `
            <block id="${targetId}_switchcostumeto" type="looks_switchcostumeto">
                <value name="COSTUME">
                    <shadow type="looks_costume">
                        <field name="COSTUME">${costumeName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextcostume"/>
            <block type="looks_switchbackdropto">
                <value name="BACKDROP">
                    <shadow type="looks_backdrops">
                        <field name="BACKDROP">${backdropName}</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_nextbackdrop"/>
            ${blockSeparator}
            <block type="looks_changesizeby">
                <value name="CHANGE">
                    <shadow type="math_number">
                        <field name="NUM">10</field>
                    </shadow>
                </value>
            </block>
            <block type="looks_setsizeto">
                <value name="SIZE">
                    <shadow type="math_number">
                        <field name="NUM">100</field>
                    </shadow>
                </value>
            </block>
        `}
        ${blockSeparator}
        <block type="looks_changeeffectby">
            <value name="CHANGE">
                <shadow type="math_number">
                    <field name="NUM">25</field>
                </shadow>
            </value>
        </block>
        <block type="looks_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
        </block>
        <block type="looks_cleargraphiceffects"/>
        ${blockSeparator}
        ${isStage ? '' : `
            <block type="looks_show"/>
            <block type="looks_hide"/>
        ${blockSeparator}
            <block type="looks_gotofrontback"/>
            <block type="looks_goforwardbackwardlayers">
                <value name="NUM">
                    <shadow type="math_integer">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
            </block>
        `}
        ${isStage ? `
            <block id="backdropnumbername" type="looks_backdropnumbername"/>
        ` : `
            <block id="${targetId}_costumenumbername" type="looks_costumenumbername"/>
            <block id="backdropnumbername" type="looks_backdropnumbername"/>
            <block id="${targetId}_size" type="looks_size"/>
        `}
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(looksXML, 'looks', currentLevel);
};

const sound = function (isInitialSetup, isStage, targetId, soundName, colors, currentLevel) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const soundXML = `
    <category name="%{BKY_CATEGORY_SOUND}" id="sound" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        <block id="${targetId}_sound_playuntildone" type="sound_playuntildone">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_sound_play" type="sound_play">
            <value name="SOUND_MENU">
                <shadow type="sound_sounds_menu">
                    <field name="SOUND_MENU">${soundName}</field>
                </shadow>
            </value>
        </block>
        <block type="sound_stopallsounds"/>
        ${blockSeparator}
        <block type="sound_changeeffectby">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_seteffectto">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block type="sound_cleareffects"/>
        ${blockSeparator}
        <block type="sound_changevolumeby">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">-10</field>
                </shadow>
            </value>
        </block>
        <block type="sound_setvolumeto">
            <value name="VOLUME">
                <shadow type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
        </block>
        <block id="${targetId}_volume" type="sound_volume"/>
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(soundXML, 'sound', currentLevel);
};

const events = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const eventsXML = `
    <category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        <block type="event_whenflagclicked"/>
        <block type="event_whenkeypressed">
        </block>
        ${isStage ? `
            <block type="event_whenstageclicked"/>
        ` : `
            <block type="event_whenthisspriteclicked"/>
        `}
        <block type="event_whenbackdropswitchesto">
        </block>
        ${blockSeparator}
        <block type="event_whengreaterthan">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="event_whenbroadcastreceived">
        </block>
        <block type="event_broadcast">
            <value name="BROADCAST_INPUT">
                <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        <block type="event_broadcastandwait">
            <value name="BROADCAST_INPUT">
              <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(eventsXML, 'events', currentLevel);
};

const control = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const controlXML = `
    <category
        name="%{BKY_CATEGORY_CONTROL}"
        id="control"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block id="forever" type="control_forever"/>
        ${blockSeparator}
        <block type="control_if"/>
        <block type="control_if_else"/>
        <block id="wait_until" type="control_wait_until"/>
        <block id="repeat_until" type="control_repeat_until"/>
        ${blockSeparator}
        <block type="control_stop"/>
        ${blockSeparator}
        ${isStage ? `
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
        ` : `
            <block type="control_start_as_clone"/>
            <block type="control_create_clone_of">
                <value name="CLONE_OPTION">
                    <shadow type="control_create_clone_of_menu"/>
                </value>
            </block>
            <block type="control_delete_this_clone"/>
        `}
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(controlXML, 'control', currentLevel);
};

const sensing = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    const name = ScratchBlocks.ScratchMsgs.translate('SENSING_ASK_TEXT', 'What\'s your name?');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const sensingXML = `
    <category
        name="%{BKY_CATEGORY_SENSING}"
        id="sensing"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        ${isStage ? '' : `
            <block type="sensing_touchingobject">
                <value name="TOUCHINGOBJECTMENU">
                    <shadow type="sensing_touchingobjectmenu"/>
                </value>
            </block>
            <block type="sensing_touchingcolor">
                <value name="COLOR">
                    <shadow type="colour_picker"/>
                </value>
            </block>
            <block type="sensing_coloristouchingcolor">
                <value name="COLOR">
                    <shadow type="colour_picker"/>
                </value>
                <value name="COLOR2">
                    <shadow type="colour_picker"/>
                </value>
            </block>
            <block type="sensing_distanceto">
                <value name="DISTANCETOMENU">
                    <shadow type="sensing_distancetomenu"/>
                </value>
            </block>
            ${blockSeparator}
        `}
        ${isInitialSetup ? '' : `
            <block id="askandwait" type="sensing_askandwait">
                <value name="QUESTION">
                    <shadow type="text">
                        <field name="TEXT">${name}</field>
                    </shadow>
                </value>
            </block>
        `}
        <block id="answer" type="sensing_answer"/>
        ${blockSeparator}
        <block type="sensing_keypressed">
            <value name="KEY_OPTION">
                <shadow type="sensing_keyoptions"/>
            </value>
        </block>
        <block type="sensing_mousedown"/>
        <block type="sensing_mousex"/>
        <block type="sensing_mousey"/>
        ${isStage ? '' : `
            ${blockSeparator}
            '<block type="sensing_setdragmode" id="sensing_setdragmode"></block>'+
            ${blockSeparator}
        `}
        ${blockSeparator}
        <block id="loudness" type="sensing_loudness"/>
        ${blockSeparator}
        <block id="timer" type="sensing_timer"/>
        <block type="sensing_resettimer"/>
        ${blockSeparator}
        <block id="of" type="sensing_of">
            <value name="OBJECT">
                <shadow id="sensing_of_object_menu" type="sensing_of_object_menu"/>
            </value>
        </block>
        ${blockSeparator}
        <block id="current" type="sensing_current"/>
        <block type="sensing_dayssince2000"/>
        ${blockSeparator}
        <block type="sensing_username"/>
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(sensingXML, 'sensing', currentLevel);
};

const operators = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    const apple = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_APPLE', 'apple');
    const banana = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_BANANA', 'banana');
    const letter = ScratchBlocks.ScratchMsgs.translate('OPERATORS_LETTEROF_APPLE', 'a');
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const operatorsXML = `
    <category
        name="%{BKY_CATEGORY_OPERATORS}"
        id="operators"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}">
        <block type="operator_add">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_subtract">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_multiply">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_divide">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_random">
            <value name="FROM">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_gt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_lt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_equals">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_and"/>
        <block type="operator_or"/>
        <block type="operator_not"/>
        ${blockSeparator}
        ${isInitialSetup ? '' : `
            <block type="operator_join">
                <value name="STRING1">
                    <shadow type="text">
                        <field name="TEXT">${apple} </field>
                    </shadow>
                </value>
                <value name="STRING2">
                    <shadow type="text">
                        <field name="TEXT">${banana}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_letter_of">
                <value name="LETTER">
                    <shadow type="math_whole_number">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_length">
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_contains" id="operator_contains">
              <value name="STRING1">
                <shadow type="text">
                  <field name="TEXT">${apple}</field>
                </shadow>
              </value>
              <value name="STRING2">
                <shadow type="text">
                  <field name="TEXT">${letter}</field>
                </shadow>
              </value>
            </block>
        `}
        ${blockSeparator}
        <block type="operator_mod">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_round">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="operator_mathop">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(operatorsXML, 'operators', currentLevel);
};

const variables = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const variablesXML = `
    <category
        name="%{BKY_CATEGORY_VARIABLES}"
        id="variables"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="VARIABLE">
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(variablesXML, 'variables', currentLevel);
};

const myBlocks = function (isInitialSetup, isStage, targetId, colors, currentLevel) {
    // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
    const myBlocksXML = `
    <category
        name="%{BKY_CATEGORY_MYBLOCKS}"
        id="myBlocks"
        colour="${colors.primary}"
        secondaryColour="${colors.tertiary}"
        custom="PROCEDURE">
    </category>
    `;
    
    // Apply block filtering based on current level
    return filterBlocksForLevel(myBlocksXML, 'myBlocks', currentLevel);
};
/* eslint-enable no-unused-vars */

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

/**
 * @param {!boolean} isInitialSetup - Whether the toolbox is for initial setup. If the mode is "initial setup",
 * blocks with localized default parameters (e.g. ask and wait) should not be loaded. (LLK/scratch-gui#5445)
 * @param {?boolean} isStage - Whether the toolbox is for a stage-type target. This is always set to true
 * when isInitialSetup is true.
 * @param {?string} targetId - The current editing target
 * @param {?Array.<object>} categoriesXML - optional array of `{id,xml}` for categories. This can include both core
 * and other extensions: core extensions will be placed in the normal Scratch order; others will go at the bottom.
 * @property {string} id - the extension / category ID.
 * @property {string} xml - the `<category>...</category>` XML for this extension / category.
 * @param {?string} costumeName - The name of the default selected costume dropdown.
 * @param {?string} backdropName - The name of the default selected backdrop dropdown.
 * @param {?string} soundName -  The name of the default selected sound dropdown.
 * @param {?object} colors - The colors for the theme.
 * @returns {string} - a ScratchBlocks-style XML document for the contents of the toolbox.
 */
const makeToolboxXML = function (isInitialSetup, isStage = true, targetId, categoriesXML = [],
    costumeName = '', backdropName = '', soundName = '', colors = defaultColors, currentLevel = null) {
    isStage = isInitialSetup || isStage;
    const gap = [categorySeparator];

    costumeName = xmlEscape(costumeName);
    backdropName = xmlEscape(backdropName);
    soundName = xmlEscape(soundName);

    categoriesXML = categoriesXML.slice();
    const moveCategory = categoryId => {
        const index = categoriesXML.findIndex(categoryInfo => categoryInfo.id === categoryId);
        if (index >= 0) {
            // remove the category from categoriesXML and return its XML
            const [categoryInfo] = categoriesXML.splice(index, 1);
            return categoryInfo.xml;
        }
        // return `undefined`
    };
    const motionXML = moveCategory('motion') || motion(isInitialSetup, isStage, targetId, colors.motion, currentLevel);
    const looksXML = moveCategory('looks') ||
        looks(isInitialSetup, isStage, targetId, costumeName, backdropName, colors.looks, currentLevel);
    const soundXML = moveCategory('sound') || sound(isInitialSetup, isStage, targetId, soundName, colors.sounds, currentLevel);
    const eventsXML = moveCategory('event') || events(isInitialSetup, isStage, targetId, colors.event, currentLevel);
    const controlXML = moveCategory('control') || control(isInitialSetup, isStage, targetId, colors.control, currentLevel);
    const sensingXML = moveCategory('sensing') || sensing(isInitialSetup, isStage, targetId, colors.sensing, currentLevel);
    const operatorsXML = moveCategory('operators') || operators(isInitialSetup, isStage, targetId, colors.operators, currentLevel);
    const variablesXML = moveCategory('data') || variables(isInitialSetup, isStage, targetId, colors.data, currentLevel);
    const myBlocksXML = moveCategory('procedures') || myBlocks(isInitialSetup, isStage, targetId, colors.more, currentLevel);

    const everything = [
        xmlOpen,
        motionXML, gap,
        looksXML, gap,
        soundXML, gap,
        eventsXML, gap,
        controlXML, gap,
        sensingXML, gap,
        operatorsXML, gap,
        variablesXML, gap,
        myBlocksXML
    ];

    for (const extensionCategory of categoriesXML) {
        everything.push(gap, extensionCategory.xml);
    }

    everything.push(xmlClose);
    return everything.join('\n');
};

export default makeToolboxXML;
