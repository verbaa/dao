const express = require("express");
const router = express.Router();

const { getProposals, getProposalById } = require("../controllers/proposalsController");

router.get("/", getProposals);

router.get("/:id", getProposalById);

module.exports = router;