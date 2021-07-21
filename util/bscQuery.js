import Web3 from "web3";
import { waxWalletCollector } from "./contractABI.js";
import InputDataDecoder from "ethereum-input-data-decoder";

const decoder = new InputDataDecoder("./abi.json");
const mainnet = "https://bsc-dataseed.binance.org/";
const testnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const web3 = new Web3(mainnet);

const waxWalletCollectorAddress = "0xB3528065F526Acf871B35ae322Ed28b24C096548";

async function getBEP20TransactionsByAddress() {
  const currentBlockNumber = await web3.eth.getBlockNumber();
  // if no block to start looking from is provided, look at tx from the last day
  // 86400s in a day / eth block time 10s ~ 8640 blocks a day
  const fromBlock = currentBlockNumber - 5000;
  const toBlock = currentBlockNumber;
  const contract = new web3.eth.Contract(
    waxWalletCollector,
    waxWalletCollectorAddress
  );
  const transferEvents = await contract.getPastEvents("Collect", {
    fromBlock,
    toBlock,
  });
  return transferEvents.map(({ transactionHash }) => {
    return { transactionHash };
  });
}

async function collect() {
  const events = await getBEP20TransactionsByAddress();
  for (let i = 0; i < events.length; i++) {
    const { transactionHash } = events[i];
    const result = await web3.eth.getTransaction(transactionHash);
    const { inputs } = decoder.decodeData(result.input);
    console.log(inputs);
  }
}

async function getTransactionsByAccount(
  myaccount,
  startBlockNumber,
  endBlockNumber
) {
  if (endBlockNumber == null) {
    endBlockNumber = await web3.eth.getBlockNumber();
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 2000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log(
    'Searching for transactions to/from account "' +
      myaccount +
      '" within blocks ' +
      startBlockNumber +
      " and " +
      endBlockNumber
  );
  let result = [];
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = await web3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach(function (e) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          result.push(e.hash);
          console.log(e);
        }
      });
    }
  }
  return result;
}

const account = "0x7F609eb8CEB525b7a0653E887CEba8517766a3E2";

// const txs = await getTransactionsByAccount(account, null, null);
// for (let i = 0; i < txs.length; i++) {
//   const tx = await web3.eth.getTransaction(txs[i]);
//   console.log(tx);
// }
let blockNum;
web3.eth.getBlockNumber().then((val) => {
  blockNum = val;
  // console.log(blockNum);
});
setTimeout(() => console.log(blockNum), 2000);
