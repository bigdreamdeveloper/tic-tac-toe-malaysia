// script.js

// Game Elements
let currentPlayer = "P1";
let gameActive = false;
let board = ["", "", "", "", "", "", "", "", ""];

const statusText = document.getElementById("statusText");
const gameContainer = document.getElementById("game");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreP1 = document.getElementById("scoreP1");
const scoreP2 = document.getElementById("scoreP2");
const scoreDraw = document.getElementById("scoreDraw");
const scoreboard = document.getElementById("scoreboard");
const winSound = document.getElementById("winSound");
const drawSound = document.getElementById("drawSound");
const clickSound = document.getElementById("clickSound");

const emojiP1 = document.getElementById("player1Emoji");
const emojiP2 = document.getElementById("player2Emoji");

let scores = { P1: 0, P2: 0, draw: 0 };

function initBoard() {
  gameContainer.innerHTML = "";
  board = ["", "", "", "", "", "", "", "", ""];
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    gameContainer.appendChild(cell);
  }
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || board[index] !== "") return;

  clickSound.play();
  board[index] = currentPlayer;

  const emoji = currentPlayer === "P1" ? emojiP1.value : emojiP2.value;
  e.target.textContent = emoji;

  if (checkWin()) {
    endGame(currentPlayer);
  } else if (board.every(cell => cell !== "")) {
    endGame("draw");
  } else {
    currentPlayer = currentPlayer === "P1" ? "P2" : "P1";
    statusText.textContent = `Giliran ${currentPlayer === "P1" ? "Player 1" : "Player 2"}`;
  }
}

function checkWin() {
  const winCombos = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  return winCombos.some(combo =>
    combo.every(i => board[i] === currentPlayer)
  );
}

function endGame(winner) {
  gameActive = false;

  if (winner === "draw") {
    statusText.textContent = "Seri!";
    drawSound.play();
    scores.draw++;
  } else {
    statusText.textContent = `${winner === "P1" ? "Player 1" : "Player 2"} Menang!`;
    winSound.play();
    scores[winner]++;
  }

  updateScores();
}

function updateScores() {
  scoreP1.textContent = `Player 1: ${scores.P1}`;
  scoreP2.textContent = `Player 2 / AI: ${scores.P2}`;
  scoreDraw.textContent = `Seri: ${scores.draw}`;
}

startBtn.addEventListener("click", () => {
  gameActive = true;
  currentPlayer = "P1";
  statusText.textContent = "Giliran Player 1";
  initBoard();
  gameContainer.classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  scoreboard.classList.remove("hidden");
});

restartBtn.addEventListener("click", () => {
  gameActive = true;
  currentPlayer = "P1";
  statusText.textContent = "Giliran Player 1";
  initBoard();
});
