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

    // content-player
    const contentPlayer = document.getElementById('content-player');
    const videoPlayer = document.getElementById('video-player');
    const imagePlayer = document.getElementById('image-player');
    const audioPlayer = document.getElementById('audio-player');
    const audioVisualizer = document.getElementById('audio-visualizer');
    const closeContentButton = document.getElementById('close-content-button');

    // --- 狀態變數 ---
    let selectedColor = null; // 只用於濾鏡顏色切換

    // 啟動 AR 的函式
    const activateAR = (color) => {
        selectedColor = color;
        colorSelectModal.hide();
        scanUi.classList.remove('hidden');
        const colors = { red: 'rgba(255,0,0,0.5)', green: 'rgba(0,255,0,0.5)', blue: 'rgba(0,0,255,0.5)' };
        arFilterOverlay.style.backgroundColor = colors[color] || 'transparent';
        arScene.systems['mindar-image-system'].start();
    };

    // 播放內容的函式
    const playContent = (src) => {
        arScene.systems['mindar-image-system'].stop();
        contentPlayer.classList.remove('hidden');
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
            console.log('顯示圖片:', src);
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
            console.log('targetFound:', targetColor, contentSrc);
            playContent(contentSrc);
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
                // 最後一頁，隱藏 intro-container，顯示 Bootstrap Modal
                introContainer.classList.add('hidden');
                colorSelectModal.show();
            }
        });
    });

    // Bootstrap Modal 裡的按鈕
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
        colorSelectModal.show(); // 重新顯示 Bootstrap Modal
    });
});