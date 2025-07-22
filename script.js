// script.js

// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3ANamHTn1bHchmUhIvea3bwdkvEm9hZU",
  authDomain: "tictactehtarik.firebaseapp.com",
  projectId: "tictactehtarik",
  storageBucket: "tictactehtarik.firebasestorage.app",
  messagingSenderId: "1058843651428",
  appId: "1:1058843651428:web:139549568a03e202ed9e71",
  measurementId: "G-7DZR27JN3P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Game Logic
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
const leaderList = document.getElementById("leaderList");

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
  e.target.textContent = currentPlayer === "P1" ? "🍛" : "🫖";
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
  saveScoreToFirestore(winner);
  loadLeaderboard();
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
  document.getElementById("game").classList.remove("hidden");
  restartBtn.classList.remove("hidden");
  scoreboard.classList.remove("hidden");
  loadLeaderboard();
});

restartBtn.addEventListener("click", () => {
  gameActive = true;
  currentPlayer = "P1";
  statusText.textContent = "Giliran Player 1";
  initBoard();
});

async function saveScoreToFirestore(winner) {
  try {
    await addDoc(collection(db, "scores"), {
      winner: winner,
      timestamp: new Date()
    });
    console.log("Score saved to Firestore.");
  } catch (e) {
    console.error("Error saving score:", e);
  }
}

async function loadLeaderboard() {
  try {
    const q = query(collection(db, "scores"), orderBy("timestamp", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    leaderList.innerHTML = "";
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `🏅 ${data.winner.toUpperCase()} - ${new Date(data.timestamp.toDate()).toLocaleString()}`;
      leaderList.appendChild(li);
    });
  } catch (e) {
    console.error("Error loading leaderboard:", e);
  }
}
