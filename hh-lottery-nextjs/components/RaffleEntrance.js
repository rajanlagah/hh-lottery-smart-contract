import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { contractAddress, abi } from "./../contracts/index";
import { useNotification } from "web3uikit";
import { getSchedule, stringToArray } from "cron-converter";

export default function LotteryEntrance() {
  const [entryFee, setEntryfee] = useState("0");
  const [numOfPlayers, setnumOfPlayers] = useState("0");
  const [nextScheduleResults, setnextScheduleResults] = useState("0");
  const interval = 60; // every x sec
  const [lastWinner, setlastWinner] = useState("0");
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: contractAddress?.[chainId]?.[0] || null,
    functionName: "enterRaffle",
    params: {},
    msgValue: entryFee,
  });

  const { runContractFunction: getEntryFee } = useWeb3Contract({
    abi,
    contractAddress: contractAddress?.[chainId]?.[0] || null,
    functionName: "getEntryFee",
    params: {},
  });

  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi,
    contractAddress: contractAddress?.[chainId]?.[0] || null,
    functionName: "getNumberOfPlayers",
    params: {},
  });

  const { runContractFunction: getWinner } = useWeb3Contract({
    abi,
    contractAddress: contractAddress?.[chainId]?.[0] || null,
    functionName: "getWinner",
    params: {},
  });

  useEffect(() => {
    const arr = stringToArray("*/1 * * * *");

    // Get the iterator, initialised to now
    let schedule = getSchedule(arr);
    // let reference = new Date(2013, 2, 8, 9, 32);
    // const schedule = getSchedule(arr, reference, "Europe/London");
    const nextScheduled = schedule.next().c;
    setnextScheduleResults(
      `${nextScheduled.hour}h : ${nextScheduled.minute}m : ${nextScheduled.second}s`
    );
  });

  useEffect(() => {
    const updateUI = async () => {
      const _entryFee = await getEntryFee();
      const _numOfPlayers = await getNumberOfPlayers();
      const _lastWinner = await getWinner();
      setlastWinner(_lastWinner);
      setnumOfPlayers(_numOfPlayers.toString());
      setEntryfee(_entryFee);
    };
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  if (!contractAddress) {
    return <>Raffle contract is not loaded</>;
  }

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      dispatch({
        type: "info",
        message: "Entered Raffle",
        title: "Success",
        position: "topR",
      });
      const _numOfPlayers = await getNumberOfPlayers();
      setnumOfPlayers(_numOfPlayers.toString());
    } catch (e) {
      console.log("Err", e);
    }
  };

  const entryFeeInEth = ethers.utils.formatUnits(entryFee.toString(), "ether");
  const totalReward = parseInt(numOfPlayers) * parseFloat(entryFeeInEth);
  var date = new Date();
  date.setSeconds(interval); // specify value for SECONDS here
  const timeString = date.toISOString().substring(11, 19);

  return (
    <div className="p-4 text-center">
      <p className="absolute hover:underline bottom-2 left-2 lottery-time">
        <a
          target="_blank"
          rel="noreferrer"
          href="https://rajanlagah.netlify.app/"
        >
          About me
        </a>
      </p>
      <p className="absolute bottom-4 right-4 lottery-time">
        <a
          rel="noreferrer"
          href="https://github.com/rajanlagah/hh-lottery-smart-contract"
          target="_blank"
        >
          <img
            width="50px"
            height="50px"
            src="./github.svg"
            alt="github icon"
          />
        </a>
      </p>
      <div className="total-reward">
        <p>
          {totalReward}
          <span className="currency-eth">ETH</span>
        </p>
      </div>
      <br />
      <br />
      <div className="flex md:justify-center flex-wrap ">
        <div className="lottery-info-tab">Fee {entryFeeInEth} ETH</div>
        <div className="lottery-info-tab">
          Number of players : {numOfPlayers}
        </div>
        <div className="lottery-info-tab cursor-pointer hover:underline">
          Last Winner : {lastWinner.substring(0, 6)} ... {lastWinner.slice(-6)}
        </div>
      </div>
      {chainId != 5 && (
        <a
          rel="noreferrer"
          target="_blank"
          href="https://metaschool.so/articles/how-to-change-add-new-network-metamask-wallet/"
          className="text-white underline"
        >
          Please switch to Goerli testnet
        </a>
      )}
      {chainId == 5 && (
        <div className="md:my-8 my-6">
          <button
            className="py-2 px-4 rounded bg-white hover:p-2 text-black"
            onClick={() => {
              enterRaffle({
                onSuccess: handleSuccess,
                onError: (e) => console.log("er", e),
              });
            }}
          >
            {isLoading || isFetching ? (
              <div className="flex justify-evenly align-middle px-6">
                <div className="border-t-transparent border-solid animate-spin rounded-full border-2 h-4 w-4 p-2 mx-2"></div>
              </div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
          <p className="p-4 lottery-time">
            Next Results at{" "}
            <span className="px-2 text-white">{nextScheduleResults}</span>
          </p>
        </div>
      )}
    </div>
  );
}
