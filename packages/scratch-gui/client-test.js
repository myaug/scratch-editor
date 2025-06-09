// Client-side test script to verify React warning fix and block filtering
// Paste this script into the browser console at http://localhost:8601

console.log('🧪 Starting React Warning & Block Filtering Tests...');

// Test 1: Check for React warnings in console
function checkForReactWarnings() {
    console.log('\n1. 🔍 Checking for React warnings about currentLevel prop...');
    
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;
    
    let reactWarnings = [];
    
    // Override console methods to capture warnings
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('currentLevel') && message.includes('DOM element')) {
            reactWarnings.push(message);
        }
        originalWarn.apply(console, args);
    };
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('currentLevel') && message.includes('DOM element')) {
            reactWarnings.push(message);
        }
        originalError.apply(console, args);
    };
    
    // Simulate actions that could trigger the warning
    setTimeout(() => {
        console.warn = originalWarn;
        console.error = originalError;
        
        if (reactWarnings.length === 0) {
            console.log('✅ No React warnings about currentLevel prop found!');
        } else {
            console.log('❌ Found React warnings:', reactWarnings);
        }
    }, 2000);
}

// Test 2: Test the Settings menu and level selector
function testLevelSelector() {
    console.log('\n2. 🎛️  Testing Level Selector...');
    
    // Find settings button
    const settingsButton = document.querySelector('[class*="menuBarItem"]:has(img[src*="settings"]), [class*="menu-bar-item"]:has(img[src*="settings"])') ||
                          Array.from(document.querySelectorAll('div')).find(el => 
                              el.textContent && el.textContent.includes('Settings') && 
                              el.className && el.className.includes('menuBarItem')
                          );
    
    if (settingsButton) {
        console.log('✅ Found settings button');
        
        // Click settings button
        settingsButton.click();
        
        setTimeout(() => {
            // Look for level menu
            const levelMenuText = Array.from(document.querySelectorAll('*')).find(el =>
                el.textContent && el.textContent.trim() === 'Level'
            );
            
            if (levelMenuText) {
                console.log('✅ Level menu found in settings');
                
                // Test level options
                const levelOptions = ['Explorer', 'Creator', 'Master', 'Studio'];
                const foundOptions = levelOptions.filter(level =>
                    Array.from(document.querySelectorAll('*')).some(el =>
                        el.textContent && el.textContent.includes(level)
                    )
                );
                
                console.log(`📋 Found level options: ${foundOptions.join(', ')}`);
                
                if (foundOptions.length === 4) {
                    console.log('✅ All level options present');
                } else {
                    console.log('⚠️  Missing level options:', levelOptions.filter(l => !foundOptions.includes(l)));
                }
            } else {
                console.log('❌ Level menu not found in settings');
            }
            
            // Close settings menu
            document.body.click();
        }, 500);
    } else {
        console.log('❌ Settings button not found');
    }
}

// Test 3: Test block filtering by examining toolbox
function testBlockFiltering() {
    console.log('\n3. 🧱 Testing Block Filtering...');
    
    setTimeout(() => {
        // Look for the toolbox
        const toolbox = document.querySelector('[class*="toolbox"], [class*="blocklyToolbox"]') ||
                       document.querySelector('.blocklyTreeRoot');
        
        if (toolbox) {
            console.log('✅ Found blocks toolbox');
            
            // Count visible block categories
            const categories = Array.from(toolbox.querySelectorAll('[class*="category"], .blocklyTreeRow')).filter(el => 
                el.offsetHeight > 0 && el.offsetWidth > 0
            );
            
            console.log(`📊 Found ${categories.length} visible block categories`);
            
            // List category names
            const categoryNames = categories.map(cat => {
                const label = cat.querySelector('[class*="label"], .blocklyTreeLabel');
                return label ? label.textContent.trim() : 'Unknown';
            }).filter(name => name && name !== 'Unknown');
            
            console.log(`📋 Categories: ${categoryNames.join(', ')}`);
            
            if (categoryNames.length > 0) {
                console.log('✅ Block categories are visible');
            } else {
                console.log('⚠️  No block categories detected');
            }
        } else {
            console.log('❌ Blocks toolbox not found');
        }
    }, 1000);
}

// Test 4: Test Redux state
function testReduxState() {
    console.log('\n4. 🏪 Testing Redux State...');
    
    // Try to access Redux state through various methods
    const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.getState() ||
                       window.store && window.store.getState() ||
                       null;
    
    if (reduxState) {
        console.log('✅ Redux state accessible');
        
        // Check for block level state
        if (reduxState.scratchGui && reduxState.scratchGui.blockLevel) {
            const currentLevel = reduxState.scratchGui.blockLevel.level;
            console.log(`📊 Current block level: ${currentLevel}`);
        } else {
            console.log('⚠️  Block level state not found in Redux');
        }
    } else {
        console.log('⚠️  Redux state not accessible via dev tools');
    }
}

// Run all tests
checkForReactWarnings();
testLevelSelector();
testBlockFiltering();
testReduxState();

console.log('\n🏁 Test script loaded. Results will appear above as tests complete.');
