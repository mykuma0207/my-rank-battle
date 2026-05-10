if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

// --- ゲームの状態管理 ---
let playerHand = [], round = 1, wins = 0, loses = 0, cpuHandCount = 5;
const ranks = ['S', 'A', 'B', 'C', 'D', 'E'];
const getImgPath = (type) => `images/${type}.png`; 

// --- 音源の準備 ---
const normalSE = new Audio('images/se.mp3');     
const shakinSE = new Audio('images/shakin.mp3'); 

/**
 * 1. タイトル画面からゲームを開始する関数
 */
function startGame() {
    const titleScreen = document.getElementById('title-screen');
    const gameMainArea = document.getElementById('game-main-area');
    
    // フェードアウト
    if (titleScreen) titleScreen.style.opacity = '0';
    
    setTimeout(() => {
        if (titleScreen) titleScreen.style.display = 'none';
        if (gameMainArea) gameMainArea.style.display = 'block';
        
        // バトル開始！
        initGame();
        
        // iPhone/Androidの音声再生制限を解除
        normalSE.play().then(() => {
            normalSE.pause();
            normalSE.currentTime = 0;
        }).catch(e => console.log("Audio unlock failed"));
    }, 500);
}

/**
 * 2. ゲーム初期化（手札を配る）
 */
function initGame() {
    round = 1; wins = 0; loses = 0; cpuHandCount = 5;
    playerHand = Array.from({length: 5}, () => getRandomRank());
    
    // UIのリセット
    document.getElementById('reset-btn').style.display = 'none';
    document.getElementById('result-text').innerText = "カードを選んでね";
    document.getElementById('result-text').style.color = "#f1c40f";
    
    document.getElementById('player-pushed').innerHTML = '';
    document.getElementById('cpu-pushed').innerHTML = '';
    document.getElementById('player-pushed').className = 'card empty';
    document.getElementById('cpu-pushed').className = 'card empty';
    
    document.getElementById('p-effect-container').innerHTML = '';
    document.getElementById('c-effect-container').innerHTML = '';
    
    const pChar = document.getElementById('player-char'), cChar = document.getElementById('cpu-char');
    if (pChar) pChar.classList.remove('char-win', 'char-lose');
    if (cChar) cChar.classList.remove('char-win', 'char-lose');

    const msgEl = document.getElementById('special-msg');
    if (msgEl) {
        msgEl.innerText = '';
        msgEl.className = 'special-msg';
    }

    updateUI();
    renderHand();
}

function getRandomRank() {
    const r = Math.random();
    return r < 0.05 ? 'S' : ['A','B','C','D','E'][Math.floor(Math.random()*5)];
}

function renderHand() {
    const container = document.getElementById('player-hand');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const type = playerHand[i];
        const card = document.createElement('div');
        card.className = 'card';
        if (type) {
            card.setAttribute('data-type', type);
            card.innerHTML = `<img src="${getImgPath(type)}" onerror="this.style.display='none'">`;
            card.onclick = () => playRound(i);
        } else {
            card.style.visibility = 'hidden';
        }
        container.appendChild(card);
    }
}

/**
 * 3. バトル処理
 */
function playRound(index) {
    if (round > 3 || !playerHand[index]) return;
    
    const pHand = playerHand[index];
    const cHand = getRandomRank();

    // 音の再生
    if (pHand === 'S') {
        shakinSE.currentTime = 0;
        shakinSE.play().catch(e => {});
    } else {
        normalSE.currentTime = 0;
        normalSE.play().catch(e => {});
    }

    cpuHandCount--;
    setSlot('player-pushed', pHand);
    setSlot('cpu-pushed', cHand);

    const msgEl = document.getElementById('special-msg');
    if (msgEl) {
        msgEl.innerText = '';
        msgEl.className = 'special-msg';
    }

    // 特殊演出
    setTimeout(() => {
        if (pHand === 'S') {
            msgEl.innerText = "神 降 臨";
            msgEl.classList.add('s-arrival-text');
            startConfetti(30);
            setTimeout(() => { if(msgEl.innerText === "神 降 臨") msgEl.innerText = ''; }, 2000);
        }
        if (pHand === 'E' && cHand === 'A') {
            msgEl.innerText = "下 克 上";
            msgEl.classList.add('gekokujo-text');
            document.body.classList.add('screen-shake');
            setTimeout(() => {
                document.body.classList.remove('screen-shake');
                if(msgEl.innerText === "下 克 上") msgEl.innerText = ''; 
            }, 1500);
        }
    }, 50);

    let res = judge(pHand, cHand);
    if (res === 'win') { wins++; document.getElementById('result-text').innerText = "勝ち！"; }
    else if (res === 'lose') { loses++; document.getElementById('result-text').innerText = "負け..."; }
    else { document.getElementById('result-text').innerText = "引き分け"; }

    playerHand[index] = null;
    if (round === 3) setTimeout(finishGame, 1500);
    else { round++; setTimeout(() => { updateUI(); renderHand(); }, 1200); }
}

function judge(p, c) {
    if (p === c) return 'draw';
    if (p === 'E' && c === 'A') return 'win';
    if (p === 'A' && c === 'E') return 'lose';
    return ranks.indexOf(p) < ranks.indexOf(c) ? 'win' : 'lose';
}

function setSlot(id, type) {
    const slot = document.getElementById(id);
    if (!slot) return;
    slot.className = 'card';
    slot.setAttribute('data-type', type);
    slot.innerHTML = `<img src="${getImgPath(type)}" onerror="this.style.display='none'">`;
}

/**
 * 4. 決着と演出
 */
function finishGame() {
    updateUI();
    const pChar = document.getElementById('player-char'), cChar = document.getElementById('cpu-char');
    pChar.classList.remove('char-win', 'char-lose');
    cChar.classList.remove('char-win', 'char-lose');

    setTimeout(() => {
        if (wins > loses) {
            pChar.classList.add('char-win'); cChar.classList.add('char-lose');
            spawnIcons('p-effect-container');
            document.getElementById('result-text').innerText = "🎉 勝利！ 🎉"; 
            startConfetti(80);
        } else if (loses > wins) {
            cChar.classList.add('char-win'); pChar.classList.add('char-lose');
            spawnIcons('c-effect-container');
            document.getElementById('result-text').innerText = "敗北...";
        } else {
            document.getElementById('result-text').innerText = "最終結果：引き分け";
        }
    }, 10);
    document.getElementById('reset-btn').style.display = 'block';
}

function spawnIcons(id) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = '';
    const icons = ['❤️', '⭐', '✨'];
    for (let i = 0; i < 8; i++) {
        const span = document.createElement('span');
        span.className = 'icon-effect';
        span.innerText = icons[Math.floor(Math.random() * icons.length)];
        span.style.left = (Math.random() * 60 + 20) + '%';
        span.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(span);
        setTimeout(() => span.remove(), 1500);
    }
}

function updateUI() {
    document.getElementById('game-info').innerText = `第${round}戦目 (相手残り: ${cpuHandCount}枚)`;
    document.getElementById('score-board').innerText = `あなた: ${wins} | 相手: ${loses}`;
}

function toggleRule() {
    const m = document.getElementById('rule-modal');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

function startConfetti(count) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'confetti';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.backgroundColor = ['#f1c40f','#e67e22','#e74c3c','#3498db'][Math.floor(Math.random()*4)];
        p.style.animationDuration = (Math.random()*1.5+1.5)+'s';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 3000);
    }
}

// 起動時の初期化
window.onload = () => {
    // 画面状態をリセット
    const ts = document.getElementById('title-screen');
    const gm = document.getElementById('game-main-area');
    if(ts) ts.style.display = 'flex';
    if(gm) gm.style.display = 'none';
};
