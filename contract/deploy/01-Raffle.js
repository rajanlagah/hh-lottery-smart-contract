const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
  VERIFICATION_BLOCK_CONFIRMATIONS
} = require("../helper-config-hardhat");
const { verifyContract } = require("../utils/verify");
require("dotenv").config();

const SUB_FUND_AMOUNT = ethers.utils.parseEther("2");

module.exports = async function ({ getNamedAccounts, deployments }) {
  console.log("deploying Raffle on chain ", network.name);

  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait();
    subscriptionId = transactionReceipt.events[0].args.subId;
    // Fund the sub
    // free on local.
    await vrfCoordinatorV2Mock.fundSubscription(
      subscriptionId,
      SUB_FUND_AMOUNT
    );
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subId;
  }
  console.log("vrfCoordinatorV2Address", vrfCoordinatorV2Address);
  const entrenceFee = networkConfig[chainId].entrenceFee;
  const gasLane = networkConfig[chainId].gasLane;
  const callBackGasLimit = networkConfig[chainId].callBackGasLimit;
  const interval = networkConfig[chainId].interval;

  const args = [
    vrfCoordinatorV2Address,
    entrenceFee,
    gasLane,
    subscriptionId,
    callBackGasLimit,
    interval
  ];
  console.log("Getting raffle");
  console.log("args", args);
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  console.log("waitBlockConfirmations", waitBlockConfirmations);
  console.log("deployer", deployer);
  console.log("deploy", deploy);

  let raffle;
  try {
    raffle = await deploy("Raffle", {
      from: deployer,
      args: args,
      log: true,
      waitConfirmations: waitBlockConfirmations
    });
  } catch (error) {
    console.log("Error", error);
  }

  console.log("Got raffle");
  // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
  if (developmentChains.includes(network.name)) {
    console.log("adding consumer");
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    console.log("not verifying");
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHER_SCAN_API_KEY
  ) {
    await verifyContract(raffle.address, args);
  }

  log("-------------------------------");
};

module.exports.tags = ["all", "raffle"];
