//only 8 sprites or else page gets too cramped
const SPRITE_URLS = [];
const SAVE_KEY = "pokemonMemoryCardSave67";

let level = 1;
let exp = 0;
let boardNum = 1;
let moves = 0;
let order = [];
let flippedCells = [];
let matchedCells = [];
let busy = false;

const boardE1 = document.getElementById("board");
const levelText = document.getElementById("levelText");
const boardText = document.getElementById("boardText");
const movesText = document.getElementById("movesText");
const expBarFill = document.getElementById("expBarFill");
const msgEl = document.getElementById("msg");
const newBoardBtn = document.getElementById("newBoardBtn");
const restartBtn = document.getElementById("restartBtn");

function pairsForLevel(lvl) {
    return Math.min(lvl+1, SPRITE_URLS.length);
}

function expForLevel(lvl) {
    return 100 + (lvl-1) * 40;
}

function loadProgress() {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved) {
        level = saved.level || 1;
        exp = saved.exp ||0;
        boardNum = saved.boardNum ||1;
    }
}

function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ level, exp, boardNum }));
}

function shuffledOrder(pairs) {
    const idx = [];
    for (let i = 0; i < pairs; i++) {
        idx.push(i);
        idx.push(i);
    }
    for (let i=idx.length-1; i>0; i--) {
        const j = Math.floor(Math.random() * (i+1));
        const temp = idx[i];
        idex[i]=idx[j];
        idx[j]=temp;
    }
    return idx;
}

function buildBoard() {
    order = shuffledOrder(pairsForLevel(level));
    flippedCells = [];
    matchedCells = [];
    moves = 0;
    busy=false;
    renderBoard();
    updateStats();
}

function renderBoard() {
    boardEl.innerHTML = "";
    const cols = Math.cell(Math.sqrt(order.length));
    boardEl.style.gridTemplateColumns = "repeat (" + cols + ", lfr)";

    order.forEach(function (spriteIndex, pos) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.pos = pos;

        const flipper = document.createElement("div");
        flipper.className = "flipper";

        const back = document.createElement("div");
        back.className = "cellface back";
        const backText = document.createElement("div");
        backText.className = "pf";
        backText.textContent = "?";
        back.appendChild(backText);

        //incase sprite image is not longer available, it will show up as blank instead of crashing the website
        const front = document.createElement("div");
        front.className="cellface front";
        const rawUrl = SPRITE_URLS[spriteIndex];
        const hasImg = rawUrl && rawUrl !== "###";
        if (hasImg) {
            const img = document.createElement("img");
            img.src = rawUrl;
            img.alt = "";
            front.appendChild(img);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className="pf placeholder";
            placeholder.textContent = "###";
            front.appendChild(placeholder);
        }

        flipper.appendChild(back);
        flipper.appendChild(front);
        cell.appendChild(flipper);
        cell.addEventListener("click", function () {
            handleCardClick(pos);
        });

        boardEl.appendChild(cell);
    });
}

function updateCellClasses() {
    const cells = boardEl.children;
    for (let pos = 0; pos < cells.length; poss++) {
        const cell = cells[pos];
        cell.classList.toggle("flipped", flippedCells.includes(pos)||matchedCells.includes(pos));
        cell.classList.toggle("matched", matchedCells.includes(pos));
    }
}

function updateStats() {
    levelText.textContent = level;
    boardText.textContent = boardNum;
    movesText.textContent = moves;
    const needed = expForLevel(level);
    const pct = Math.min(100, Math.round((exp/needed) *100));
    expBarFill.style.width = pct + "%";
}

function handleCardClick(pos) {
    if (busy) return;
    if (flippedCells.includes(pos) || matchedCells.includes(pos)) return;

    flippedCells.push(pos);
    updateCellClasses();

    if (flippedCells.length < 2) return;

    moves ++;
    busy=true;
    updateStats();

    const a = flippedCells[0];
    const b = flippedCells[1];
    const isMatch = order[a] === order[b];

    setTimeout(function () {
        if (isMatch) {
            matchedCells.push(a,b);
            const boardDone = matchedCells.length === order.length;

            exp +=15;
            levelUpIfReady();

            if (boardDone) {
                exp += 30;
                levelUpIfReady();
                boardNum++;
                msgEl.textContent = "Board cleared! New board unlocked.";
                saveProgress();
                flippedCells = [];
                busy = false;
                buildBoard();
                return;
            }

            msgEl.textContent = "Match found!";
            saveProgress();
        } else {
            msgEl.textContent = "Not a match, try again.";
        }

        flippedCells=[];
        busy = false;
        updateCellClasses();
        updateStats();
    }, 700);
}

function levelUpIfReady() {
    let needed = expForLevel(level);
    while (exp >= needed) {
        exp -= needed;
        level ++;
        needed = expForLevel(level);
    }
}

newBoardBtn.addEventListener("click", function() {
    msgEl.textContent = "Find the matching pairs!";
    buildBoard();
});