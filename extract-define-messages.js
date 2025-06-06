#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively search for files
function findFiles(dir, pattern) {
    let results = [];
    try {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                results = results.concat(findFiles(fullPath, pattern));
            } else if (stat.isFile() && pattern.test(file)) {
                results.push(fullPath);
            }
        }
    } catch (error) {
        // Skip directories we can't read
    }
    
    return results;
}

// Function to extract defineMessages from file content
function extractDefineMessages(content, filePath) {
    const messages = [];
    
    // Pattern for defineMessages
    const defineMessagesPattern = /defineMessages\s*\(\s*{([^}]+(?:{[^}]*}[^}]*)*?)}\s*\)/gs;
    
    let match;
    while ((match = defineMessagesPattern.exec(content)) !== null) {
        const messagesObject = match[1];
        
        // Extract individual messages within the defineMessages object
        const messagePattern = /(\w+):\s*{([^}]+(?:{[^}]*}[^}]*)*?)}/gs;
        
        let messageMatch;
        while ((messageMatch = messagePattern.exec(messagesObject)) !== null) {
            const messageKey = messageMatch[1];
            const messageContent = messageMatch[2];
            
            // Extract id and defaultMessage
            const idMatch = messageContent.match(/id:\s*['"`]([^'"`]+)['"`]/);
            const defaultMessageMatch = messageContent.match(/defaultMessage:\s*['"`]([^'"`]*?)['"`]/s) ||
                                      messageContent.match(/defaultMessage:\s*['"`]([^'"`]*?)['"`]\s*\+/s) ||
                                      messageContent.match(/defaultMessage:\s*(.*?)(?:,\s*description|\s*})/s);
            
            if (idMatch) {
                let defaultMessage = '';
                
                if (defaultMessageMatch) {
                    // Handle multiline strings and concatenation
                    let msg = defaultMessageMatch[1];
                    
                    // Handle string concatenation with +
                    if (msg.includes('+')) {
                        msg = msg.replace(/\s*\+\s*['"`]/g, '').replace(/['"`]\s*\+\s*/g, '');
                    }
                    
                    // Handle escaped quotes and line breaks
                    msg = msg.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();
                    
                    // Remove trailing quotes if present
                    msg = msg.replace(/['"`]\s*$/, '');
                    
                    defaultMessage = msg;
                }
                
                messages.push({
                    id: idMatch[1],
                    defaultMessage: defaultMessage,
                    file: filePath,
                    key: messageKey
                });
            }
        }
    }
    
    return messages;
}

// Main function
function extractAllDefineMessages() {
    const srcDir = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/src';
    const filePattern = /\.(js|jsx|ts|tsx)$/;
    
    console.log('🔍 Searching for defineMessages in files...');
    
    const files = findFiles(srcDir, filePattern);
    console.log(`📁 Found ${files.length} JavaScript/TypeScript files`);
    
    let allMessages = [];
    let processedFiles = 0;
    let filesWithMessages = [];
    
    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // Check if file contains defineMessages
            if (content.includes('defineMessages')) {
                const messages = extractDefineMessages(content, file);
                if (messages.length > 0) {
                    allMessages = allMessages.concat(messages);
                    filesWithMessages.push(file);
                    console.log(`✅ ${path.relative(srcDir, file)}: ${messages.length} messages`);
                }
            }
            
            processedFiles++;
        } catch (error) {
            console.error(`❌ Error processing ${file}: ${error.message}`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`- Processed ${processedFiles} files`);
    console.log(`- Found defineMessages in ${filesWithMessages.length} files`);
    console.log(`- Extracted ${allMessages.length} messages`);
    
    return allMessages;
}

// Run extraction
const messages = extractAllDefineMessages();

if (messages.length > 0) {
    console.log('\n📋 Sample messages found:');
    for (let i = 0; i < Math.min(5, messages.length); i++) {
        const msg = messages[i];
        console.log(`   ${msg.id}: "${msg.defaultMessage.substring(0, 50)}${msg.defaultMessage.length > 50 ? '...' : ''}"`);
    }
    
    // Convert to locale format
    const localeMessages = {};
    messages.forEach(msg => {
        localeMessages[msg.id] = msg.defaultMessage;
    });
    
    console.log('\n💾 Saving extracted defineMessages...');
    fs.writeFileSync('extracted-define-messages.json', JSON.stringify(localeMessages, null, 2));
    
    // Also save detailed info
    fs.writeFileSync('extracted-define-messages-detailed.json', JSON.stringify(messages, null, 2));
    
    console.log('✅ Extracted defineMessages saved to:');
    console.log('   - extracted-define-messages.json (locale format)');
    console.log('   - extracted-define-messages-detailed.json (detailed info)');
} else {
    console.log('\n❌ No defineMessages found');
}
