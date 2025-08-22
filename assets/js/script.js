// 等待整個 HTML 頁面都載入完成後，再執行 JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // --- 獲取所有 DOM 元素 ---
    // intro-container
    const introContainer = document.getElementById('intro-container');
    const introPages = Array.from(document.querySelectorAll('.intro-page'));
    const introButtons = Array.from(document.querySelectorAll('.intro-page-button'));
    let currentIntroPage = 0;

    // Bootstrap Modal (使用 Bootstrap 的 JavaScript 元件)
    const colorSelectModal = new bootstrap.Modal(document.getElementById('colorSelectModal'));

    // AR-colorful-filter
    const arScene = document.getElementById('ar-scene');
    const scanUi = document.getElementById('scan-ui');
    const arFilterOverlay = document.getElementById('ar-filter-overlay');
    const switchFilterButton = document.getElementById('switch-filter-button');

    // 內容播放器相關
    const contentPlayer = document.getElementById('content-player');
    const videoPlayer = document.getElementById('video-player');
    const imagePlayer = document.getElementById('image-player');
    const audioPlayer = document.getElementById('audio-player');
    const audioVisualizer = document.getElementById('audio-visualizer');
    const closeContentButton = document.getElementById('close-content-button');

    // --- 狀態變數 ---
    let selectedColor = null; // 用來儲存用戶選擇的濾鏡顏色

    // --- 資料對應關係 ---
    const colorMapping = {
        red: 'cyan',      // 紅色 > 青色
        green: 'magenta', // 綠色 > 洋紅色
        blue: 'yellow'    // 藍色 > 黃色
    };

    // 啟動 AR 的函式
    const activateAR = (color) => {
        selectedColor = color; // 記錄當前選擇的顏色
        colorSelectModal.hide(); // 使用 Bootstrap 的方法隱藏顏色選擇 Modal
        scanUi.classList.remove('hidden'); // 顯示 AR 掃描介面

        // 根據選擇的顏色，設定 AR 介面的濾鏡疊加層顏色
        const colors = { red: 'rgba(255,0,0,0.5)', green: 'rgba(0,255,0,0.5)', blue: 'rgba(0,0,255,0.5)' };
        arFilterOverlay.style.backgroundColor = colors[color] || 'transparent';

        // 正式啟動 MindAR 的掃描系統
        arScene.systems['mindar-image-system'].start();
    };

    // 播放內容的函式
    const playContent = (src) => {
        arScene.systems['mindar-image-system'].stop(); // 暫停 AR 掃描，節省效能
        contentPlayer.classList.remove('hidden'); // 顯示內容播放器

        // 先隱藏所有內容類型，進行初始化
        videoPlayer.classList.add('hidden');
        imagePlayer.classList.add('hidden');
        audioVisualizer.classList.add('hidden');

        if (src.endsWith('.mp4')) {
            videoPlayer.classList.remove('hidden');
            videoPlayer.src = src;
            videoPlayer.play();
        }
        else if (src.endsWith('.mp3')) {
            audioVisualizer.classList.remove('hidden');
            audioPlayer.src = src;
            audioPlayer.play();
        }
        else {
            imagePlayer.classList.remove('hidden');
            imagePlayer.src = src;
        }
    };

    // --- 為所有目標綁定 targetFound 事件 ---
    // 遍歷所有帶有 'ar-target' class 的 a-entity
    document.querySelectorAll('.ar-target').forEach(target => {
        // 從 HTML 的 data-* 屬性中讀取預設好的資料
        const targetColor = target.dataset.color; // 目標本身的顏色 (cyan, magenta, or yellow)
        const contentSrc = target.dataset.content; // 直接讀取 data-content 對應的內容路徑

        // 為每個目標新增事件監聽器，當 MindAR 找到它時就會觸發
        target.addEventListener('targetFound', () => {
            console.log('targetFound:', targetColor, contentSrc, selectedColor);
            // 檢查當前選擇的濾鏡顏色，是否能看到這個目標
            if (colorMapping[selectedColor] === targetColor) {
                console.log(`匹配成功！使用者使用 ${selectedColor} 濾鏡找到了 ${targetColor} 目標。`);
                playContent(contentSrc); // 播放對應的內容
            }
        });
    });

    // intro-container 頁面切換
    function showIntroPage(idx) {
        introPages.forEach((page, i) => {
            if (i === idx) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
    }
    showIntroPage(currentIntroPage);

    introButtons.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            if (currentIntroPage < introPages.length - 1) {
                currentIntroPage++;
                showIntroPage(currentIntroPage);
            } else {
                // 最後一頁，隱藏 intro-container，顯示顏色選擇 Modal
                introContainer.classList.add('hidden');
                colorSelectModal.show();
            }
        });
    });

    // 顏色選擇 Modal 裡的按鈕
    document.querySelectorAll('#colorSelectModal .btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const color = event.target.id.split('-')[1]; // 從按鈕 ID 中提取顏色
            activateAR(color); // 啟動對應顏色的 AR
        });
    });

    // 內容播放器：點擊關閉按鈕
    closeContentButton.addEventListener('click', () => {
        contentPlayer.classList.add('hidden'); // 隱藏播放器
        // 停止並重置媒體，避免背景播放
        videoPlayer.pause();
        videoPlayer.src = "";
        imagePlayer.src = "";
        audioPlayer.pause();
        audioPlayer.src = "";
        // 返回掃描介面
        arScene.systems['mindar-image-system'].start();
    });

    // AR 介面：點擊切換濾鏡按鈕
    switchFilterButton.addEventListener('click', () => {
        arScene.systems['mindar-image-system'].stop(); // 暫停掃描
        scanUi.classList.add('hidden'); // 隱藏掃描介面
        colorSelectModal.show(); // 重新顯示顏色選擇 Modal
    });
});
