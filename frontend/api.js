const API_URL = "http://localhost:3000";

export async function getLeaderboard() {
  const res = await fetch(`${API_URL}/api/leaderboard`);
  return res.json();
}

export async function register(username, password) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function updateElo(username, elo) {
  const res = await fetch(`${API_URL}/api/update-elo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, elo })
  });
  return res.json();
}
