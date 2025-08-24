document.addEventListener('DOMContentLoaded', () => {
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
    let selectedColor = null; // 用於濾鏡顏色切換

    // 啟動 AR 的函式
    const activateAR = (color) => {
        selectedColor = color;
        colorSelectModal.hide();
        scanUi.classList.remove('hidden');
        const colors = { red: 'rgba(255,0,0,0.5)', green: 'rgba(0,255,0,0.5)', blue: 'rgba(0,0,255,0.5)' };
        arFilterOverlay.style.backgroundColor = colors[color] || 'transparent';
        setTimeout(() => {
            arScene.systems['mindar-image-system'].start();
        }, 200);
    };

    // content-player
    const playContent = (src) => {
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
        }
    };

    // --- targetFound 事件 ---
    document.querySelectorAll('.ar-target').forEach(target => {
        const targetColor = target.dataset.color; // 目標本身的顏色 (red, green, blue)
        const contentSrc = target.dataset.content; // 直接讀取 data-content 對應的內容路徑
        // 事件監聽，當 MindAR 找到它時就會觸發
        target.addEventListener('targetFound', () => {
            if (targetColor === selectedColor) {
                console.log('targetFound:', targetColor, contentSrc);
                arScene.systems['mindar-image-system'].stop();
                playContent(contentSrc);
            } else {
                console.log('顏色不符，忽略 target:', targetColor);
                const tip = document.getElementById('scan-tip');
                tip.textContent = `請切換至 ${targetColor} 主題才能解鎖此內容`;
                tip.classList.remove('hidden');
            }
        });
        // 當 targetLost 時隱藏提示
        target.addEventListener('targetLost', () => {
            const tip = document.getElementById('scan-tip');
            tip.classList.add('hidden');
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

    introButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (currentIntroPage < introPages.length - 1) {
                currentIntroPage++;
                setTimeout(() => {
                    showIntroPage(currentIntroPage);
                }, 800); // 0.8秒延遲
            } else {
                // 最後一頁，隱藏 intro-container，顯示 Bootstrap Modal
                setTimeout(() => {
                    introContainer.classList.add('hidden');
                    colorSelectModal.show();
                }, 800); // 0.8秒延遲
            }
        });
    });

    // Bootstrap Modal
    document.querySelectorAll('#colorSelectModal .btn').forEach(button => {
        button.addEventListener('click', (event) => {
            setTimeout(() => {
                const color = event.target.id.split('-')[1]; // 從按鈕 ID 中提取顏色
                activateAR(color); // 啟動對應顏色的 AR
            }, 800); // 0.8秒延遲
        });
    });

    // content-player：點擊關閉按鈕
    closeContentButton.addEventListener('click', () => {
        contentPlayer.classList.add('hidden'); // 隱藏播放器
        // 停止並重置媒體，避免背景播放
        videoPlayer.pause();
        videoPlayer.src = "";
        imagePlayer.src = "";
        audioPlayer.pause();
        audioPlayer.src = "";
        arScene.systems['mindar-image-system'].start(); // 返回掃描介面
    });

    // AR 介面：點擊切換濾鏡按鈕
    switchFilterButton.addEventListener('click', () => {
        setTimeout(() => {
            arScene.systems['mindar-image-system'].stop(); // 暫停掃描
            scanUi.classList.add('hidden'); // 隱藏掃描介面
            colorSelectModal.show();
        }, 800); // 0.8秒延遲
    });
});