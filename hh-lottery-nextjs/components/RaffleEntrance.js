import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { ethers } from "ethers";
import { contractAddress, abi } from "./../contracts/index";
import { useNotification } from "web3uikit";

export default function LotteryEntrance() {
  const [entryFee, setEntryfee] = useState("0");
  const [numOfPlayers, setnumOfPlayers] = useState("0");
  const [lastWinner, setlastWinner] = useState("0");
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const dispatch = useNotification();

  console.log("Chain ID", chainId);
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

  return (
    <div className="p-4">
      <p>
        Entery fee is {ethers.utils.formatUnits(entryFee.toString(), "ether")}{" "}
        ETH
      </p>
      <p>Number of players : {numOfPlayers}</p>
      <p>Last Winner : {lastWinner}</p>
      <button
        className="py-2 px-4 rounded bg-blue-600 hover:bg-slate-700 text-white"
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
    </div>
  );
}
