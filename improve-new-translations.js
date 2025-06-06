#!/usr/bin/env node

const fs = require('fs');

// Improved translation for debug modal and other new messages
const improvedTranslations = {
    "gui.debugModal.addSoundCheckpoints.description1": "Tương tự như chiến lược Chậm lại, bạn có thể thêm các âm thanh khác nhau với khối \"phát đến khi xong\" tại các điểm quan trọng để kiểm tra chuỗi của bạn.",
    "gui.debugModal.addSoundCheckpoints.description2": "Nếu một âm thanh không phát, lỗi có thể ở trước khối này. Nếu âm thanh phát, lỗi có thể ở sau khối này.",
    "gui.debugModal.addSoundCheckpoints.description3": "Loại bỏ các âm thanh một khi mã của bạn hoạt động.",
    "gui.debugModal.addSoundCheckpoints.title": "Thêm Điểm Kiểm Tra Âm Thanh",
    
    "gui.debugModal.askForHelp.description1": "Nếu bạn vẫn bị kẹt, bạn có thể yêu cầu trợ giúp từ bạn bè. Hãy thử tìm studio gỡ lỗi/trợ giúp và chia sẻ dự án của bạn, yêu cầu trợ giúp trong phần bình luận hoặc ghi chú dự án.",
    "gui.debugModal.askForHelp.description2": "Hãy yêu cầu một đến ba người thử mã của bạn, vì những người khác nhau có thể có góc nhìn hoặc giải pháp khác nhau!",
    "gui.debugModal.askForHelp.title": "Yêu Cầu Trợ Giúp",
    
    "gui.debugModal.breakItDown.description1": "Tách các khối thành các phần nhỏ hơn (hoặc chuỗi), và nhấp để xem mỗi chuỗi làm gì.",
    "gui.debugModal.breakItDown.description2": "Một khi các chuỗi nhỏ hơn hoạt động như bạn mong đợi, hãy thêm chúng trở lại chương trình chính.",
    "gui.debugModal.breakItDown.description3": "Quá trình này được gọi là phân tách.",
    "gui.debugModal.breakItDown.title": "Chia Nhỏ",
    
    "gui.debugModal.checkCodeSequence.description1": "Kiểm tra rằng chuỗi mã của bạn được gắn vào nhân vật đúng hoặc phông nền, nếu phù hợp.",
    "gui.debugModal.checkCodeSequence.description2": "Nếu bạn cần di chuyển mã sang nhân vật khác, nhấp và kéo cho đến khi bạn di chuột qua nhân vật đúng. Thả nó khi nhân vật lắc lư.",
    "gui.debugModal.checkCodeSequence.description3": "Bạn cũng có thể sử dụng Ba lô (ở dưới màn hình) để lưu trữ và di chuyển mã hoặc tài nguyên của bạn.",
    "gui.debugModal.checkCodeSequence.title": "Kiểm Tra Chuỗi Mã",
    
    "gui.debugModal.checkTheValues.description1": "Nếu bạn đang sử dụng biến hoặc khối báo cáo, hãy kiểm tra giá trị tại thời điểm chuỗi mã được chạy.",
    "gui.debugModal.checkTheValues.description2": "Tất cả nhân vật có nên điều khiển một biến, hay chỉ một nhân vật nên có quyền điều khiển?",
    "gui.debugModal.checkTheValues.description3": "Giá trị được đặt lại ở đâu? Nó được thay đổi ở đâu?",
    "gui.debugModal.checkTheValues.title": "Kiểm Tra Giá Trị",
    
    "gui.debugModal.commentYourCode.description1": "Thêm ghi chú vào mã của bạn có thể giúp những người khác nhìn vào mã hiểu được nó. Nó cũng có thể giúp bạn nhớ cách mã hoạt động khi bạn quay lại sau này.",
    "gui.debugModal.commentYourCode.description2": "Nhấp chuột phải vào khu vực script để \"Thêm Ghi Chú\". Sử dụng ngôn ngữ hàng ngày để giải thích khối hoặc chuỗi nhỏ các khối làm gì.",
    "gui.debugModal.commentYourCode.title": "Thêm Ghi Chú Vào Mã",
    
    "gui.debugModal.readAloud.description1": "Khi bạn đọc mã to, hãy suy nghĩ từ góc nhìn của máy tính.",
    "gui.debugModal.readAloud.description2": "Bạn có đang bao gồm các bước không có ở đó không?",
    "gui.debugModal.readAloud.description3": "Hướng dẫn của bạn có rõ ràng không?",
    "gui.debugModal.readAloud.description4": "Nếu cái gì đó cần được đặt lại mỗi khi chương trình chạy, những hướng dẫn đó có được bao gồm không?",
    "gui.debugModal.readAloud.title": "Đọc To",
    
    "gui.debugModal.slowItDown.description1": "Máy tính chạy chương trình của bạn quá nhanh đến nỗi có thể khó theo dõi bằng mắt.",
    "gui.debugModal.slowItDown.description2": "Thêm các khối \"chờ\" hoặc \"chờ đến khi\" tạm thời để làm chậm chuỗi. Điều này cho bạn thời gian xử lý xem một phần có hoạt động hay không.",
    "gui.debugModal.slowItDown.description3": "Loại bỏ các khối chờ này khi mã của bạn hoạt động.",
    "gui.debugModal.slowItDown.title": "Chậm Lại",
    
    "gui.debugModal.takeABreak.description1": "Đôi khi, dành quá nhiều thời gian tập trung vào một vấn đề có thể phản tác dụng và gây bực bội.",
    "gui.debugModal.takeABreak.description2": "Hãy nghỉ ngơi và rời xa màn hình để làm sạch tâm trí. Sau khi nghỉ ngơi, tập trung vào việc khác, hoặc uống nước, bạn có thể tiếp cận vấn đề với con mắt mới.",
    "gui.debugModal.takeABreak.title": "Nghỉ Ngơi, Rời Xa",
    
    "gui.debugModal.thinkAboutBlockOptions.description1": "Có khối tương tự nhưng khác mà bạn có thể sử dụng không?",
    "gui.debugModal.thinkAboutBlockOptions.description2": "Một số khối trông tương tự nhưng có thể hoạt động khác nhau, chẳng hạn như \"đặt\" vs \"thay đổi\" hoặc \"phát đến khi xong\" vs \"bắt đầu\".",
    "gui.debugModal.thinkAboutBlockOptions.description3": "Thử sử dụng khối tương tự thay cho cái bạn có, và xem điều này có ảnh hưởng đến kết quả không.",
    "gui.debugModal.thinkAboutBlockOptions.title": "Suy Nghĩ Về Tùy Chọn Khối",
    
    "gui.debugModal.timingAndParallelism.description1": "Bạn có nhiều sự kiện cố gắng chạy cùng lúc không? Nếu hai chuỗi được lập trình bắt đầu cùng lúc, bạn có thể gặp hành vi không thể đoán trước.",
    "gui.debugModal.timingAndParallelism.description2": "Thêm các chờ nhỏ, truyền tin, hoặc tương tác người dùng (như nhấp chuột hoặc nhấn phím) để xem điều này có ảnh hưởng đến kết quả không.",
    "gui.debugModal.timingAndParallelism.sectionTitle": "Thời Gian & Song Song",
    "gui.debugModal.timingAndParallelism.title": "Suy Nghĩ Về Thời Gian & Song Song",
    
    "gui.debugModal.tinkerWithBlockOrder.description1": "Thử điều chỉnh thứ tự/chuỗi của các khối.",
    "gui.debugModal.tinkerWithBlockOrder.description2": "Cái gì cần xảy ra trước?",
    "gui.debugModal.tinkerWithBlockOrder.description3": "Cái gì xảy ra thứ hai?",
    "gui.debugModal.tinkerWithBlockOrder.description4": "Giá trị hoặc nhân vật có cần đặt lại trước khi phần mã tiếp theo chạy không?",
    "gui.debugModal.tinkerWithBlockOrder.description5": "Thử sử dụng các khối bên trong vòng lặp hoặc câu lệnh điều kiện, so với bên ngoài vòng lặp hoặc câu lệnh điều kiện.",
    "gui.debugModal.tinkerWithBlockOrder.title": "Điều Chỉnh Thứ Tự Khối",
    
    "gui.debugModal.title": "Gỡ Lỗi | Thoát Khỏi Trục Trặc",
    
    "gui.debugModal.toLoopOrNot.description1": "Nếu sử dụng các khối Điều khiển như \"mãi mãi\" và \"lặp lại\", hãy kiểm tra rằng tất cả khối bên trong vòng lặp nên ở đó, hoặc nếu một khối (như \"chờ\") bị thiếu để đặt lại hành động hoặc điều chỉnh thời gian. Bạn có muốn vòng lặp chạy mãi mãi hay một số lần nhất định? Có cái gì nên dừng vòng lặp không?",
    "gui.debugModal.toLoopOrNot.description2": "Có thể bạn không sử dụng vòng lặp khi nên sử dụng? Ví dụ, nếu bạn đang sử dụng khối câu lệnh điều kiện như \"nếu thì\", chương trình chỉ cần kiểm tra xem nó đúng hay sai một lần? Hay nó cần kiểm tra liên tục, trong trường hợp đó, bạn muốn đặt câu lệnh điều kiện bên trong vòng lặp mãi mãi?",
    "gui.debugModal.toLoopOrNot.title": "Lặp Hay Không Lặp",
    
    // Backpack messages  
    "gui.backpack.costumeLabel": "trang phục",
    "gui.backpack.scriptLabel": "script", 
    "gui.backpack.soundLabel": "âm thanh",
    "gui.backpack.spriteLabel": "nhân vật",
    
    // Browser modal
    "gui.unsupportedBrowser.errorLabel": "Đã Xảy Ra Lỗi",
    "gui.unsupportedBrowser.label": "Trình duyệt không được hỗ trợ",
    
    // Controls
    "gui.controls.go": "Chạy",
    "gui.controls.stop": "Dừng",
    
    // Custom procedures
    "gui.customProcedures.myblockModalTitle": "Tạo Khối",
    
    // Library  
    "gui.library.filterPlaceholder": "Tìm kiếm",
    "gui.library.allTag": "Tất cả",
    
    // Menu bar
    "gui.menuBar.LanguageSelector": "bộ chọn ngôn ngữ",
    "gui.menuBar.tutorialsLibrary": "Hướng dẫn",
    
    // Play button
    "gui.playButton.play": "Phát",
    "gui.playButton.stop": "Dừng",
    
    // Prompts
    "gui.gui.cloudVariableOption": "Biến đám mây (lưu trữ trên máy chủ)",
    "gui.gui.variableScopeOptionAllSprites": "Cho tất cả nhân vật", 
    "gui.gui.variableScopeOptionSpriteOnly": "Chỉ cho nhân vật này",
    "gui.gui.variablePromptAllSpritesMessage": "Biến này sẽ có sẵn cho tất cả nhân vật.",
    "gui.gui.variablePromptSpriteOnlyMessage": "Biến này chỉ có sẵn cho nhân vật này.",
    
    // Record modal
    "gui.recordingStep.alertMsg": "Không thể bắt đầu ghi",
    "gui.recordingStep.beginRecord": "Bắt đầu ghi bằng cách nhấn nút dưới",
    "gui.recordingStep.permission": "{arrow}Chúng tôi cần quyền sử dụng micro của bạn",
    "gui.recordingStep.stop": "Dừng ghi",
    "gui.recordingStep.record": "Ghi",
    
    // Record modal main
    "gui.recordModal.title": "Ghi Âm Thanh",
    
    // Slider prompt  
    "gui.sliderModal.max": "Giá trị tối đa",
    "gui.sliderModal.min": "Giá trị tối thiểu",
    "gui.sliderModal.title": "Thay đổi phạm vi thanh trượt",
    
    // Sound editor
    "gui.soundEditor.sound": "Âm thanh",
    "gui.soundEditor.play": "Phát",
    "gui.soundEditor.stop": "Dừng",
    "gui.soundEditor.copy": "Sao chép", 
    "gui.soundEditor.paste": "Dán",
    "gui.soundEditor.copyToNew": "Sao chép ra Mới",
    "gui.soundEditor.delete": "Xóa",
    "gui.soundEditor.save": "Lưu",
    "gui.soundEditor.undo": "Hoàn tác",
    "gui.soundEditor.redo": "Làm lại",
    "gui.soundEditor.trim": "Cắt",
    "gui.soundEditor.silence": "Im lặng",
    "gui.soundEditor.louder": "To hơn",
    "gui.soundEditor.softer": "Nhỏ hơn",
    "gui.soundEditor.reverse": "Đảo ngược",
    "gui.soundEditor.robot": "Robot",
    "gui.soundEditor.echo": "Tiếng vọng",
    "gui.soundEditor.faster": "Nhanh hơn",
    "gui.soundEditor.slower": "Chậm hơn",
    "gui.soundEditor.fadeIn": "Mờ dần vào",
    "gui.soundEditor.fadeOut": "Mờ dần ra",
    "gui.soundEditor.mute": "Tắt tiếng",
    
    // Sprite info
    "gui.spriteInfo.direction": "Hướng",
    "gui.spriteInfo.show": "Hiển thị",
    "gui.spriteInfo.size": "Kích thước",
    
    // Sprite selector
    "gui.spriteSelector.addBackdropFromLibrary": "Chọn Phông Nền",
    "gui.spriteSelector.addSpriteFromLibrary": "Chọn Nhân Vật",
    "gui.spriteSelector.addSpriteFromPaint": "Vẽ",
    "gui.spriteSelector.addSpriteFromSurprise": "Ngẫu nhiên",
    
    // Stage header
    "gui.stageHeader.stageSizeFull": "Vào chế độ toàn màn hình",
    "gui.stageHeader.stageSizeSmall": "Chuyển sang sân khấu nhỏ",
    "gui.stageHeader.stageSizeLarge": "Chuyển sang sân khấu lớn",
    "gui.stageHeader.stageSizeUnFullScreen": "Thoát chế độ toàn màn hình",
    "gui.stageHeader.fullscreenControl": "Điều khiển toàn màn hình",
    
    // Stage selector
    "gui.stageSelector.addBackdropFromFile": "Tải lên Phông Nền",
    "gui.stageSelector.addBackdropFromLibrary": "Chọn Phông Nền", 
    "gui.stageSelector.addBackdropFromPaint": "Vẽ",
    "gui.stageSelector.addBackdropFromSurprise": "Ngẫu nhiên",
    
    // WebGL modal
    "gui.webglModal.label": "Trình duyệt của bạn không hỗ trợ WebGL",
    
    // Containers
    "gui.costumeLibrary.chooseABackdrop": "Chọn Phông Nền",
    "gui.costumeLibrary.chooseACostume": "Chọn Trang Phục",
    "gui.costumeTab.addBackdropFromLibrary": "Chọn Phông Nền",
    "gui.costumeTab.addCostumeFromLibrary": "Chọn Trang Phục",
    "gui.costumeTab.addBlankCostume": "Vẽ",
    "gui.costumeTab.addSurpriseCostume": "Ngẫu nhiên",
    "gui.costumeTab.addFileBackdrop": "Tải lên Phông Nền",
    "gui.costumeTab.addFileCostume": "Tải lên Trang Phục",
    
    "gui.extensionLibrary.chooseAnExtension": "Chọn Tiện ích mở rộng",
    "gui.extensionLibrary.extensionUrl": "Nhập URL của tiện ích mở rộng",
    
    "gui.recordingStep.alertMsg": "Không thể bắt đầu ghi",
    
    "gui.soundLibrary.chooseASound": "Chọn Âm Thanh",
    
    "gui.soundTab.addSoundFromLibrary": "Chọn Âm Thanh",
    "gui.soundTab.addSoundFromRecording": "Ghi âm",
    "gui.soundTab.addSoundFromFile": "Tải lên Âm Thanh",
    "gui.soundTab.addSurpriseSound": "Ngẫu nhiên",
    
    "gui.spriteLibrary.chooseASprite": "Chọn Nhân Vật",
    
    "gui.tipsLibrary.tutorials": "Chọn Hướng dẫn",
    
    // Library tags
    "gui.libraryTags.all": "Tất cả",
    "gui.libraryTags.animals": "Động vật",
    "gui.libraryTags.dance": "Khiêu vũ",
    "gui.libraryTags.effects": "Hiệu ứng",
    "gui.libraryTags.fantasy": "Huyền bí",
    "gui.libraryTags.fashion": "Thời trang",
    "gui.libraryTags.food": "Thức ăn", 
    "gui.libraryTags.letters": "Chữ cái",
    "gui.libraryTags.loops": "Vòng lặp",
    "gui.libraryTags.music": "Âm nhạc",
    "gui.libraryTags.notes": "Nốt nhạc",
    "gui.libraryTags.people": "Con người",
    "gui.libraryTags.percussion": "Bộ gõ",
    "gui.libraryTags.space": "Không gian",
    "gui.libraryTags.sports": "Thể thao",
    "gui.libraryTags.things": "Đồ vật",
    "gui.libraryTags.transportation": "Phương tiện",
    "gui.libraryTags.voice": "Giọng nói",
    "gui.libraryTags.wacky": "Kỳ quặc",
    
    // Opcode labels
    "gui.opcodeLabels.costumename": "tên trang phục",
    "gui.opcodeLabels.direction": "hướng",
    "gui.opcodeLabels.size": "kích thước",
    "gui.opcodeLabels.volume": "âm lượng",
    "gui.opcodeLabels.xposition": "vị trí x",
    "gui.opcodeLabels.yposition": "vị trí y",
    "gui.opcodeLabels.answer": "câu trả lời",
    "gui.opcodeLabels.backdrop": "phông nền",
    "gui.opcodeLabels.backdropname": "tên phông nền",
    "gui.opcodeLabels.backdropnumber": "số phông nền",
    "gui.opcodeLabels.costumenumber": "số trang phục",
    "gui.opcodeLabels.currentminute": "phút hiện tại",
    "gui.opcodeLabels.currentmonth": "tháng hiện tại",
    "gui.opcodeLabels.currentyear": "năm hiện tại",
    "gui.opcodeLabels.dayofweek": "thứ trong tuần",
    "gui.opcodeLabels.dayselapsed": "ngày đã trôi qua",
    "gui.opcodeLabels.loudness": "độ to",
    "gui.opcodeLabels.timer": "bộ đếm thời gian",
    "gui.opcodeLabels.username": "tên người dùng"
};

function improveTranslations() {
    console.log('🔧 Improving Vietnamese translations...');
    
    const viPath = '/Volumes/Data/Projects/biz/hocmai.ai/scratch-editor/packages/scratch-gui/build/custom-locales/vi.json';
    
    let viMessages = {};
    try {
        viMessages = JSON.parse(fs.readFileSync(viPath, 'utf8'));
        console.log(`📖 Loaded ${Object.keys(viMessages).length} Vietnamese messages`);
    } catch (error) {
        console.error('❌ Could not load Vietnamese locale file');
        return;
    }
    
    let improvedCount = 0;
    Object.entries(improvedTranslations).forEach(([id, translation]) => {
        if (viMessages[id] && viMessages[id] !== translation) {
            viMessages[id] = translation;
            improvedCount++;
        } else if (!viMessages[id]) {
            viMessages[id] = translation;
            improvedCount++;
        }
    });
    
    console.log(`✅ Improved ${improvedCount} translations`);
    
    // Sort keys alphabetically
    const sortedVi = {};
    Object.keys(viMessages).sort().forEach(key => {
        sortedVi[key] = viMessages[key];
    });
    
    // Write back to file
    fs.writeFileSync(viPath, JSON.stringify(sortedVi, null, 4));
    
    console.log(`💾 Updated Vietnamese locale file: ${viPath}`);
    console.log(`🎉 Total Vietnamese messages: ${Object.keys(viMessages).length}`);
}

// Run improvement
improveTranslations();
