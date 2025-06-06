#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Translation dictionary for Vietnamese
const translationDict = {
    // Basic UI terms
    'costume': 'trang phục',
    'sound': 'âm thanh', 
    'script': 'script',
    'sprite': 'nhân vật',
    'browser': 'trình duyệt',
    'error': 'lỗi',
    'occurred': 'xảy ra',
    'not supported': 'không được hỗ trợ',
    'go': 'Chạy',
    'stop': 'Dừng',
    'make a block': 'Tạo khối',
    'debugging': 'Gỡ lỗi',
    'getting unstuck': 'Thoát khỏi trục trặc',
    'read aloud': 'Đọc to',
    'break it down': 'Chia nhỏ',
    'slow it down': 'Chậm lại',
    'add sound checkpoints': 'Thêm điểm kiểm tra âm thanh',
    'tinker with block order': 'Điều chỉnh thứ tự khối',
    'to loop or not': 'Lặp hay không lặp',
    'timing': 'Thời gian',
    'parallelism': 'Song song',
    'think about': 'Suy nghĩ về',
    'block options': 'Tùy chọn khối',
    'check the values': 'Kiểm tra giá trị',
    'check code sequence': 'Kiểm tra chuỗi mã',
    'comment your code': 'Thêm ghi chú vào mã',
    'take a break': 'Nghỉ ngơi',
    'step away': 'Rời xa',
    'ask for help': 'Yêu cầu trợ giúp',
    'computer': 'máy tính',
    'perspective': 'góc nhìn',
    'instructions': 'hướng dẫn',
    'clear': 'rõ ràng',
    'reset': 'đặt lại',
    'program': 'chương trình',
    'included': 'được bao gồm',
    'blocks': 'khối',
    'smaller chunks': 'phần nhỏ hơn',
    'sequences': 'chuỗi',
    'click': 'nhấp',
    'sequence': 'chuỗi',
    'main program': 'chương trình chính',
    'process': 'quá trình',
    'decomposition': 'phân tách',
    'quickly': 'nhanh chóng',
    'follow': 'theo dõi',
    'eyes': 'mắt',
    'temporary': 'tạm thời',
    'wait': 'chờ',
    'wait until': 'chờ đến khi',
    'gives you time': 'cho bạn thời gian',
    'piece': 'phần',
    'worked': 'hoạt động',
    'remove': 'loại bỏ',
    'once': 'một khi',
    'code works': 'mã hoạt động',
    'similar': 'tương tự',
    'strategy': 'chiến lược',
    'different sounds': 'âm thanh khác nhau',
    'play until done': 'phát đến khi xong',
    'key points': 'điểm quan trọng',
    'test': 'kiểm tra',
    'sound': 'âm thanh',
    'bug': 'lỗi',
    'before': 'trước',
    'after': 'sau',
    'block': 'khối',
    'adjusting': 'điều chỉnh',
    'order': 'thứ tự',
    'first': 'đầu tiên',
    'second': 'thứ hai',
    'values': 'giá trị',
    'sprites': 'nhân vật',
    'next': 'tiếp theo',
    'runs': 'chạy',
    'inside': 'bên trong',
    'loop': 'vòng lặp',
    'conditional statement': 'câu lệnh điều kiện',
    'outside': 'bên ngoài',
    'control blocks': 'khối điều khiển',
    'forever': 'mãi mãi',
    'repeat': 'lặp lại',
    'should be there': 'nên ở đó',
    'missing': 'thiếu',
    'action': 'hành động',
    'timing': 'thời gian',
    'certain number': 'số lượng nhất định',
    'times': 'lần',
    'something': 'cái gì đó',
    'looping': 'vòng lặp',
    'perhaps': 'có lẽ',
    'instance': 'trường hợp',
    'if then': 'nếu thì',
    'check': 'kiểm tra',
    'true': 'đúng',
    'false': 'sai',
    'continuously': 'liên tục',
    'case': 'trường hợp',
    'place': 'đặt',
    'multiple events': 'nhiều sự kiện',
    'same time': 'cùng lúc',
    'unpredictable behavior': 'hành vi không thể đoán trước',
    'small waits': 'chờ nhỏ',
    'broadcasts': 'truyền tin',
    'user interaction': 'tương tác người dùng',
    'clicking': 'nhấp chuột',
    'pressing': 'nhấn',
    'key': 'phím',
    'affects': 'ảnh hưởng',
    'result': 'kết quả',
    'similar but different': 'tương tự nhưng khác',
    'behave differently': 'hoạt động khác nhau',
    'set': 'đặt',
    'change': 'thay đổi',
    'start': 'bắt đầu',
    'place': 'thay thế',
    'variables': 'biến',
    'reporter blocks': 'khối báo cáo',
    'value': 'giá trị',
    'moment': 'thời điểm',
    'run': 'chạy',
    'control': 'điều khiển',
    'variable': 'biến',
    'only one sprite': 'chỉ một nhân vật',
    'control': 'kiểm soát',
    'where': 'ở đâu',
    'changed': 'thay đổi',
    'attached': 'gắn',
    'correct': 'đúng',
    'backdrop': 'phông nền',
    'appropriate': 'phù hợp',
    'move': 'di chuyển',
    'another sprite': 'nhân vật khác',
    'drag': 'kéo',
    'hovering': 'di chuột qua',
    'release': 'thả',
    'wiggles': 'lắc lư',
    'backpack': 'ba lô',
    'bottom': 'dưới',
    'screen': 'màn hình',
    'store': 'lưu trữ',
    'assets': 'tài nguyên',
    'comments': 'ghi chú',
    'others': 'người khác',
    'looking': 'nhìn',
    'understand': 'hiểu',
    'remember': 'nhớ',
    'how': 'cách',
    'come back': 'quay lại',
    'later': 'sau này',
    'right click': 'nhấp chuột phải',
    'script area': 'khu vực script',
    'add comment': 'Thêm ghi chú',
    'everyday language': 'ngôn ngữ hàng ngày',
    'explain': 'giải thích',
    'small sequence': 'chuỗi nhỏ',
    'does': 'làm',
    'spending': 'dành',
    'too much time': 'quá nhiều thời gian',
    'focused': 'tập trung',
    'issue': 'vấn đề',
    'counterproductive': 'phản tác dụng',
    'frustrating': 'bực bội',
    'break': 'nghỉ',
    'step away': 'rời xa',
    'clear': 'làm sạch',
    'mind': 'tâm trí',
    'rest': 'nghỉ ngơi',
    'focusing': 'tập trung',
    'something else': 'cái gì khác',
    'getting': 'lấy',
    'water': 'nước',
    'approach': 'tiếp cận',
    'problem': 'vấn đề',
    'fresh eyes': 'con mắt mới',
    'still stuck': 'vẫn bị kẹt',
    'peer': 'bạn bè',
    'finding': 'tìm',
    'debugging': 'gỡ lỗi',
    'help studio': 'studio trợ giúp',
    'share': 'chia sẻ',
    'project': 'dự án',
    'asking': 'yêu cầu',
    'comment': 'bình luận',
    'project notes': 'ghi chú dự án',
    'one to three people': 'một đến ba người',
    'try': 'thử',
    'different people': 'người khác nhau',
    'different perspectives': 'góc nhìn khác nhau',
    'solutions': 'giải pháp'
};

function translateText(text) {
    if (!text) return text;
    
    let translated = text;
    
    // Apply translations from dictionary
    Object.entries(translationDict).forEach(([en, vi]) => {
        const regex = new RegExp(`\\b${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, vi);
    });
    
    return translated;
}

function mergeMessages() {
    console.log('🔄 Merging defineMessages with existing locales...');
    
    // Load existing locales
    const enPath = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/build/custom-locales/en.json';
    const viPath = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/build/custom-locales/vi.json';
    
    let existingEn = {};
    let existingVi = {};
    
    try {
        existingEn = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        existingVi = JSON.parse(fs.readFileSync(viPath, 'utf8'));
        console.log(`📖 Loaded existing locales: EN(${Object.keys(existingEn).length}), VI(${Object.keys(existingVi).length})`);
    } catch (error) {
        console.log('⚠️  Could not load existing locales, starting fresh');
    }
    
    // Load new defineMessages
    const defineMessages = JSON.parse(fs.readFileSync('extracted-define-messages.json', 'utf8'));
    console.log(`🆕 Found ${Object.keys(defineMessages).length} new defineMessages`);
    
    // Merge messages
    let newCount = 0;
    let updatedCount = 0;
    
    Object.entries(defineMessages).forEach(([id, defaultMessage]) => {
        if (!existingEn[id]) {
            newCount++;
        } else if (existingEn[id] !== defaultMessage) {
            updatedCount++;
        }
        
        // Add to English
        existingEn[id] = defaultMessage;
        
        // Add Vietnamese translation if not exists
        if (!existingVi[id]) {
            existingVi[id] = translateText(defaultMessage);
        }
    });
    
    console.log(`✅ Merge complete:`);
    console.log(`   - New messages: ${newCount}`);
    console.log(`   - Updated messages: ${updatedCount}`);
    console.log(`   - Total EN messages: ${Object.keys(existingEn).length}`);
    console.log(`   - Total VI messages: ${Object.keys(existingVi).length}`);
    
    // Sort keys alphabetically
    const sortedEn = {};
    const sortedVi = {};
    
    Object.keys(existingEn).sort().forEach(key => {
        sortedEn[key] = existingEn[key];
        sortedVi[key] = existingVi[key];
    });
    
    // Write back to files
    fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 4));
    fs.writeFileSync(viPath, JSON.stringify(sortedVi, null, 4));
    
    console.log(`💾 Updated locale files:`);
    console.log(`   - ${enPath}`);
    console.log(`   - ${viPath}`);
    
    return { newCount, updatedCount, totalEn: Object.keys(existingEn).length, totalVi: Object.keys(existingVi).length };
}

// Run merge
const result = mergeMessages();

console.log(`\n🎉 Final totals: ${result.totalEn} English messages, ${result.totalVi} Vietnamese messages`);
