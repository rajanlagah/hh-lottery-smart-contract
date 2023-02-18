import React from "react";
import { ConnectButton } from "web3uikit";

const Header = () => {
  return (
    <div className="py-16">
      <ConnectButton moralisAuth={false} />
    </div>
  );
};
export default Header;
