const fs = require("fs");
const { network, ethers } = require("hardhat");

const FRONT_END_CONTRACT_FILE = "../hh-lottery-nextjs/contracts/contracts.json";
const FRONT_END_ABI_FILE = "../hh-lottery-nextjs/contracts/abi.json";

const mainFn = () => {
  console.log("Updating frontend contract and ABI");
  updateContractAddress();
  updateABI();
};
mainFn();
module.exports = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating frontend contract and ABI");
    updateContractAddress();
    updateABI();
  }
};

async function updateABI() {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddress() {
  const raffle = await ethers.getContract("Raffle");
  console.log("GOT RAFFLE");
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_CONTRACT_FILE, "utf-8")
  );
  const chainId = network.config.chainId.toString();
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(raffle.address)) {
      currentAddresses[chainId].push(raffle.address);
    }
  } else {
    currentAddresses[chainId] = [raffle.address];
  }
  console.log("Upading contracts", currentAddresses);
  fs.writeFileSync(FRONT_END_CONTRACT_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
