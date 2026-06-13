require("dotenv").config(); // <-- REQUIRED so MONGO_URI loads

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// ===== User Schema =====
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  passwordHash: String,
  elo: { type: Number, default: 1000 }
});

const User = mongoose.model("User", UserSchema);

// ===== Signup =====
app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.json({ error: "Username already taken" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = new User({ username, passwordHash, elo: 1000 });
  await user.save();

  res.json({ success: true });
});

// ===== Login =====
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "Invalid username or password" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.json({ error: "Invalid username or password" });

  res.json({
    success: true,
    username: user.username,
    elo: user.elo
  });
});

// ===== Update ELO =====
app.post("/api/updateElo", async (req, res) => {
  const { username, newElo } = req.body;

  await User.updateOne({ username }, { elo: newElo });

  res.json({ success: true });
});

// ===== Leaderboard =====
app.get("/api/leaderboard", async (req, res) => {
  const top = await User.find({})
    .sort({ elo: -1 })
    .limit(100);

  res.json(top);
});

// ===== Start Server =====
app.listen(3000, () => console.log("Backend running on port 3000"));
