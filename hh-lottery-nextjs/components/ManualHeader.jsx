import { useEffect } from "react";
import { useMoralis } from "react-moralis";

export default function ManualHeader() {
  const {
    enableWeb3,
    account,
    user,
    isWeb3Enabled,
    Moralis,
    deactivateWeb3,
    isWeb3EnableLoading,
  } = useMoralis();

  useEffect(() => {
    if (window) {
      if (window.localStorage.getItem("wallet-connected")) {
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log("account changed to ", account);
      if (account == null) {
        window.localStorage.removeItem("wallet-connected");
        deactivateWeb3(); // its going to set isWeb3Enabled to false
      }
    });
  }, []);

  const onConnectBtnClick = () => {
    enableWeb3();
    window.localStorage.setItem("wallet-connected", true);
  };

  if (account) {
    return (
      <div>
        Connected
        <p>{account}</p>
      </div>
    );
  }
  return (
    <>
      <button onClick={onConnectBtnClick} disabled={isWeb3EnableLoading}>
        Connect
      </button>
    </>
  );
}
