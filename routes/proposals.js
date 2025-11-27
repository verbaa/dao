const express = require("express");
const router = express.Router();

const { getProposals } = require("../controllers/proposalsController");

router.get("/", getProposals);

module.exports = router;