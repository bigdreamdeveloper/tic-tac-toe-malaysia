// script.js for Tic Tac Teh Tarik 🇲🇾

const board = document.getElementById('board');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('startBtn');
const gameDiv = document.getElementById('game');
const setupDiv = document.getElementById('setup');
const darkToggle = document.getElementById('darkToggle');

let cells = Array(9).fill(null);
let player = "🧋";
let ai = "🍗";
let gameActive = false;
let selectedDifficulty = "easy";

let winCount = 0;
let loseCount = 0;
let drawCount = 0;
let coins = 0;

const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

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
  statusText.textContent = `Giliran: ${player} (AI: ${selectedDifficulty.toUpperCase()})`;
  startGame();
});

function startGame() {
  cells = Array(9).fill(null);
  gameActive = true;
  statusText.textContent = `Giliran: ${player} (AI: ${selectedDifficulty.toUpperCase()})`;
  renderBoard();
}

resetBtn.addEventListener('click', startGame);

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

  if (checkWinner(player)) return endGame(`${player} menang! 🎉`, 'win');
  if (isDraw()) return endGame("Seri!", 'draw');

  statusText.textContent = `Giliran: ${ai}`;
  gameActive = false; // Disable sementara AI fikir
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

    if (checkWinner(ai)) return endGame(`${ai} menang! 🤖`, 'lose');
    if (isDraw()) return endGame("Seri!", 'draw');

    statusText.textContent = `Giliran: ${player}`;
    gameActive = true; // Boleh main balik
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
  return winConditions.some(([a, b, c]) => customBoard[a] === p && customBoard[b] === p && customBoard[c] === p);
}

function isDraw() {
  return cells.every(cell => cell !== null);
}

function endGame(message, result) {
  statusText.textContent = message;
  gameActive = false;
  if (result === 'win') {
    winCount++;
    coins += 10;
  } else if (result === 'lose') {
    loseCount++;
  } else if (result === 'draw') {
    drawCount++;
    coins += 2;
  }
  updateScoreboard();
}

function updateScoreboard() {
  let board = document.getElementById('scoreboard');
  if (!board) {
    board = document.createElement('div');
    board.id = 'scoreboard';
    board.className = 'scoreboard';
    document.querySelector('.game-container').appendChild(board);
  }
  board.innerHTML = `
    <h3>📊 Skor</h3>
    <p>🏆 Menang: ${winCount}</p>
    <p>💀 Kalah: ${loseCount}</p>
    <p>🤝 Seri: ${drawCount}</p>
    <p>🪙 Coin: ${coins}</p>
  `;
}
