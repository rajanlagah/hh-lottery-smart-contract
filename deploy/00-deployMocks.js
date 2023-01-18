const { network, ethers } = require("hardhat")
const { developmentChains } = require("../helper-config-hardhat")

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is premium
  const GAS_PRICE_LINK = 1e9

  if (developmentChains.includes(network.name)) {
    log("local network detected. Deploying mocks...")
    //
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [BASE_FEE, GAS_PRICE_LINK],
    })
    log("Mock deployed")
    log("-----------------------")
  }
}

module.exports.tags = ["all", "mocks"]
