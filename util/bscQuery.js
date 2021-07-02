import Web3 from "web3";
import { waxWalletCollector } from "./contractABI.js";
import InputDataDecoder from "ethereum-input-data-decoder";

const decoder = new InputDataDecoder("./abi.json");
const mainnet = "https://bsc-dataseed.binance.org/";
const testnet = "https://data-seed-prebsc-1-s1.binance.org:8545/";
const web3 = new Web3(testnet);

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

const events = await getBEP20TransactionsByAddress();

for (let i = 0; i < events.length; i++) {
  const { transactionHash } = events[i];
  const result = await web3.eth.getTransaction(transactionHash);
  const { inputs } = decoder.decodeData(result.input);
  console.log(inputs);
}
