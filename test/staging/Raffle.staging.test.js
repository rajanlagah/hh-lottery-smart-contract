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
        await deployments.fixture(["all"])
        raffle = await ethers.getContract("Raffle", deployer)
        // raffle = await ethers.getContractAt(
        //   "Raffle",
        //   "0xFB641C753c6F11B9F002541Fa93A71CB5579DF60",
        //   "0x6e0F5B57FEdc8911722c92dcD5D7D0cf69ceA385"
        // )
        entryFee = await raffle.getEntryFee()
      })
      // describe("fulfillRandomWords", function () {
      //   it("picks a winner, resets the lottery, transfer money", async () => {
      //     console.log("Raffle", raffle.address)
      //     const accounts = await ethers.getSigners()
      //     const startTimeStamp = raffle.getLastTimeStamp()
      //     const previousBalance = await accounts[0].getBalance()
      //     console.log("previousBalance", previousBalance.toString())
      //     // console.log("entryFee", entryFee.toNumber())
      //     // console.log(previousBalance.toNumber() > entryFee.toNumber())
      //     // fulfillrandomnumber ( mock being the chainlink VRF)
      //     // We have to wait fulfillrandomnumber to be called

      //     // enter rafflevn
      //     console.log("Setting up Listener...")
      //     await new Promise(async (resolve, reject) => {
      //       // setting up listners
      //       raffle.once("WinnerPicked", async () => {
      //         console.log("found the event")
      //         try {
      //           const recentWinner = await raffle.getWinner()
      //           const raffleState = await raffle.getRaffleState()
      //           const numberOfPlayers = await raffle.getNumberOfPlayers()
      //           const winnerEndingBalance = await accounts[0].getBalance()
      //           const currentTimeStamp = raffle.getLastTimeStamp()

      //           // contract should be reset
      //           assert.equal(numberOfPlayers.toString(), "0")
      //           assert.equal(raffleState.toString(), "0")
      //           assert(currentTimeStamp > previousBalance)
      //           assert.equal(recentWinner.toString(), accounts[0].address)
      //           assert.equal(
      //             winnerEndingBalance.toString(),
      //             previousBalance.add(entryFee).toString()
      //           )
      //           resolve()
      //         } catch (e) {
      //           console.log("exception", e)
      //           reject(e)
      //         }
      //       })
      //       console.log("Entering Raffle...")
      //       const tx = await raffle.enterRaffle({ value: entryFee })
      //       await tx.wait(1)
      //       console.log("Ok, time to wait...")
      //     })
      //   })
      // })

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          // enter the raffle
          console.log("address", raffle)
          console.log("Setting up test...")
          const startingTimeStamp = await raffle.getLastTimeStamp()
          const accounts = await ethers.getSigners()
          const winnerStartingBalance = await accounts[0].getBalance()

          console.log("Setting up Listener...")
          console.log("Raffle", raffle.address)
          console.log("winnerStartingBalance", winnerStartingBalance.toString())
          // and this code WONT complete until our listener has finished listening!

          await new Promise(async (resolve, reject) => {
            // setup listener before we enter the raffle
            // Just in case the blockchain moves REALLY fast
            raffle.once("WinnersPicked", async () => {
              console.log("WinnerPicked event fired!")
              try {
                // add our asserts here
                const recentWinner = await raffle.getWinner()
                const raffleState = await raffle.getRaffleState()
                const winnerEndingBalance = await accounts[0].getBalance()
                const endingTimeStamp = await raffle.getLastTimeStamp()

                await expect(raffle.getPlayer(0)).to.be.reverted
                assert.equal(recentWinner.toString(), accounts[0].address)
                assert.equal(raffleState, 0)
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(entryFee).toString()
                )
                assert(endingTimeStamp > startingTimeStamp)
                resolve()
              } catch (error) {
                console.log(error)
                reject(error)
              }
            })
            // Then entering the raffle
            try {
              console.log("Entering Raffle...")
              const tx = await raffle.enterRaffle({ value: entryFee })
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
