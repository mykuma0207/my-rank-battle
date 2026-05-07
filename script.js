let playerHand = [], round = 1, wins = 0, loses = 0, cpuHandCount = 5;
const ranks = ['S', 'A', 'B', 'C', 'D', 'E'];
const getImgPath = (type) => `images/${type}.png`; 
const normalSE = new Audio('images/se.mp3');
const shakinSE = new Audio('images/shakin.mp3');

// --- 1. ここを修正：ゲーム開始関数 ---
function startGame() {
    const titleScreen = document.getElementById('title-screen');
    const gameMainArea = document.getElementById('game-main-area');
    
    // フェードアウト演出
    titleScreen.style.opacity = '0';
    
    setTimeout(() => {
        titleScreen.style.display = 'none';
        gameMainArea.style.display = 'block';
        
        // ★重要：ここでゲームを初期化する
        initGame();
        
        // 音声制限の解除
        normalSE.play().then(() => {
            normalSE.pause();
            normalSE.currentTime = 0;
        }).catch(e => console.log("Audio play failed", e));
    }, 500);
}

// --- 2. initGame 関数の中に、念のため表示設定を追加 ---
function initGame() {
    round = 1; wins = 0; loses = 0; cpuHandCount = 5;
    playerHand = Array.from({length: 5}, () => getRandomRank());
    
    // UIをリセット
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('result-text').innerText = "カードを選んでね";
    document.getElementById('player-pushed').innerHTML = '';
    document.getElementById('cpu-pushed').innerHTML = '';
    document.getElementById('player-pushed').className = 'card empty';
    document.getElementById('cpu-pushed').className = 'card empty';
    document.getElementById('p-effect-container').innerHTML = '';
    document.getElementById('c-effect-container').innerHTML = '';
    
    const pChar = document.getElementById('player-char'), cChar = document.getElementById('cpu-char');
    pChar.classList.remove('char-win', 'char-lose');
    cChar.classList.remove('char-win', 'char-lose');

    renderHand();
    updateUI();
}

// --- 3. ファイルの最後にある window.onload を以下に書き換え ---
window.onload = () => {
    // 起動時はタイトル画面が表示されていることを確認するだけ
    document.getElementById('title-screen').style.display = 'flex';
    document.getElementById('game-main-area').style.display = 'none';
};
