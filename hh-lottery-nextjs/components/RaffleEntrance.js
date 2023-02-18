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
  const { runContractFunction: enterRaffle } = useWeb3Contract({
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
    } catch (e) {
      console.log("Err", e);
    }
  };

  return (
    <>
      <p>
        Entery fee is {ethers.utils.formatUnits(entryFee.toString(), "ether")}{" "}
        ETH
      </p>
      <p>Number of players : {numOfPlayers}</p>
      <p>Last Winner : {lastWinner}</p>
      <button
        onClick={() => {
          enterRaffle({
            onSuccess: handleSuccess,
            onError: (e) => console.log("er", e),
          });
        }}
      >
        Enter Raffle
      </button>
    </>
  );
}
