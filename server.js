require("dotenv").config();
const express = require("express");
const cors = require("cors");

const proposalsRoutes = require("./routes/proposals.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/proposals", proposalsRoutes);

app.get("/", (req, res) => {
  res.send("DAO Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Connected to DAO at: ${process.env.DAO_ADDRESS}`);
});