// ===== CONFIG: BACKEND API BASE URL =====
// Change this to your deployed backend URL when ready
// e.g. const API_BASE = "https://mmrtype-backend.onrender.com";
const API_BASE = "http://localhost:3000";


// ===== leaderboard helpers (backend) =====
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


// ===== AUTH: register, login, update ELO =====
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

  if (!username || !password) {
    authError.textContent = "Please enter a username and password.";
    return;
  }

  let result;
  if (authMode === "login") {
    result = await login(username, password);
  } else {
    result = await register(username, password);
  }

  if (result.error) {
    authError.textContent = result.error;
    return;
  }

  // success
  setCurrentUser(result.username, result.elo);
  authModal.classList.add("hidden");
});
