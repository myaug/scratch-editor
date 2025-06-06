#!/usr/bin/env node

const fs = require('fs');

function syncLocaleFiles() {
    console.log('🔄 Synchronizing locale files...');
    
    const enPath = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/build/custom-locales/en.json';
    const viPath = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/build/custom-locales/vi.json';
    
    const enMessages = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const viMessages = JSON.parse(fs.readFileSync(viPath, 'utf8'));
    
    console.log(`📊 Current status:`);
    console.log(`   EN: ${Object.keys(enMessages).length} keys`);
    console.log(`   VI: ${Object.keys(viMessages).length} keys`);
    
    // Find keys that exist in VI but not in EN
    const viOnlyKeys = Object.keys(viMessages).filter(key => !enMessages[key]);
    console.log(`🔍 Keys only in VI: ${viOnlyKeys.length}`);
    if (viOnlyKeys.length > 0) {
        console.log('   Sample VI-only keys:', viOnlyKeys.slice(0, 5));
    }
    
    // Find keys that exist in EN but not in VI  
    const enOnlyKeys = Object.keys(enMessages).filter(key => !viMessages[key]);
    console.log(`🔍 Keys only in EN: ${enOnlyKeys.length}`);
    if (enOnlyKeys.length > 0) {
        console.log('   Sample EN-only keys:', enOnlyKeys.slice(0, 5));
    }
    
    // Add missing EN keys to VI (with placeholder)
    enOnlyKeys.forEach(key => {
        viMessages[key] = enMessages[key]; // Use English as fallback
    });
    
    // Remove VI-only keys (cleanup)
    viOnlyKeys.forEach(key => {
        console.log(`⚠️  Removing VI-only key: ${key} = "${viMessages[key]}"`);
        delete viMessages[key];
    });
    
    // Get final key set
    const finalKeys = Object.keys(enMessages).sort();
    
    // Rebuild both files with same keys
    const syncedEn = {};
    const syncedVi = {};
    
    finalKeys.forEach(key => {
        syncedEn[key] = enMessages[key];
        syncedVi[key] = viMessages[key] || enMessages[key];
    });
    
    // Write synchronized files
    fs.writeFileSync(enPath, JSON.stringify(syncedEn, null, 4));
    fs.writeFileSync(viPath, JSON.stringify(syncedVi, null, 4));
    
    console.log(`✅ Synchronized locale files:`);
    console.log(`   EN: ${Object.keys(syncedEn).length} keys`);
    console.log(`   VI: ${Object.keys(syncedVi).length} keys`);
    
    return { 
        totalKeys: Object.keys(syncedEn).length,
        removedVi: viOnlyKeys.length,
        addedToVi: enOnlyKeys.length
    };
}

// Run synchronization
const result = syncLocaleFiles();
console.log(`\n🎉 Final result: ${result.totalKeys} messages in both locales`);
