import Web3 from "web3";
import EthDater from "ethereum-block-by-date";
import fs from "fs";

const mainnet = "https://bsc-dataseed.binance.org/";
const testnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const web3 = new Web3(mainnet);
const dater = new EthDater(web3);

const freibierAddress = "0x26046ABedf7117AF40Ca645350eb857d170Bf71f";
async function getWAXWallets() {
  window.web3 = new Web3(ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await ethereum.request({ method: "eth_accounts" });
  currentUser = accounts[0];

  let result = [];
  const contract = new web3.eth.Contract(
    waxWalletCollector,
    waxWalletCollectorAddress
  );
  const size = await contract.methods.size().call({ from: currentUser });
  for (let i = 0; i < size; i++) {
    const wallet = await contract.methods
      .wallets(i)
      .call({ from: currentUser });
    result.push(wallet);
  }
  return result;
}

async function getTransactionsByAccount(date) {
  const start = await dater.getDate(
    new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  const end = await dater.getDate(date);
  const startBlockNumber = start.block;
  const endBlockNumber = end.block;

  console.log(
    "Searching within blocks " + startBlockNumber + " and " + endBlockNumber
  );

  let amountOfTx = {};

  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    var block = await web3.eth.getBlock(i, true);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
      "Progress: " +
        (
          ((i - startBlockNumber) / (endBlockNumber - startBlockNumber)) *
          100
        ).toFixed(2) +
        "%"
    );
    if (block != null && block.transactions != null) {
      block.transactions.forEach((tx) => {
        if (freibierAddress === tx.to) {
          amountOfTx[tx.from] = amountOfTx[tx.from]
            ? amountOfTx[tx.from] + 1
            : 1;
        }
      });
    }
  }
  fs.writeFileSync("bscQuery.json", JSON.stringify(amountOfTx));
  return amountOfTx;
}

const arg = process.argv.slice(2);
const till = new Date(arg[0]);
try {
  console.time("Scan");
  await getTransactionsByAccount(till);
  console.timeEnd("Scan");
} catch (e) {
  console.log(
    "Invalid Date: " +
    arg[0] +
      "\nCorrect Format: YEAR:MONTH:DAY\ne.g. 2021-07-31 or with time of the day \ne.g. 2021-07-31T15:30:00Z"
  );
}
