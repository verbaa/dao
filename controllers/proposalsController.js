const { inMemoryProposals } = require("../store");

const getProposals = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
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

const getProposalById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const proposal = inMemoryProposals.find((p) => p.id === id);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found"
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = { getProposals, getProposalById };