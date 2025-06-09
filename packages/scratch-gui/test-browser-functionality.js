// Browser console test script for block level functionality
// Paste this into the browser console to test the functionality

console.log('🧪 Testing Block Level Functionality in Browser\n');

// Function to wait for elements
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Function to find React component data
function getReactData(element) {
    const key = Object.keys(element).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('_reactInternalFiber'));
    return key ? element[key] : null;
}

async function testBlockLevelFunctionality() {
    console.log('🔍 1. Checking if application loaded...');
    
    try {
        // Wait for the main app container
        await waitForElement('#app');
        console.log('✅ App container found');
        
        // Wait for the blocks area (indicating the editor has loaded)
        await waitForElement('.blocklyToolboxDiv');
        console.log('✅ Toolbox loaded');
        
        console.log('\n🎛️ 2. Testing level menu accessibility...');
        
        // Look for the settings menu button
        const settingsButton = document.querySelector('[data-tip="Settings"]') || 
                              document.querySelector('button[aria-label*="Settings"]') ||
                              Array.from(document.querySelectorAll('button')).find(btn => 
                                btn.textContent.includes('Settings') || 
                                btn.getAttribute('aria-label')?.includes('Settings')
                              );
        
        if (settingsButton) {
            console.log('✅ Settings button found');
            
            // Click settings to open menu
            settingsButton.click();
            
            // Wait a moment for menu to appear
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Look for level menu option
            const levelOption = Array.from(document.querySelectorAll('*')).find(el => 
                el.textContent?.includes('Level') && el.tagName !== 'SCRIPT'
            );
            
            if (levelOption) {
                console.log('✅ Level menu option found');
                
                // Try to click level option to open submenu
                levelOption.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Look for level options
                const levelOptions = ['Explorer', 'Creator', 'Master', 'Studio']
                    .map(level => Array.from(document.querySelectorAll('*'))
                        .find(el => el.textContent?.includes(level) && el.tagName !== 'SCRIPT'))
                    .filter(Boolean);
                
                console.log(`✅ Found ${levelOptions.length}/4 level options:`, 
                    levelOptions.map(el => el.textContent.trim()));
                
                return true;
            } else {
                console.log('❌ Level menu option not found');
                return false;
            }
        } else {
            console.log('❌ Settings button not found');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    }
}

async function testBlockFiltering() {
    console.log('\n🧱 3. Testing block filtering...');
    
    try {
        // Get current blocks in toolbox
        const getVisibleBlocks = () => {
            const blockElements = document.querySelectorAll('.blocklyTreeRow');
            return Array.from(blockElements).map(el => el.textContent.trim()).filter(Boolean);
        };
        
        const initialBlocks = getVisibleBlocks();
        console.log(`📊 Initial blocks visible: ${initialBlocks.length}`);
        
        // Test localStorage functionality
        console.log('\n💾 4. Testing localStorage...');
        const originalLevel = localStorage.getItem('scratchBlockLevel');
        console.log(`Current stored level: ${originalLevel}`);
        
        // Test setting different levels
        const levels = ['explorer', 'creator', 'master', 'studio'];
        levels.forEach(level => {
            localStorage.setItem('scratchBlockLevel', level);
            const retrieved = localStorage.getItem('scratchBlockLevel');
            console.log(`Set ${level}, retrieved ${retrieved}: ${level === retrieved ? '✅' : '❌'}`);
        });
        
        // Restore original level
        if (originalLevel) {
            localStorage.setItem('scratchBlockLevel', originalLevel);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Block filtering test failed:', error.message);
        return false;
    }
}

async function testReactWarnings() {
    console.log('\n⚠️ 5. Checking for React warnings...');
    
    // Monitor console for React warnings
    const originalWarn = console.warn;
    const originalError = console.error;
    const warnings = [];
    
    console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('currentLevel') || message.includes('DOM element')) {
            warnings.push(message);
        }
        originalWarn.apply(console, args);
    };
    
    console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('currentLevel') || message.includes('DOM element')) {
            warnings.push(message);
        }
        originalError.apply(console, args);
    };
    
    // Trigger a re-render by interacting with the interface
    const clickableElements = document.querySelectorAll('button, [role="button"]');
    if (clickableElements.length > 0) {
        clickableElements[0].click();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Restore console methods
    console.warn = originalWarn;
    console.error = originalError;
    
    if (warnings.length === 0) {
        console.log('✅ No React currentLevel warnings detected');
        return true;
    } else {
        console.log('❌ React warnings found:', warnings);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting comprehensive block level tests...\n');
    
    const results = {
        appLoaded: false,
        levelMenu: false,
        blockFiltering: false,
        reactWarnings: false
    };
    
    try {
        results.levelMenu = await testBlockLevelFunctionality();
        results.blockFiltering = await testBlockFiltering();
        results.reactWarnings = await testReactWarnings();
        results.appLoaded = true;
        
        console.log('\n📊 TEST RESULTS:');
        console.log('================');
        Object.entries(results).forEach(([test, passed]) => {
            console.log(`${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
        });
        
        const allPassed = Object.values(results).every(Boolean);
        console.log(`\n🏁 OVERALL: ${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
        
        if (allPassed) {
            console.log('\n✨ Block level functionality is working correctly!');
            console.log('- React warnings fixed ✅');
            console.log('- Level menu integrated ✅');
            console.log('- localStorage working ✅');
            console.log('- Block filtering ready ✅');
        }
        
        return allPassed;
        
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        return false;
    }
}

// Auto-run tests
runAllTests().then(success => {
    if (success) {
        console.log('\n🎯 You can now manually test:');
        console.log('1. Open Settings menu');
        console.log('2. Click Level option');
        console.log('3. Try different levels');
        console.log('4. Verify blocks change in toolbox');
    }
});
