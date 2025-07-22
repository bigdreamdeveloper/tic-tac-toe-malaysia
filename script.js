// Elemen DOM
const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const gameDiv = document.getElementById('game');
const setupDiv = document.getElementById('setup');
const darkToggle = document.getElementById('darkToggle');

const winCountEl = document.getElementById('winCount');
const loseCountEl = document.getElementById('loseCount');
const drawCountEl = document.getElementById('drawCount');
const coinCountEl = document.getElementById('coinCount');

// State
let cells = Array(9).fill(null);
let player = "🧋";
let ai = "🍗";
let gameActive = false;
let selectedDifficulty = "easy";

// Skor dari localStorage
let score = {
  win: parseInt(localStorage.getItem('win') || 0),
  lose: parseInt(localStorage.getItem('lose') || 0),
  draw: parseInt(localStorage.getItem('draw') || 0),
  coin: parseInt(localStorage.getItem('coin') || 0),
};

// Fungsi update UI skor
function updateScoreDisplay() {
  winCountEl.textContent = score.win;
  loseCountEl.textContent = score.lose;
  drawCountEl.textContent = score.draw;
  coinCountEl.textContent = score.coin;
}

// Simpan skor
function saveScore() {
  for (const key in score) {
    localStorage.setItem(key, score[key]);
  }
}

// Dark Mode
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}

darkToggle.addEventListener('change', () => {
  if (darkToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  }
});

// Mula game
startBtn.addEventListener('click', () => {
  selectedDifficulty = difficultySelect.value;
  setupDiv.style.display = "none";
  gameDiv.style.display = "block";
  updateScoreDisplay();
  startGame();
});

// Reset papan
resetBtn.addEventListener('click', startGame);

function startGame() {
  cells = Array(9).fill(null);
  gameActive = true;
  statusText.textContent = `Giliran: ${player}`;
  renderBoard();
}

function renderBoard() {
  board.innerHTML = '';
  cells.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.textContent = val;
    cell.addEventListener('click', () => playerMove(idx));
    board.appendChild(cell);
  });
}

function playerMove(index) {
  if (!gameActive || cells[index]) return;
  cells[index] = player;
  renderBoard();
  if (checkWinner(player)) return endGame(`${player} menang! 🎉`);
  if (isDraw()) return endGame("Seri!");
  statusText.textContent = `Giliran: ${ai}`;
  setTimeout(botMove, 500);
}

function botMove() {
  let move;
  if (selectedDifficulty === "easy") {
    move = getRandomMove();
  } else if (selectedDifficulty === "medium") {
    move = Math.random() < 0.5 ? getRandomMove() : getBestMove();
  } else {
    move = getBestMove();
  }

  if (move !== null) {
    cells[move] = ai;
    renderBoard();
    if (checkWinner(ai)) return endGame(`${ai} menang! 🤖`);
    if (isDraw()) return endGame("Seri!");
    statusText.textContent = `Giliran: ${player}`;
  }
}

function getRandomMove() {
  const empty = cells.map((val, i) => val === null ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getBestMove() {
  let bestScore = -Infinity;
  let move = null;
  for (let i = 0; i < 9; i++) {
    if (!cells[i]) {
      cells[i] = ai;
      let score = minimax(cells, 0, false);
      cells[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(boardState, depth, isMax) {
  if (checkWinner(ai, boardState)) return 10 - depth;
  if (checkWinner(player, boardState)) return depth - 10;
  if (!boardState.includes(null)) return 0;

  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!boardState[i]) {
      boardState[i] = isMax ? ai : player;
      let score = minimax(boardState, depth + 1, !isMax);
      boardState[i] = null;
      best = isMax ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

function checkWinner(p, customBoard = cells) {
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ].some(([a, b, c]) => customBoard[a] === p && customBoard[b] === p && customBoard[c] === p);
}

function isDraw() {
  return cells.every(cell => cell !== null);
}

function endGame(message) {
  statusText.textContent = message;
  gameActive = false;

  if (message.includes(player)) {
    score.win++;
    score.coin += 5;
    confetti({ spread: 100, particleCount: 120, origin: { y: 0.6 } });
  } else if (message.includes(ai)) {
    score.lose++;
  } else {
    score.draw++;
  }

  saveScore();
  updateScoreDisplay();
}

// ✅ Papar skor semasa masa load
updateScoreDisplay();
