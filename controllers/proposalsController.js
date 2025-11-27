const { ethers } = require("ethers");
require("dotenv").config();
const DAO_ABI = require("../abis/DAO.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const daoContract = new ethers.Contract(
  process.env.DAO_ADDRESS,
  DAO_ABI,
  provider
);

const getProposals = async (req, res) => {
  try {

    const mockProposals = [
      { id: 1, description: "Test Proposal 1", executed: false },
      { id: 2, description: "Test Proposal 2", executed: true },
    ];

    res.status(200).json({
      message: "API is working",
      contractAddress: process.env.DAO_ADDRESS,
      data: mockProposals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { getProposals };