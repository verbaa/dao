const { inMemoryProposals } = require("../store");

const getProposals = async (req, res) => {
  try {
    res.status(200).json({
      message: "Proposals fetched successfully",
      contractAddress: process.env.DAO_ADDRESS,
      count: inMemoryProposals.length,
      data: inMemoryProposals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { getProposals };