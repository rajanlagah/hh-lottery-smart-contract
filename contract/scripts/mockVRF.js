// yarn hardhat run scripts/mockVRF.js --network localhost
const { ethers, network } = require("hardhat");

async function mockKeepers() {
  let raffle;
  try {
    raffle = await ethers.getContract(
      "Raffle"
      //   "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      //   "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
  } catch (e) {
    console.log("e in get raffle", e);
  }
  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
  //   console.log("--1--", checkData)
  const { upkeepNeeded } = await raffle.checkUpkeep(checkData);
  console.log("--2--");
  if (upkeepNeeded) {
    console.log("--3--");
    let tx;
    try {
      tx = await raffle.performUpkeep(checkData);
    } catch (e) {
      console.log("exception", e);
    }
    const txReceipt = await tx.wait(1);
    // console.log("txReceipt.events", txReceipt.events)
    const requestId = txReceipt.events[1].args.requestId;
    console.log(`Performed upkeep with RequestId: ${requestId}`);
    console.log(`chain id: ${network.config.chainId}`);
    // if (network.config.chainId == 31337) {
    try {
      await mockVrf(requestId, raffle);
    } catch (e) {
      console.log("exception", e);
    }
  } else {
    console.log("No upkeep needed!");
  }
}

async function mockVrf(requestId, raffle) {
  console.log("We on a local network? Ok let's pretend...");
  const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.address);
  console.log("Responded!");
  const recentWinner = await raffle.getWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
