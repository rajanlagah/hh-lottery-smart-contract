const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-config-hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is premium
  const GAS_PRICE_LINK = 1e9
  console.log("chainId", chainId)
  if (chainId == 31337) {
    console.log("local network detected. Deploying mocks...")
    //
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    })
    console.log("Mock deployed")
    console.log("-----------------------")
  }
}

module.exports.tags = ["all", "mocks"]
