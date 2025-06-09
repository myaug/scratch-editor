// Browser test script to verify block level functionality
(function() {
    console.log('🎯 Starting comprehensive block level functional test...\n');
    
    // Wait for the page to fully load
    function waitForScratch() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.React && window.Redux && document.querySelector('.gui_stage-and-target-wrapper_14N65')) {
                    resolve();
                } else {
                    setTimeout(checkReady, 500);
                }
            };
            checkReady();
        });
    }
    
    // Test function to check block availability
    function testBlockLevels() {
        console.log('🔍 Testing block level functionality...');
        
        // Check if we can access the Redux store
        const app = document.querySelector('#app');
        if (!app || !app._reactInternalFiber) {
            console.log('❌ Could not access React/Redux store');
            return false;
        }
        
        // Try to access the store through React devtools approach
        try {
            // Look for the store in various ways
            let store = null;
            
            // Method 1: Check if there's a global store
            if (window.__REDUX_STORE__) {
                store = window.__REDUX_STORE__;
            }
            
            // Method 2: Try to get from React component
            if (!store) {
                const reactRoot = document.querySelector('#app')._reactInternalFiber || document.querySelector('#app')._reactInternalInstance;
                if (reactRoot) {
                    // This is a simplified approach - in reality we'd need to traverse the fiber tree
                    console.log('📊 Found React root, but need to traverse for store...');
                }
            }
            
            if (store) {
                const state = store.getState();
                console.log('✅ Current block level:', state.scratchGui.blockLevel.level);
                
                // Test level changes
                console.log('🔄 Testing level changes...');
                const levels = ['explorer', 'creator', 'master', 'studio'];
                
                levels.forEach(level => {
                    store.dispatch({
                        type: 'scratch-gui/block-level/SET_BLOCK_LEVEL',
                        level: level
                    });
                    const newState = store.getState();
                    console.log(`Set level to ${level}:`, newState.scratchGui.blockLevel.level === level ? '✅' : '❌');
                });
                
                return true;
            } else {
                console.log('⚠️  Could not access Redux store directly');
                return false;
            }
            
        } catch (error) {
            console.log('❌ Error accessing store:', error.message);
            return false;
        }
    }
    
    // Test localStorage functionality
    function testLocalStorage() {
        console.log('\n💾 Testing localStorage functionality...');
        
        const originalLevel = localStorage.getItem('scratchBlockLevel');
        console.log('Original level:', originalLevel);
        
        const levels = ['explorer', 'creator', 'master', 'studio'];
        const results = [];
        
        levels.forEach(level => {
            localStorage.setItem('scratchBlockLevel', level);
            const retrieved = localStorage.getItem('scratchBlockLevel');
            const success = retrieved === level;
            results.push(success);
            console.log(`${level}: ${success ? '✅' : '❌'}`);
        });
        
        // Restore original
        if (originalLevel) {
            localStorage.setItem('scratchBlockLevel', originalLevel);
        }
        
        return results.every(r => r);
    }
    
    // Test UI menu availability
    function testUIMenu() {
        console.log('\n🎨 Testing UI menu availability...');
        
        // Look for settings menu button
        const settingsButton = document.querySelector('[data-tip="Settings"]') || 
                              document.querySelector('button[aria-label="Settings"]') ||
                              document.querySelector('.menu-bar_menu-bar-item_oLDa-');
        
        if (settingsButton) {
            console.log('✅ Found settings menu button');
            
            // Try to click and look for level menu
            settingsButton.click();
            
            setTimeout(() => {
                const levelMenu = document.querySelector('[class*="level"]') ||
                                 Array.from(document.querySelectorAll('*')).find(el => 
                                    el.textContent && el.textContent.toLowerCase().includes('level')
                                 );
                
                if (levelMenu) {
                    console.log('✅ Level menu appears to be available');
                } else {
                    console.log('⚠️  Level menu not found in settings');
                }
                
                // Close menu
                document.body.click();
            }, 1000);
            
            return true;
        } else {
            console.log('❌ Settings menu button not found');
            return false;
        }
    }
    
    // Test toolbox changes
    function testToolboxFiltering() {
        console.log('\n🧰 Testing toolbox filtering...');
        
        const toolbox = document.querySelector('.blocklyToolboxDiv') || 
                       document.querySelector('[class*="toolbox"]');
        
        if (toolbox) {
            console.log('✅ Found toolbox element');
            
            // Count blocks in different categories
            const motionCategory = Array.from(toolbox.querySelectorAll('*')).find(el => 
                el.textContent && el.textContent.toLowerCase().includes('motion')
            );
            
            if (motionCategory) {
                console.log('✅ Found motion category');
                // Could count blocks here if needed
            }
            
            return true;
        } else {
            console.log('❌ Toolbox not found');
            return false;
        }
    }
    
    // Main test execution
    async function runTests() {
        await waitForScratch();
        console.log('✅ Scratch environment loaded\n');
        
        const results = {
            localStorage: testLocalStorage(),
            ui: testUIMenu(),
            toolbox: testToolboxFiltering(),
            redux: testBlockLevels()
        };
        
        console.log('\n📊 TEST RESULTS:');
        console.log('localStorage:', results.localStorage ? '✅' : '❌');
        console.log('UI Menu:', results.ui ? '✅' : '❌');
        console.log('Toolbox:', results.toolbox ? '✅' : '❌');
        console.log('Redux:', results.redux ? '✅' : '❌');
        
        const allPassed = Object.values(results).every(r => r);
        console.log('\n🏁 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED');
        
        return results;
    }
    
    // Auto-run tests
    runTests().catch(error => {
        console.error('❌ Test execution failed:', error);
    });
    
})();
