const { ethers } = require("ethers");
const DAO_ABI = require("../abis/DAO.json");
const { inMemoryProposals } = require("../store");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const daoContract = new ethers.Contract(
  process.env.DAO_ADDRESS,
  DAO_ABI,
  provider
);

let lastProcessedBlock = 0;
const POLLING_INTERVAL = 5000;

const listenToEvents = async () => {
  console.log("Start event");

  try {
    lastProcessedBlock = await provider.getBlockNumber();
    console.log(`Initialized. Last processed block: ${lastProcessedBlock}`);

    setInterval(pollForEvents, POLLING_INTERVAL);
  } catch (error) {
    console.error("Error:", error);
  }
};

const pollForEvents = async () => {
  try {
    const currentBlock = await provider.getBlockNumber();

    const fromBlock = lastProcessedBlock + 1;
    const toBlock = currentBlock;

    if (fromBlock > toBlock) {
      return;
    }

    console.log(`Scanning blocks: ${fromBlock} -> ${toBlock}`);

    const [createdEvents, votedEvents, executedEvents] = await Promise.all([
      daoContract.queryFilter("ProposalCreated", fromBlock, toBlock),
      daoContract.queryFilter("Voted", fromBlock, toBlock),
      daoContract.queryFilter("ProposalExecuted", fromBlock, toBlock),
    ]);

    for (const event of createdEvents) {
      handleProposalCreated(event);
    }

    for (const event of votedEvents) {
      handleVoted(event);
    }

    for (const event of executedEvents) {
      handleProposalExecuted(event);
    }

    lastProcessedBlock = toBlock;

  } catch (error) {
    console.error("Error during polling:", error.message);
  }
};


const handleProposalCreated = (event) => {
  const { args } = event;
  const id = Number(args[0]);
  const creator = args[1];
  const description = args[2];

  console.log(`[EVENT] ProposalCreated: ID: ${id}, Desc: ${description}`);

  if (!inMemoryProposals.find((p) => p.id === id)) {
    inMemoryProposals.push({
      id: id,
      description: description,
      creator: creator,
      executed: false,
      voteCount: 0,
      status: "Active",
    });
  }
};

const handleVoted = (event) => {
  const { args } = event;
  const id = Number(args[0]);
  const voter = args[1];
  const support = args[2];

  console.log(`[EVENT] Voted: ID: ${id}, Voter: ${voter}, Support: ${support}`);

  const proposal = inMemoryProposals.find((p) => p.id === id);
  if (proposal) {
    proposal.voteCount += 1;
  }
};

const handleProposalExecuted = (event) => {
  const { args } = event;
  const id = Number(args[0]);
  const executor = args[1];

  console.log(`[EVENT] ProposalExecuted: ID: ${id}, Executor: ${executor}`);

  const proposal = inMemoryProposals.find((p) => p.id === id);
  if (proposal) {
    proposal.executed = true;
    proposal.status = "Executed";
  }
};

module.exports = { listenToEvents };