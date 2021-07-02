import { utils } from "ethers";
import bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";

const providerURL = `https://mainnet.infura.io/v3/86699891da194635a19df4e3ad7221ab`;
const web3 = new Web3(providerURL);
const path = "m/44'/60'/0'/0/0";

function swap(i, j, A) {
  const temp = A[i];
  A[i] = A[j];
  A[j] = temp;
  return A;
}

async function generate(A) {
  const n = A.length;
  let c = [];
  for (let i = 0; i < n; i++) {
    c[i] = 0;
  }
  await getSeedOrder(A);
  let i = 1;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 == 0) {
        swap(0, i, A);
      } else {
        swap(c[i], i, A);
      }
      await getSeedOrder(A);
      c[i]++;
      i = 1;
    } else {
      c[i] = 0;
      i++;
    }
  }
}

async function getSeedOrder(seedPhrase) {
  const phrase = seedPhrase.join(" ");
  if (utils.HDNode.isValidMnemonic(phrase)) {
    const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(phrase));
    const wallet = hdWallet.derivePath(path).getWallet();
    const address = `0x${wallet.getAddress().toString("hex")}`;
    const balance = await web3.eth.getBalance(address);
    console.log(phrase);
    if (balance > 0) result.push({ phrase, address, balance });
  }
}

const indexes = process.argv.slice(2);
if (indexes.length == 12) {
  console.time("Heap Alg");
  await generate(indexes);
  console.timeEnd("Heap Alg");
}
