import Web3 from "web3";
import { waxWalletCollector } from "./contractABI.js";
import InputDataDecoder from "ethereum-input-data-decoder";
import EthDater from "ethereum-block-by-date";

const decoder = new InputDataDecoder("./abi.json");
const mainnet = "https://bsc-dataseed.binance.org/";
const testnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const web3 = new Web3(testnet);
const dater = new EthDater(web3);

const waxWalletCollectorAddress = "0xD4A6fbFdCd2AaF38339ebb61c35c946745bdF5AF";
const freibierAddress = "0x26046abedf7117af40ca645350eb857d170bf71f";
const account = "0x3FBF9bFB297A32acd6889a73EbCe18f84d968e44";

async function getWAXWallets() {
  let result = [];
  const contract = new web3.eth.Contract(
    waxWalletCollector,
    waxWalletCollectorAddress
  );
  const size = await contract.methods.size().send({ from: currentUser });
  for (let i = 0; i < size; i++) {
    const wallet = await contract.methods
      .wallets(wax.userAccount)
      .send({ from: currentUser });
    result.push(wallet);
  }
  console.log(result);
  return result;
}

// await getWAXWallets();

async function getTransactionsByAccount(date) {
  const start = await dater.getDate(date);
  const end = await dater.getDate(
    new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)
  );

  const startBlockNumber = start.block;
  const endBlockNumber = end.block;
  console.log(
    "Searching within blocks " + startBlockNumber + " and " + endBlockNumber
  );
  let amountOfTx = {};
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Searching block " + i);
    var block = await web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach((tx) => {
        if (myaccount == tx.from && freibierAddress == tx.to) {
          amountOfTx[tx.from] = amountOfTx[tx.from]
            ? amountOfTx[tx.from] + 1
            : 1;
        }
      });
    }
  }
  return amountOfTx;
}

console.time("Scan");
await getTransactionsByAccount(new Date("2021-07-20T15:00:00Z"));
console.timeEnd("Scan");

// const start = await dater.getDate("2021-07-20T15:00:00Z");
// const end = await dater.getDate("2021-07-13T15:00:00Z");
// console.log(start.block, end.block);
