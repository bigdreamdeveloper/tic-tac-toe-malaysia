// --- Global Variables ---
const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const gameDiv = document.getElementById('game');
const setupDiv = document.getElementById('setup');
const darkToggle = document.getElementById('darkToggle');
const difficultyLabel = document.getElementById('difficultyLabel');
const backBtn = document.getElementById('backBtn');
const scoreboard = document.getElementById('scoreboard');

let cells = Array(9).fill(null);
let player = "🧋";
let ai = "🍗";
let gameActive = false;
let selectedDifficulty = "easy";
let playerTurn = true;
let score = {
  win: 0,
  lose: 0,
  draw: 0,
  coin: 0
};

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// --- Theme ---
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

// --- Start Game ---
startBtn.addEventListener('click', () => {
  selectedDifficulty = difficultySelect.value;
  setupDiv.style.display = "none";
  gameDiv.style.display = "block";
  difficultyLabel.textContent = `🧠 Tahap AI: ${difficultySelect.options[difficultySelect.selectedIndex].text}`;
  startGame();
});

backBtn.addEventListener('click', () => {
  gameDiv.style.display = "none";
  setupDiv.style.display = "block";
});

resetBtn.addEventListener('click', startGame);

function startGame() {
  cells = Array(9).fill(null);
  gameActive = true;
  playerTurn = true;
  statusText.textContent = `Giliran: ${player}`;
  renderBoard();
}

function renderBoard() {
  board.innerHTML = '';
  cells.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.textContent = val;
    if (!val && gameActive && playerTurn) {
      cell.addEventListener('click', () => playerMove(idx));
    }
    board.appendChild(cell);
  });
}

function playerMove(index) {
  if (!gameActive || cells[index] || !playerTurn) return;
  cells[index] = player;
  playerTurn = false;
  renderBoard();
  if (checkWinner(player)) {
    endGame(`${player} menang! 🎉`, 'win');
    return;
  }
  if (isDraw()) {
    endGame("Seri!", 'draw');
    return;
  }
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
    if (checkWinner(ai)) {
      endGame(`${ai} menang! 🤖`, 'lose');
      return;
    }
    if (isDraw()) {
      endGame("Seri!", 'draw');
      return;
    }
    playerTurn = true;
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
      if (customBoard === cells) {
        document.querySelectorAll('.cell')[a].classList.add('win');
        document.querySelectorAll('.cell')[b].classList.add('win');
        document.querySelectorAll('.cell')[c].classList.add('win');
      }
      return true;
    }
    return false;
  });
}

function isDraw() {
  return cells.every(cell => cell !== null);
}

function endGame(message, result) {
  statusText.textContent = message;
  gameActive = false;
  if (result === 'win') {
    score.win++;
    score.coin += 5;
  } else if (result === 'lose') {
    score.lose++;
  } else if (result === 'draw') {
    score.draw++;
  }
  updateScoreboard();
}

function updateScoreboard() {
  scoreboard.innerHTML = `🏆 Menang: ${score.win} | ❌ Kalah: ${score.lose} | 😐 Seri: ${score.draw} | 🪙 Coin: ${score.coin}`;
}
