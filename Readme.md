## Decentralized Lottery
Check [demo](https://tiny-dew-2052.on.fleek.co/)
Check this tutorial [here](https://www.youtube.com/watch?v=gyMwXuJrbJQ&t=63378s&ab_channel=freeCodeCamp.org)
## Testnet
Goerli.

## Technology used
- solidity
- nextjs
- chainlink
- hardhat
- metamask
- mocha
- chai
- react-moralis
- web3uikit
- fleek.com
## How it work
This project have 3 components 
1. Smart contract
2. Smart contract tests
3. Nextjs frontend

### Smart Contract
Its writing in solidity ^0.8. It allow user to make payment in GoerliETH (or hardhat Eth ) and then it store user address and we call them player. After the set time (1 min) it chainlink keepers ( now automation.chainlink ) run cron job and if number of players is > 0 then automation.chainlink will run performUpKeep function which will call random number function given by chainlink's VRF and after process we will receive random number in fulfillRandomWords fn. This random number will be the index of winner in player array and all the balance of contract will be transfered to winner.

### Smart contract tests
2 sets of testing
#### 1. Unit testing
These tests each function on local hardhat node. On local we are calling `fulfillRandomWords` fn manually.
**to run test** 
```
hh test
```

#### 2. Staging tests
In this we are testing e2e flow of user journey from entering the game to game results. This is done on Goerli test net.

**to run test** 
network-name = {hardhat,localhost,goerli}

```
hh test --network network-name
```

### Nextjs frontend
Sepolia [Demo](https://hh-lottery-smart-contract.vercel.app/)

Gorile[Depricated] [demo](https://tiny-dew-2052.on.fleek.co/)

Intractive UI that make it easy to enter game. We have used react-moralis to intract with smart contract and web3uikit for pre-built UI components.

### Installation
Clone this repo.
1. Frontend
```
cd hh-lottery-nextjs
npm i 
npm start
```
2. Smart contract
To setup hardhat use https://hardhat.org

```
cd contract
npm i
```
setup .env file 
```bash
GOERLI_RPC_URL = https://eth-goerli.g.alchemy.com/v2/EPHwS8BWiXoC81MDCegyC0Nv-SFkZMed
ETHER_SCAN_API_KEY =
GORELI_ACCOUNT_META_MASK =
UPDATE_FRONT_END = true
```
to run code
network-name = {hardhat,localhost,goerli}
```
hh node --network network-name
```
to run test 
```
hh test --network network-name
```

### Deploy 

```
yarn hardhat deploy --network sepolia
```