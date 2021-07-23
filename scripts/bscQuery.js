import Web3 from "web3";
import EthDater from "ethereum-block-by-date";

const mainnet = "https://bsc-dataseed.binance.org/";
const testnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const web3 = new Web3(mainnet);
const dater = new EthDater(web3);

const freibierAddress = "0x26046abedf7117af40ca645350eb857d170bf71f";

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
  console.log(size);
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
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Searching block " + i);
    var block = await web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach((tx) => {
        if (freibierAddress == tx.to) {
          amountOfTx[tx.from] = amountOfTx[tx.from]
            ? amountOfTx[tx.from] + 1
            : 1;
        }
      });
    }
  }
  console.log(amountOfTx);
  return amountOfTx;
}

console.time("Scan");
await getTransactionsByAccount(new Date("2021-07-21T00:00:00Z"));
console.timeEnd("Scan");
