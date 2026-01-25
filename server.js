require("dotenv").config();
const express = require("express");
const cors = require("cors");
const proposalsRoutes = require("./routes/proposals.js");
const { listenToEvents } = require("./events");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.use("/proposals", proposalsRoutes);

app.get("/", (req, res) => {
  res.send("DAO Backend is live on Render. Web3 Event Listener active.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Connected to DAO at: ${process.env.DAO_ADDRESS}`);

  try {
    listenToEvents();
    console.log("📡 Web3 Event Listener started successfully.");
  } catch (error) {
    console.error("❌ Failed to start Web3 Listener:", error);
  }
});