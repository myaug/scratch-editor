// Test script for block level functionality
import { BLOCK_LEVELS, getBlocksForLevel, LEVEL_DESCRIPTIONS, isBlockAllowedAtLevel } from './src/lib/block-levels.js';
import { getStoredLevel, setStoredLevel } from './src/lib/detect-level.js';

console.log('🧪 Testing Block Level Configuration\n');
console.log('═'.repeat(50));

// Test 1: Block configuration for each level
console.log('\n📊 BLOCK COUNTS PER LEVEL:');
Object.values(BLOCK_LEVELS).forEach(level => {
    const allowedBlocks = getBlocksForLevel(level);
    const totalBlocks = Object.values(allowedBlocks).reduce((sum, blocks) => sum + blocks.length, 0);
    const categories = Object.keys(allowedBlocks).length;
    
    console.log(`${LEVEL_DESCRIPTIONS[level].icon} ${LEVEL_DESCRIPTIONS[level].name.padEnd(8)}: ${totalBlocks.toString().padStart(3)} blocks across ${categories} categories`);
});

// Test 2: Specific block availability
console.log('\n🔍 BLOCK AVAILABILITY TEST:');
const testBlocks = [
    'motion_movesteps',      // Should be available from Explorer
    'control_repeat',        // Should be available from Creator  
    'operator_add',          // Should be available from Master
    'procedures_definition'  // Should be available from Studio
];

testBlocks.forEach(blockType => {
    console.log(`\n  Block: ${blockType}`);
    Object.values(BLOCK_LEVELS).forEach(level => {
        const allowed = isBlockAllowedAtLevel(blockType, level);
        const status = allowed ? '✅' : '❌';
        console.log(`    ${status} ${level}`);
    });
});

// Test 3: Progressive availability (blocks should be available in higher levels)
console.log('\n📈 PROGRESSIVE AVAILABILITY TEST:');
const levels = Object.values(BLOCK_LEVELS);
let allTestsPassed = true;

for (let i = 0; i < levels.length - 1; i++) {
    const currentLevel = levels[i];
    const nextLevel = levels[i + 1];
    
    const currentBlocks = getBlocksForLevel(currentLevel);
    const nextBlocks = getBlocksForLevel(nextLevel);
    
    // Check if all blocks from current level are available in next level
    let levelTestPassed = true;
    
    Object.keys(currentBlocks).forEach(category => {
        if (!nextBlocks[category]) {
            console.log(`❌ Category ${category} missing in ${nextLevel}`);
            levelTestPassed = false;
            allTestsPassed = false;
            return;
        }
        
        currentBlocks[category].forEach(block => {
            if (!nextBlocks[category].includes(block)) {
                console.log(`❌ Block ${block} from ${currentLevel} missing in ${nextLevel}`);
                levelTestPassed = false;
                allTestsPassed = false;
            }
        });
    });
    
    if (levelTestPassed) {
        console.log(`✅ ${currentLevel} → ${nextLevel}: All blocks preserved`);
    }
}

if (allTestsPassed) {
    console.log('\n🎉 Progressive availability test PASSED!');
} else {
    console.log('\n⚠️  Progressive availability test FAILED!');
}

// Test 4: LocalStorage functionality
console.log('\n💾 LOCALSTORAGE TEST:');
const originalLevel = getStoredLevel();
console.log(`Original stored level: ${originalLevel}`);

// Test setting and getting each level
Object.values(BLOCK_LEVELS).forEach(level => {
    setStoredLevel(level);
    const retrieved = getStoredLevel();
    const match = level === retrieved;
    console.log(`Set: ${level}, Got: ${retrieved} ${match ? '✅' : '❌'}`);
});

// Restore original level
setStoredLevel(originalLevel);
console.log(`Restored to: ${getStoredLevel()}`);

console.log('\n🏁 Test completed!');
