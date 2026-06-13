// ===== CONFIG: BACKEND API BASE URL =====
const API_BASE = "https://mmrtype.onrender.com";

// ===== DOM ELEMENTS =====
const authSubmit = document.getElementById("auth-submit");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authConfirm = document.getElementById("auth-confirm");
const authError = document.getElementById("auth-error");
const authModal = document.getElementById("auth-modal");
const authSwitch = document.getElementById("auth-switch");
const authTitle = document.getElementById("auth-title");

const homeScreen = document.getElementById("home-screen");
const gameScreen = document.getElementById("game-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");

const leaderboardBtn = document.getElementById("leaderboard-btn");
const leaderboardBtn2 = document.getElementById("leaderboard-btn-2");
const leaderboardBackBtn = document.getElementById("leaderboard-back-btn");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardSearch = document.getElementById("leaderboard-search");

const accountBtn = document.getElementById("account-btn");
const accountBtn2 = document.getElementById("account-btn-2");

const standardBtn = document.getElementById("standard-btn");
const backHomeBtn = document.getElementById("back-home-btn");

const liveWpm = document.getElementById("live-wpm");
const liveAcc = document.getElementById("live-acc");

const wordsContainer = document.getElementById("words-container");
const inputBar = document.getElementById("input-bar");

const resultsModal = document.getElementById("results-modal");
const modalPlace = document.getElementById("modal-place");
const modalEloDelta = document.getElementById("modal-elo-delta");
const modalWpm = document.getElementById("modal-wpm");
const modalAcc = document.getElementById("modal-acc");
const modalRaw = document.getElementById("modal-raw");
const modalTime = document.getElementById("modal-time");
const restartBtn = document.getElementById("restart-btn");

let authMode = "login"; // "login" or "register"
let currentUser = null;

// ===== USER SESSION =====
function setCurrentUser(username, elo) {
  currentUser = { username, elo };
  localStorage.setItem("user", JSON.stringify(currentUser));
}

function getCurrentUser() {
  const data = localStorage.getItem("user");
  if (!data) return null;
  try {
    currentUser = JSON.parse(data);
    return currentUser;
  } catch {
    return null;
  }
}

// ===== BACKEND HELPERS =====
async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/api/leaderboard`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Leaderboard fetch failed", e);
    return [];
  }
}

async function register(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (e) {
    console.error("Register failed", e);
    return { error: "Network error" };
  }
}

async function login(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (e) {
    console.error("Login failed", e);
    return { error: "Network error" };
  }
}

async function updateElo(username, elo) {
  try {
    const res = await fetch(`${API_BASE}/api/update-elo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, elo })
    });
    return await res.json();
  } catch (e) {
    console.error("ELO update failed", e);
    return { error: "Network error" };
  }
}

// ===== AUTH MODAL HANDLER =====
authSubmit.addEventListener("click", async () => {
  const username = authUsername.value.trim();
  const password = authPassword.value.trim();
  const confirm = authConfirm.value.trim();

  authError.textContent = "";

  if (!username || !password) {
    authError.textContent = "Please enter a username and password.";
    return;
  }

  let result;
  if (authMode === "login") {
    result = await login(username, password);
  } else {
    if (!confirm || confirm !== password) {
      authError.textContent = "Passwords do not match.";
      return;
    }
    result = await register(username, password);
  }

  if (result.error) {
    authError.textContent = result.error;
    return;
  }

  setCurrentUser(result.username, result.elo);
  authModal.classList.add("hidden");
});

authSwitch.addEventListener("click", () => {
  if (authMode === "login") {
    authMode = "register";
    authTitle.textContent = "Create Account";
    authSwitch.textContent = "Already have an account? Sign in";
    authConfirm.classList.remove("hidden");
  } else {
    authMode = "login";
    authTitle.textContent = "Sign In";
    authSwitch.textContent = "Don't have an account? Create one";
    authConfirm.classList.add("hidden");
  }
});

// ===== NAVIGATION =====
function showHome() {
  homeScreen.classList.remove("hidden");
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.add("hidden");
}

function showGame() {
  homeScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  leaderboardScreen.classList.add("hidden");
  startStandardGame();
}

function showLeaderboard() {
  homeScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  loadLeaderboard();
}

leaderboardBtn.addEventListener("click", showLeaderboard);
leaderboardBtn2.addEventListener("click", showLeaderboard);
leaderboardBackBtn.addEventListener("click", showHome);

accountBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
});
accountBtn2.addEventListener("click", () => {
  authModal.classList.remove("hidden");
});

standardBtn.addEventListener("click", showGame);
backHomeBtn.addEventListener("click", showHome);

// ===== LEADERBOARD RENDERING =====
async function loadLeaderboard() {
  const data = await fetchLeaderboard();
  leaderboardBody.innerHTML = "";

  data.slice(0, 100).forEach((player, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";
    row.innerHTML = `
      <span>${index + 1}</span>
      <span>${player.username}</span>
      <span>${player.elo}</span>
      <span>${player.tier || "-"}</span>
    `;
    leaderboardBody.appendChild(row);
  });
}

leaderboardSearch.addEventListener("input", () => {
  const term = leaderboardSearch.value.toLowerCase();
  const rows = leaderboardBody.querySelectorAll(".leaderboard-row");
  rows.forEach(row => {
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(term) ? "" : "none";
  });
});

// ===== SIMPLE STANDARD GAME LOGIC (SINGLE PLAYER) =====
const sampleText =
  "fact house out just end few develop would of long you before do very after.";

let startTime = null;
let typedChars = 0;
let correctChars = 0;
let finished = false;

function resetGame() {
  wordsContainer.textContent = sampleText;
  inputBar.value = "";
  startTime = null;
  typedChars = 0;
  correctChars = 0;
  finished = false;
  liveWpm.textContent = "0";
  liveAcc.textContent = "100";
}

function startStandardGame() {
  resetGame();
  inputBar.focus();
}

inputBar.addEventListener("input", () => {
  if (finished) return;

  const value = inputBar.value;
  if (!startTime && value.length > 0) {
    startTime = performance.now();
  }

  typedChars = value.length;
  correctChars = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === sampleText[i]) correctChars++;
  }

  const now = performance.now();
  const seconds = (now - startTime) / 1000 || 1;
  const wpm = (correctChars / 5) / (seconds / 60);
  const acc = typedChars === 0 ? 100 : (correctChars / typedChars) * 100;

  liveWpm.textContent = wpm.toFixed(0);
  liveAcc.textContent = acc.toFixed(0);

  if (value === sampleText) {
    finished = true;
    endGame(wpm, acc, seconds);
  }
});

function endGame(wpm, acc, seconds) {
  const raw = (typedChars / 5) / (seconds / 60);

  modalPlace.textContent = "1st";
  modalEloDelta.textContent = "+0";
  modalWpm.textContent = wpm.toFixed(2);
  modalAcc.textContent = acc.toFixed(2) + "%";
  modalRaw.textContent = raw.toFixed(2);
  modalTime.textContent = seconds.toFixed(2) + "s";

  resultsModal.classList.remove("hidden");

  const user = getCurrentUser();
  if (user) {
    // simple example: bump elo by 5 for finishing
    const newElo = (user.elo || 1000) + 5;
    updateElo(user.username, newElo).then(res => {
      if (!res.error) {
        setCurrentUser(res.username, res.elo);
        modalEloDelta.textContent = `+${res.elo - user.elo}`;
      }
    });
  }
}

restartBtn.addEventListener("click", () => {
  resultsModal.classList.add("hidden");
  startStandardGame();
});

// ===== INIT =====
window.addEventListener("load", () => {
  getCurrentUser();
  showHome();
});
