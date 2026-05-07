let playerHand = [], round = 1, wins = 0, loses = 0, cpuHandCount = 5;
const ranks = ['S', 'A', 'B', 'C', 'D', 'E'];
const getImgPath = (type) => `images/${type}.png`; 
const normalSE = new Audio('images/se.mp3');
const shakinSE = new Audio('images/shakin.mp3');

// --- 追加：タイトル画面からゲームを開始する関数 ---
function startGame() {
    document.getElementById('title-screen').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('game-main-area').style.display = 'block';
        initGame();
        // スマホの音声制限解除のため、空の音を一度鳴らす
        normalSE.play().catch(() => {}); 
    }, 500);
}

// 効果音の自作生成（予備）
function playCardSound() {
    normalSE.currentTime = 0;
    normalSE.play().catch(() => {});
}

function initGame() {
    round = 1; wins = 0; loses = 0; cpuHandCount = 5;
    playerHand = Array.from({length: 5}, () => getRandomRank());
    
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

    const msgEl = document.getElementById('special-msg');
    msgEl.innerText = ''; msgEl.className = 'special-msg';

    renderHand();
    updateUI();
}

// 判定ロジック・演出などはこれまでのものを継続
function getRandomRank() {
    const r = Math.random();
    return r < 0.05 ? 'S' : ['A','B','C','D','E'][Math.floor(Math.random()*5)];
}

function renderHand() {
    const container = document.getElementById('player-hand');
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const type = playerHand[i];
        const card = document.createElement('div');
        card.className = 'card';
        if (type) {
            card.setAttribute('data-type', type);
            card.innerHTML = `<img src="${getImgPath(type)}" onerror="this.style.display='none'">`;
            card.onclick = () => playRound(i);
        } else { card.style.visibility = 'hidden'; }
        container.appendChild(card);
    }
}

function playRound(index) {
    if (round > 3 || !playerHand[index]) return;
    const pHand = playerHand[index];
    const cHand = getRandomRank();

    if (pHand === 'S') { shakinSE.currentTime = 0; shakinSE.play().catch(() => {}); }
    else { playCardSound(); }

    cpuHandCount--;
    setSlot('player-pushed', pHand);
    setSlot('cpu-pushed', cHand);

    const msgEl = document.getElementById('special-msg');
    msgEl.innerText = ''; msgEl.className = 'special-msg';

    setTimeout(() => {
        if (pHand === 'S') {
            msgEl.innerText = "神 降 臨";
            msgEl.classList.add('s-arrival-text');
            startConfetti(30);
            setTimeout(() => { msgEl.innerText = ''; }, 2000);
        }
        if (pHand === 'E' && cHand === 'A') {
            msgEl.innerText = "下 克 上";
            msgEl.classList.add('gekokujo-text');
            setTimeout(() => { msgEl.innerText = ''; }, 1500);
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
    slot.className = 'card'; slot.setAttribute('data-type', type);
    slot.innerHTML = `<img src="${getImgPath(type)}" onerror="this.style.display='none'">`;
}

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
        }
    }, 10);
    document.getElementById('reset-btn').style.display = 'block';
}

function spawnIcons(id) {
    const container = document.getElementById(id); container.innerHTML = '';
    const icons = ['❤️', '⭐', '✨'];
    for (let i = 0; i < 8; i++) {
        const span = document.createElement('span'); span.className = 'icon-effect';
        span.innerText = icons[Math.floor(Math.random() * icons.length)];
        span.style.left = (Math.random() * 60 + 20) + '%';
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
        const p = document.createElement('div'); p.className = 'confetti';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.backgroundColor = ['#f1c40f','#e67e22','#e74c3c','#3498db'][Math.floor(Math.random()*4)];
        p.style.animationDuration = (Math.random()*1.5+1.5)+'s';
        document.body.appendChild(p); setTimeout(() => p.remove(), 3000);
    }
}

// 起動時は initGame を呼ばず、startGameを待つ
window.onload = () => {
    // 最初の画面状態を整えるだけ
};
