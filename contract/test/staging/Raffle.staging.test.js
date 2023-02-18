const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const {
  developmentChains,
  networkConfig,
} = require("../../helper-config-hardhat")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle unit test", () => {
      let raffle, entryFee, deployer
      const chainId = network.config.chainId

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        // await deployments.fixture(["all"])
        // raffle = await ethers.getContract("Raffle", deployer)
        raffle = await ethers.getContractAt(
          "Raffle",
          "0x797fd727f57af10b137aB5FAD12C2A8F420FA6f0",
          "0x6e0F5B57FEdc8911722c92dcD5D7D0cf69ceA385"
        )
        // entryFee = await raffle.getEntryFee()
        entryFee = ethers.utils.parseEther("0.01")
      })
      describe("fulfillRandomWords", function () {
        it("picks a winner, resets the lottery, transfer money", async () => {
          console.log("Raffle", raffle.address)
          const accounts = await ethers.getSigners()
          const startTimeStamp = raffle.getLastTimeStamp()
          let previousBalance
          // console.log("previousBalance", previousBalance.toString())
          // console.log("entryFee", entryFee.toNumber())
          // console.log(previousBalance.toNumber() > entryFee.toNumber())
          // fulfillrandomnumber ( mock being the chainlink VRF)
          // We have to wait fulfillrandomnumber to be called

          // enter rafflevn
          console.log("Setting up Listener...")
          await new Promise(async (resolve, reject) => {
            // setting up listners
            raffle.once("WinnersPicked", async () => {
              console.log("found the event")
              try {
                const recentWinner = await raffle.getWinner()
                const raffleState = await raffle.getRaffleState()
                const numberOfPlayers = await raffle.getNumberOfPlayers()
                const winnerEndingBalance = await accounts[0].getBalance()
                const currentTimeStamp = raffle.getLastTimeStamp()
                console.log("----", accounts[0].address)
                // contract should be reset
                assert.equal(numberOfPlayers.toString(), "0")
                assert.equal(raffleState.toString(), "0")
                assert(currentTimeStamp > previousBalance)
                assert.equal(recentWinner.toString(), accounts[0].address)

                assert.isAbove(winnerEndingBalance, previousBalance)
                resolve()
              } catch (e) {
                console.log("exception", e)
                reject(e)
              }
            })
            // console.log("Entering Raffle...")
            // const tx = await raffle.enterRaffle({ value: entryFee })
            // await tx.wait(1)
            // console.log("Ok, time to wait...")
            try {
              console.log("Entering Raffle...")
              const tx = await raffle.enterRaffle({ value: entryFee })
              previousBalance = await accounts[0].getBalance()
              console.log("Waiting for block confirmation")
              await tx.wait(1)
              console.log("Ok, time to wait...")
            } catch (e) {
              console.log("rerr", e)
            }
          })
        })
      })
    })
