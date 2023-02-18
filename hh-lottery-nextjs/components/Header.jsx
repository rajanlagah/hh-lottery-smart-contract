import React from "react";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <>
      <ConnectButton moralisAuth={false} />
    </>
  );
};
export default Header;
