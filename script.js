let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "🧋";
let aiPlayer = "🍗";
let difficulty = "easy";
let gameActive = false;
let playerTurn = true;
let win = 0, lose = 0, draw = 0, coins = 0;

const cells = [];

const boardDiv = document.getElementById("board");
const statusDiv = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");
const darkToggle = document.getElementById("darkToggle");

function createBoard() {
  boardDiv.innerHTML = "";
  cells.length = 0;
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    boardDiv.appendChild(cell);
    cells.push(cell);
  }
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || !playerTurn || board[index]) return;
  board[index] = currentPlayer;
  updateBoard();
  if (checkWin(currentPlayer)) return endGame("menang");
  if (board.every(cell => cell !== "")) return endGame("seri");
  playerTurn = false;
  setTimeout(() => {
    aiMove();
    updateBoard();
    if (checkWin(aiPlayer)) return endGame("kalah");
    if (board.every(cell => cell !== "")) return endGame("seri");
    playerTurn = true;
    updateStatus();
  }, 400);
}

function updateBoard() {
  board.forEach((val, i) => {
    cells[i].textContent = val;
    cells[i].classList.remove("win");
  });
  updateStatus();
}

function updateStatus() {
  statusDiv.textContent = `Giliran: ${playerTurn ? currentPlayer : aiPlayer}`;
}

function endGame(result) {
  gameActive = false;
  let winCombo = getWinCombo(playerTurn ? currentPlayer : aiPlayer);
  if (winCombo) winCombo.forEach(i => cells[i].classList.add("win"));
  if (result === "menang") {
    statusDiv.textContent = `${currentPlayer} menang! 🎉`;
    win++; coins++;
  } else if (result === "kalah") {
    statusDiv.textContent = `${aiPlayer} menang! 🎉`;
    lose++;
  } else {
    statusDiv.textContent = "Seri!";
    draw++;
  }
  document.getElementById("winCount").textContent = win;
  document.getElementById("loseCount").textContent = lose;
  document.getElementById("drawCount").textContent = draw;
  document.getElementById("coinCount").textContent = coins;
}

function getWinCombo(player) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return combos.find(c => c.every(i => board[i] === player));
}

function checkWin(player) {
  return !!getWinCombo(player);
}

function aiMove() {
  let index;
  const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  if (difficulty === "easy") {
    index = empty[Math.floor(Math.random() * empty.length)];
  } else if (difficulty === "medium") {
    index = findBestMove(aiPlayer, currentPlayer);
  } else {
    index = minimax(board, aiPlayer).index;
  }
  board[index] = aiPlayer;
}

function findBestMove(player, opponent) {
  const winCombo = getWinComboMove(player);
  if (winCombo) return winCombo;
  const block = getWinComboMove(opponent);
  if (block) return block;
  const corners = [0,2,6,8].filter(i => board[i] === "");
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  const center = board[4] === "" ? 4 : null;
  if (center !== null) return center;
  const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getWinComboMove(p) {
  const combos = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let c of combos) {
    const vals = c.map(i => board[i]);
    if (vals.filter(v => v === p).length === 2 && vals.includes("")) {
      return c[vals.indexOf("")];
    }
  }
  return null;
}

function minimax(newBoard, player) {
  const huPlayer = currentPlayer;
  const ai = aiPlayer;
  const avail = newBoard.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  if (checkWinMinimax(huPlayer, newBoard)) return {score: -10};
  if (checkWinMinimax(ai, newBoard)) return {score: 10};
  if (avail.length === 0) return {score: 0};
  let moves = [];
  for (let i of avail) {
    let move = {}; move.index = i;
    newBoard[i] = player;
    let result = minimax(newBoard, player === ai ? huPlayer : ai);
    move.score = result.score;
    newBoard[i] = "";
    moves.push(move);
  }
  return moves.reduce((best, m) =>
    (player === ai && m.score > best.score) || (player === huPlayer && m.score < best.score) ? m : best
  , moves[0]);
}

function checkWinMinimax(p, boardState) {
  return [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ].some(c => c.every(i => boardState[i] === p));
}

function resetGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  playerTurn = true;
  updateStatus();
  createBoard();
}

resetBtn.addEventListener("click", resetGame);
backBtn.addEventListener("click", () => {
  document.getElementById("setup").style.display = "block";
  document.getElementById("game").style.display = "none";
});

document.getElementById("startBtn").addEventListener("click", () => {
  difficulty = document.getElementById("difficulty").value;
  document.getElementById("difficultyDisplay").textContent = `🧠 Tahap AI: ${
    difficulty === 'easy' ? 'Senang' : difficulty === 'medium' ? 'Sederhana' : 'Susah'
  }`;
  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  resetGame();
});

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
});
