const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { inMemoryProposals } = require("../store");
require("dotenv").config();

const abiPath = path.join(__dirname, "../abis/DAO.json");
const DAO_ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const daoContract = new ethers.Contract(
  process.env.DAO_ADDRESS,
  DAO_ABI,
  provider
);

const DEPLOYMENT_BLOCK = 2298791
;

let lastProcessedBlock = 0;
const POLLING_INTERVAL = 5000;

const listenToEvents = async () => {
  console.log("🔄 Starting Event Listener...");

  try {
    const currentBlock = await provider.getBlockNumber();
    console.log(`Current Blockchain Height: ${currentBlock}`);

    if (lastProcessedBlock === 0) {
      lastProcessedBlock = DEPLOYMENT_BLOCK;
    }

    console.log(`📜 Syncing history from block ${lastProcessedBlock} to ${currentBlock}...`);

    await fetchEventsRange(lastProcessedBlock, currentBlock);

    lastProcessedBlock = currentBlock;
    console.log("✅ History synced. Switching to live polling...");

    setInterval(pollForEvents, POLLING_INTERVAL);

  } catch (error) {
    console.error("Initialization Error:", error);
  }
};

const fetchEventsRange = async (fromBlock, toBlock) => {
  if (fromBlock > toBlock) return;

  try {
    // Виконуємо запити по черзі, щоб не створювати Batch
    const createdEvents = await daoContract.queryFilter("ProposalCreated", fromBlock, toBlock);
    const votedEvents = await daoContract.queryFilter("Voted", fromBlock, toBlock);
    const executedEvents = await daoContract.queryFilter("ProposalExecuted", fromBlock, toBlock);

    for (const event of createdEvents) handleProposalCreated(event);
    for (const event of votedEvents) handleVoted(event);
    for (const event of executedEvents) handleProposalExecuted(event);

  } catch (error) {
    console.error("⚠️ Error fetching events:", error.message);
  }
};

const pollForEvents = async () => {
  try {
    const currentBlock = await provider.getBlockNumber();

    if (currentBlock <= lastProcessedBlock) {
      return;
    }

    await fetchEventsRange(lastProcessedBlock + 1, currentBlock);

    lastProcessedBlock = currentBlock;

  } catch (error) {
    console.error("Error during polling:", error.message);
  }
};


const handleProposalCreated = (event) => {
  const { args } = event;
  const id = Number(args[0]);
  const creator = args[1];
  const description = args[2];

  let deadline = 0;
  if (args[3]) {
    deadline = Number(args[3]);
  }

  console.log(`[EVENT] ProposalCreated: ID: ${id}, Desc: ${description}`);

  if (!inMemoryProposals.find((p) => p.id === id)) {
    inMemoryProposals.push({
      id: id,
      description: description,
      creator: creator,
      executed: false,
      votesFor: 0,
      votesAgainst: 0,
      status: "Active",
      deadline: deadline
    });
  }
};

const handleVoted = (event) => {
  const { args } = event;
  const id = Number(args[0]);
  const voter = args[1];
  const support = args[2];

  console.log(`[EVENT] Voted: ID: ${id}, Support: ${support ? 'For' : 'Against'}`);

  const proposal = inMemoryProposals.find((p) => p.id === id);
  if (proposal) {
    if (support) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }
    console.log(`   -> New Score: For: ${proposal.votesFor}, Against: ${proposal.votesAgainst}`);
  }
};

const handleProposalExecuted = (event) => {
  const { args } = event;
  const id = Number(args[0]);

  console.log(`[EVENT] ProposalExecuted: ID: ${id}`);

  const proposal = inMemoryProposals.find((p) => p.id === id);
  if (proposal) {
    proposal.executed = true;
    proposal.status = "Executed";
  }
};

module.exports = { listenToEvents };