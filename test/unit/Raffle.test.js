const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-config-hardhat")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit test", async () => {
      let raffle, vrfCoordinatorV2Mock, entryFee, deployer, interval
      const chainId = network.config.chainId

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        )
        entryFee = await raffle.getEntryFee()
        interval = await raffle.getInterval()
      })

      describe("cunstructor", async () => {
        it("intializes the raffle correctly", async () => {
          const raffleState = await raffle.getRaffleState()

          assert.equal(raffleState.toString(), "0")
          assert.equal(interval.toString(), networkConfig[chainId].interval)
        })
      })

      describe("enter raffle", async () => {
        it("reverts when enter raffle", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughEthEntered"
          )
        })
        it("record when player enter raffle", async () => {
          await raffle.enterRaffle({ value: entryFee })
          const playerContract = await raffle.getPlayer(0)
          assert.equal(playerContract, deployer)
        })
        it("emit event on raffle enter", async () => {
          await expect(raffle.enterRaffle({ value: entryFee })).to.emit(
            raffle,
            "RaffleEnter"
          )
        })
        it("doesnt allow entrance when raffle is calc", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          await raffle.performUpkeep([])
          await expect(
            raffle.enterRaffle({ value: entryFee })
          ).to.be.revertedWith("Raffle__NotOpen")
        })
      })

      describe("checkUpKeep", async () => {
        it("returns false if people have not send any ETH", async () => {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert(!upkeepNeeded)
        })
        it("returns false if raffle is not open", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          await raffle.performUpkeep([])
          const raffleState = await raffle.getRaffleState()
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
          assert.equal(raffleState.toString(), "1")
          assert.equal(upkeepNeeded, false)
        })
        it("returns false if enough time hasn't passed", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() - 5,
          ]) // use a higher number here if this test fails
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          assert(!upkeepNeeded)
        })
        it("returns true if enough time has passed, has players, eth, and is open", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
          assert(upkeepNeeded)
        })
      })
    })
