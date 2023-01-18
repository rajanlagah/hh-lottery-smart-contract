const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-config-hardhat")
const { verifyContract } = require("../utils/verify")
require("dotenv").config()

const SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

module.exports = async function ({ getNamedAccounts, deployments }) {
  console.log("deploying Raffle on chain ", network.name)

  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  let vrfCoordinatorV2Address, subscriptionId

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    )
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
    const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
    const transactionReceipt = await transactionResponse.wait()
    subscriptionId = transactionReceipt.events[0].args.subId
    // Fund the sub
    // free on local.
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, SUB_FUND_AMOUNT)
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCordinatorV2
    subscriptionId = networkConfig[chainId].subId
  }

  const entrenceFee = networkConfig[chainId].entrenceFee
  const gasLane = networkConfig[chainId].gasLane
  const callBackGasLimit = networkConfig[chainId].callBackGasLimit
  const interval = networkConfig[chainId].interval

  const args = [
    vrfCoordinatorV2Address,
    entrenceFee,
    gasLane,
    subscriptionId,
    callBackGasLimit,
    interval,
  ]
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHER_SCAN_API_KEY
  ) {
    await verifyContract(raffle.address, args)
  }

  log("-------------------------------")
}

module.exports.tags = ["all", "raffle"]
