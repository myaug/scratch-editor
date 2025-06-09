// Simple verification script to test block levels configuration
const {BLOCK_LEVELS, getBlocksForLevel, isBlockAllowedAtLevel} = require('./src/lib/block-levels.js');

console.log('Testing block levels configuration...\n');

// Test 1: Check that each level has the right number of blocks
console.log('📊 Block counts per level:');
Object.values(BLOCK_LEVELS).forEach(level => {
    const blocks = getBlocksForLevel(level);
    const totalBlocks = Object.values(blocks).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`${level}: ${totalBlocks} blocks`);
});

// Test 2: Verify progressive inclusion
console.log('\n🔄 Testing progressive inclusion:');
const testBlock = 'motion_movesteps';
Object.values(BLOCK_LEVELS).forEach(level => {
    const allowed = isBlockAllowedAtLevel(testBlock, level);
    console.log(`${testBlock} in ${level}: ${allowed ? '✅' : '❌'}`);
});

// Test 3: Check specific level configurations
console.log('\n🎯 Explorer level blocks:');
const explorerBlocks = getBlocksForLevel(BLOCK_LEVELS.EXPLORER);
console.log('Motion blocks:', explorerBlocks.motion || []);
console.log('Looks blocks:', explorerBlocks.looks || []);

console.log('\n🎨 Creator level adds:');
const creatorBlocks = getBlocksForLevel(BLOCK_LEVELS.CREATOR);
console.log('Control blocks:', creatorBlocks.control || []);

console.log('\n✅ Configuration test completed!');
