require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["https://mmrtype.com", "http://localhost:5173", "http://localhost:3000"],
    credentials: false
  })
);

mongoose
  .connect(process.env.MONGO_URI, { dbName: "mmrtype" })
  .then(() => console.log("Mongo connected"))
  .catch(err => console.error("Mongo error", err));

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // for demo only; in real life hash this
  elo: { type: Number, default: 1000 }
});

const User = mongoose.model("User", userSchema);

// REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ error: "Missing username or password" });

    const existing = await User.findOne({ username });
    if (existing) return res.json({ error: "Username already taken" });

    const user = await User.create({ username, password, elo: 1000 });
    res.json({ username: user.username, elo: user.elo });
  } catch (e) {
    console.error(e);
    res.json({ error: "Server error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.json({ error: "Missing username or password" });

    const user = await User.findOne({ username });
    if (!user || user.password !== password)
      return res.json({ error: "Invalid credentials" });

    res.json({ username: user.username, elo: user.elo });
  } catch (e) {
    console.error(e);
    res.json({ error: "Server error" });
  }
});

// UPDATE ELO
app.post("/api/update-elo", async (req, res) => {
  try {
    const { username, elo } = req.body;
    if (!username || typeof elo !== "number")
      return res.json({ error: "Invalid payload" });

    const user = await User.findOneAndUpdate(
      { username },
      { $set: { elo } },
      { new: true }
    );
    if (!user) return res.json({ error: "User not found" });

    res.json({ username: user.username, elo: user.elo });
  } catch (e) {
    console.error(e);
    res.json({ error: "Server error" });
  }
});

// LEADERBOARD
app.get("/api/leaderboard", async (_req, res) => {
  try {
    const users = await User.find().sort({ elo: -1 }).limit(100);
    const withTier = users.map(u => ({
      username: u.username,
      elo: u.elo,
      tier:
        u.elo >= 2000
          ? "Grandmaster"
          : u.elo >= 1700
          ? "Master"
          : u.elo >= 1400
          ? "Diamond"
          : u.elo >= 1100
          ? "Gold"
          : "Bronze"
    }));
    res.json(withTier);
  } catch (e) {
    console.error(e);
    res.json([]);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
