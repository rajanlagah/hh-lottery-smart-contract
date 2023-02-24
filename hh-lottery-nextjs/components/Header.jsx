import React from "react";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div className="flex p-2 justify-center align-middle">
      <h1 className="flex-grow m-auto md:text-2xl">Decentralized Raffle</h1>
      <ConnectButton moralisAuth={false} />
    </div>
  );
};
export default Header;
