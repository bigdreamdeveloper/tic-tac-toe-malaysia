// ✅ script.js untuk Tic Tac Toe Malaysia Edition dengan butang Back & highlight tiles menang

const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const gameDiv = document.getElementById('game');
const setupDiv = document.getElementById('setup');
const darkToggle = document.getElementById('darkToggle');
let backBtn;

let cells = Array(9).fill(null);
let player = "🧋";
let ai = "🍗";
let gameActive = false;
let selectedDifficulty = "easy";
let aiThinking = false;

let win = 0, lose = 0, draw = 0, coin = 0;
const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Load dark mode from localStorage
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

startBtn.addEventListener('click', () => {
  selectedDifficulty = difficultySelect.value;
  setupDiv.style.display = "none";
  gameDiv.style.display = "block";
  addBackButton();
  startGame();
});

function addBackButton() {
  if (!backBtn) {
    backBtn = document.createElement('button');
    backBtn.id = "backBtn";
    backBtn.textContent = "← Tukar AI";
    backBtn.addEventListener('click', () => {
      gameDiv.style.display = "none";
      setupDiv.style.display = "block";
    });
    gameDiv.insertBefore(backBtn, board);
  }
}

function startGame() {
  cells = Array(9).fill(null);
  gameActive = true;
  aiThinking = false;
  statusText.textContent = `Giliran: ${player} (${selectedDifficulty})`;
  renderBoard();
}

resetBtn.addEventListener('click', startGame);

function renderBoard() {
  board.innerHTML = '';
  cells.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = idx;
    cell.textContent = val;
    if (!val && !aiThinking && gameActive) {
      cell.addEventListener('click', () => playerMove(idx));
    }
    board.appendChild(cell);
  });
}

function playerMove(index) {
  if (!gameActive || cells[index] || aiThinking) return;
  cells[index] = player;
  renderBoard();
  if (checkWinner(player)) return endGame(`${player} menang! 🎉`, 'win');
  if (isDraw()) return endGame("Seri!", 'draw');
  statusText.textContent = `Giliran: ${ai}`;
  aiThinking = true;
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
    aiThinking = false;
    if (checkWinner(ai)) return endGame(`${ai} menang! 🤖`, 'lose');
    if (isDraw()) return endGame("Seri!", 'draw');
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
  return winConditions.some(([a, b, c]) => {
    if (customBoard[a] === p && customBoard[b] === p && customBoard[c] === p) {
      highlightWinner([a, b, c]);
      return true;
    }
    return false;
  });
}

function highlightWinner(indices) {
  indices.forEach(i => {
    const cell = board.children[i];
    if (cell) cell.classList.add('highlight');
  });
}

function isDraw() {
  return cells.every(cell => cell !== null);
}

function endGame(message, result) {
  statusText.textContent = message;
  gameActive = false;
  if (result === 'win') win++, coin += 5;
  else if (result === 'lose') lose++;
  else if (result === 'draw') draw++;
  updateScore();
}

function updateScore() {
  const score = document.getElementById("score")
  if (score) {
    score.innerHTML = `🏆 Menang: ${win} | ❌ Kalah: ${lose} | 😐 Seri: ${draw} | 🪙 Coin: ${coin}`;
  }
}
