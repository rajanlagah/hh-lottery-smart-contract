const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-config-hardhat")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit test", async () => {
      let raffle,
        vrfCoordinatorV2Mock,
        entryFee,
        deployer,
        interval,
        raffleContract,
        accounts
      const chainId = network.config.chainId

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        accounts = await ethers.getSigners()
        await deployments.fixture(["all"])
        raffleContract = await ethers.getContract("Raffle")
        raffle = raffleContract.connect(accounts[0])
        vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
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
          await raffle.performUpkeep("0x")
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
      describe("preformUpKeep", () => {
        it("run when checkUpKeep returns true", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const tx = await raffle.performUpkeep([])
          assert(tx)
        })
        it("reverts when checkUpKeep is false", async () => {
          await expect(raffle.performUpkeep([])).to.be.revertedWith(
            "Raffle__UpkeepNotNeeded"
          )
        })
        it("update raffle state, emit event", async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
          const txResponse = await raffle.performUpkeep([])
          const txReceipt = await txResponse.wait(1)
          const reqId = await txReceipt.events[1].args.requestId // 0 event is emited by vrf contract
          const raffleState = await raffle.getRaffleState()
          assert(reqId.toNumber() > 0)
          assert(raffleState.toString() == "1")
        })
      })
      describe("fulfillRandomWords", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: entryFee })
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ])
          await network.provider.request({ method: "evm_mine", params: [] })
        })

        it("can only be called after performUpkeep", async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address)
          ).to.be.revertedWith("nonexistent request")
        })

        it("picks a winner, resets the lottery, transfer money", async () => {
          const totalNumOfAccounts = 3
          const otherIndexs = 1 // 0 is for deployer
          // await network.provider.send("eth_requestAccounts", [])
          const accounts = await ethers.getSigners()
          for (let i = otherIndexs; i < totalNumOfAccounts; i++) {
            raffle = raffleContract.connect(accounts[i])
            await raffle.enterRaffle({ value: entryFee })
          }
          const startTimeStamp = await raffle.getLastTimeStamp()
          const winnerStartingBalance = await accounts[2].getBalance()
          // performUpKeep ( mock being chainlink keepers)
          // fulfillrandomnumber ( mock being the chainlink VRF)
          // We have to wait fulfillrandomnumber to be called
          await new Promise(async (resolve, reject) => {
            // setting up listners
            try {
              raffle.once("WinnersPicked", async () => {
                console.log("found the event")
                try {
                  const recentWinner = await raffle.getWinner()
                  const raffleState = await raffle.getRaffleState()
                  const endingTimeStamp = await raffle.getLastTimeStamp()
                  const numberOfPlayers = await raffle.getNumberOfPlayers()
                  const winnerEndingBalance = await accounts[2].getBalance()
                  // contract should be reset
                  assert.equal(numberOfPlayers.toString(), "0")
                  assert.equal(raffleState.toString(), "0")
                  console.log("endingTimeStamp", endingTimeStamp)
                  assert(endingTimeStamp > startTimeStamp)
                  assert.isAbove(winnerEndingBalance, winnerStartingBalance)
                  resolve()
                } catch (e) {
                  console.log("exception", e)
                  assert(false)
                  reject(e)
                }
              })
            } catch (e) {
              console.log("exception", e)
            }
            // triggering the functions
            console.log("Called performUpkeep")
            const tx = await raffle.performUpkeep("0x")
            console.log("waiting for block")
            const transactionReceipt = await tx.wait(1)
            console.log("waiting for fulfillRandomWords")
            try {
              await vrfCoordinatorV2Mock.fulfillRandomWords(
                transactionReceipt.events[1].args.requestId,
                raffle.address
              )
            } catch (e) {
              console.log("exxx", e)
            }
            console.log("waiting for WinnersPicked")
          })
        })
      })
    })
