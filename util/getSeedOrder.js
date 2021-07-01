import { utils } from "ethers";
import bip39 from "bip39";
import { hdkey } from "ethereumjs-wallet";
import Web3 from "web3";

const mnemonic =
  "basic shop clerk share someone gold click scale member brisk omit client";

const mainnet = "https://bsc-dataseed.binance.org/";
const web3 = new Web3(mainnet);

function combo(c) {
  var r = [],
    len = c.length,
    tmp = [];
  function nodup() {
    var got = {};
    for (var l = 0; l < tmp.length; l++) {
      if (got[tmp[l]]) return false;
      got[tmp[l]] = true;
    }
    return true;
  }
  function iter(col, done) {
    var l, rr;
    if (col === len) {
      if (nodup()) {
        rr = [];
        for (l = 0; l < tmp.length; l++) rr.push(c[tmp[l]]);
        r.push(rr);
      }
    } else {
      for (l = 0; l < len; l++) {
        tmp[col] = l;
        iter(col + 1);
      }
    }
  }
  iter(0);
  return r;
}

function getSeedOrder(seedPhrase) {
  const phrases = combo(seedPhrase);
  console.log("Anzahl aller Kombinationen: ", phrases.length);
  const result = [];
  for (let i = 0; i < phrases.length; i++) {
    phrases[i] = phrases[i].concat(["brisk", "omit"]);
    const phrase = phrases[i].join(" ");
    if (utils.HDNode.isValidMnemonic(phrase)) {
      result.push(phrases[i]);
    }
  }
  return result;
}

console.time("Seed generating");
// const phrases = getSeedOrder([
//   "client",
//   "someone",
//   "shop",
//   "share",
//   "clerk",
//   "basic",
//   "gold",
//   "click",
//   "scale",
//   "member"
// ]);
console.timeEnd("Seed generating");
// console.log("Anzahl der möglichen Seeds: ", phrases.length);
// const hdnodes = phrases.map((phrase) =>
//   utils.HDNode.fromMnemonic(phrase.join(" "))
// );
// console.log("seed phrase: \n", hdnodes);

const hdWallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
const path = "m/44'/60'/0'/0/0";
const wallet = hdWallet.derivePath(path).getWallet();
const address = `0x${wallet.getAddress().toString("hex")}`;

console.log("Address:", address);

console.log((await web3.eth.getBalance(address)) / 10 ** 18);
