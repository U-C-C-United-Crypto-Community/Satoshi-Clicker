/**Satoshi Clicker Game
    Copyright (C) 2021  daubit gmbh

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/**--------------------------Global varibles  and requires------------------------------------------------------- */

const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const SecureLS = require("secure-ls");
const waxjs = require("@waxio/waxjs/dist");
const DOMPurify = require("dompurify");
const api = new ExplorerApi(ATOMIC_TEST_URL, "atomicassets", {
  fetch,
});

const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig"); // development only
const { TextEncoder, TextDecoder } = require("text-encoding"); //node only

const defaultPrivateKey = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr";
const signatureProvider = new JsSignatureProvider([defaultPrivateKey]);
const rpc = new JsonRpc("http://127.0.0.1:8888", { fetch }); //required to read blockchain state
const eosApi = new Api({
  rpc,
  signatureProvider,
  textDecoder: new TextDecoder(),
  textEncoder: new TextEncoder(),
}); //required to submit transactions

var wax = new waxjs.WaxJS(WAX_TESTNET, null, null, false);

const detectEthereumProvider = require("@metamask/detect-provider");
const dp = new DOMPurify();
const ls = new SecureLS();
var multiplier = 0.0;

var bitcoins = 0;
var bitcoinRate = 0;
var currentUser = null;
var clickValue = 0;

var disable = false;
var amountOfClicks = 0;
var lastClick = Date.now();
var enableClickMultiplier = false;
var waxWallet;

var templates = [];
const items = TEST_ITEMS;

const multiplierModule = require("./multiplier");
const reflinkModule = require("./reflink");
const leaderboardModule = require("./leaderboard");
const airdropModule = require("./airdrop");
const donationModule = require("./donation");
const mintModule = require("./minting");
const tabModule = require("./detectTabs");

/**
 *--------------------------------- Game Functionality -------------------------------------
 */

async function getTemplates() {
  for (let i = 0; i < items.length; i++) {
    const id = items[i].template_id;
    const name = items[i].name;
    const data = (await api.getTemplate("waxbtcclickr", id)).immutable_data;
    const base_price = data.price;

    const result = { name, id, data, base_price };
    templates.push(result);
  }
}

// Rate is null (at the beginning)
var bSec = null;

/**
 * inits the interval which messures how long ago the last click was
 */

function initIntervalLastclick() {
  setInterval(function () {
    var currentTime = Date.now();

    var timeBetweenCLicks = currentTime - lastClick;

    if (Math.floor(timeBetweenCLicks / 1000) > 30) {
      enableClickMultiplier = false;
      amountOfClicks = 0;
    } else {
      enableClickMultiplier = true;
    }
  }, 1000);
}

/**
 * inits the interval which calculates the current bitcoinrate again
 */

function initIntervalNewBitcoinRate() {
  setInterval(async function () {
    await Game.setBitcoinPerSecondRateAtBeginning();
  }, 15000);
}

/**
 * Interval to visiually update the bitcoinrate
 */
function initIntervalShowNewRate() {
  setInterval(function () {
    Game.setNewBitcoinRate();
  }, 1000);
}

/**
 * init all the intervals
 */
function initIntervals() {
  initIntervalLastclick();
  initIntervalNewBitcoinRate();
  initIntervalShowNewRate();
  setInterval(function () {
    tabModule.detectTab();
  }, 5000);
}

/**
 * the initial setup for everything relevant for the game
 * @returns {Promise<void>}
 */
async function init() {
  await checkIfUserRegistered();

  /* get the last bitcoin amount from local storage  */
  const keys = ls.getAllKeys();
  if (keys.length == 0 || !keys.includes("bitcoins")) ls.set("bitcoins", 0);

  const wallet = localStorage.getItem("waxWallet");
  const btcs = ls.get("bitcoins");

  await getTemplates();
  if (
    btcs === null ||
    btcs === "NaN" ||
    wallet === null ||
    wallet !== wax.userAccount
  ) {
    // Bitcoins are 0
    bitcoins = 0;
    waxWallet = wax.userAccount;

    // Set the localStorage Item for the first time
    ls.clear();
    localStorage.clear();

    ls.set("bitcoins", 0);

    localStorage.setItem("waxWallet", waxWallet);

    // Write the current amount of Bitcoins on the page
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  } else {
    // Get the amount of Bitcoins and parse them to a float number
    bitcoins = parseFloat(ls.get("bitcoins"));
    $(".bitcoinAmount").text("loading...");
    $(".satoshiAmount").text("loading...");
  }
  document.getElementById("lbButton").style.display = "block";
  document.getElementById("refButton").style.display = "block";
  await reflinkModule.detectRef(ls, dp, wax.userAccount, showItems, api);
  initIntervals();
  multiplier = await multiplierModule.calculateMultiplier(wax.userAccount, api);
}
/**
 *
 *  <-- Setting up the game´s functions -->
 *
 */

// Game variable which will contain any needed major function or needed variables for the game.
var Game = {};

/**
 * Calculating every price for the items when the game was started (and if there are any items).
 *
 * @param element {HTMLElement} - The HTML element of the item on the game page
 * @param price {Number} - The price of the item, got from the items Object
 * @param itemAmount {Number} - The current amount of the item, saved in the localStorage
 */

Game.setPriceAtGameBeginning = async function ($element, price, itemAmount) {
  const id = $element.attr("id");
  var itemAmount = 0;
  const asset = await Game.getItem(id);
  if (asset !== undefined) {
    itemAmount = asset.assets;
  }

  const template = templates.find((val) => val.name === id).data;
  var multiplier = template.price_multiplier;

  // Calculate the new price -> price * multiplier^itemAmount
  var calculation =
    parseFloat(price) * Math.pow(multiplier, parseInt(itemAmount));

  $element.children()[2].textContent =
    "Buy: " + roundNumber(calculation) + " Bitcoins";

  // Showing the actual price
  //element.children()[2].textContent = calculation + " Bitcoins";

  // Set the data-price attribute with the new price
  $element.attr("data-price", calculation.toString());
};

/**
 * shows the calculated bitcoinrate in white colour if the player owns atleast 1 corresponding NFT
 * @param $element the current html element
 * @param itemrateString the value to be shown as string
 */
function showNewItemRate($element, itemrateString) {
  $element.children()[3].style.color = "white";
  $element.children()[3].textContent = "Rate: " + itemrateString + " B/SEC";
  $element.children()[3].style.textShadow =
    "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black,\n" +
    "  -1px -1px 1px black";
  $element.children()[3].style.display = "block";
}

/**
 * shows the standard bitcoinrate of an item as colour black to show that the player doesnt have the NFT yet
 * @param $element current element
 * @param bits_per_sec_string the standard bitcoinrate of the item
 */
function showNormalItemrate($element, bits_per_sec_string) {
  $element.children()[3].style.color = "black";
  $element.children()[3].style.textShadow = "none";
  $element.children()[3].textContent =
    "( Rate: " + bits_per_sec_string + " B/SEC )";
  $element.children()[3].style.display = "block";
}

/**
 * calculates the current price of an item and shows it
 * @param template template of the current item
 * @param level of the current item
 * @param $element html element for the current element
 */
function showNewPrice(template, level, $element) {
  // Calculation of the price
  var multiplier = template.data.price_multiplier;
  var calculation =
    parseFloat(template.base_price) * Math.pow(multiplier, parseInt(level));
  template.data.price = calculation;

  $element.children()[2].textContent =
    "Buy: " + roundNumber(calculation) + " Bitcoins";
}

async function fetchVariables(level, i, currentAsset) {
  level = 0;
  const asset = await Game.getItem(items[i].name);
  const template = await templates.find((val) => val.name === items[i].name);

  let itemAmount = 0;
  let bits_per_sec = 0;
  bits_per_sec = parseFloat(template.data.rate);

  if (asset !== undefined) {
    itemAmount = asset.assets;
    currentAsset = await findAssetID(template.id, wax.userAccount);
    level = currentAsset[1].level;
  }
  return { level, template, itemAmount, bits_per_sec, currentAsset };
}

/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 * Or whenever this is called
 */
Game.setBitcoinPerSecondRateAtBeginning = async function () {
  var newbitcoinRate = 0;
  var currentAsset;
  var level;
  for (let i = 0; i < items.length; i++) {
    const values = await fetchVariables(level, i, currentAsset);

    //values of the current item
    level = values.level;
    const template = values.template;
    let itemAmount = values.itemAmount;
    let bits_per_sec = values.bits_per_sec;
    currentAsset = values.currentAsset;

    // HTML element on the game page
    var $element = $("#" + items[i].name);

    // Writing the amount on the page at the item´s element
    var bits_per_sec_string = roundNumber(bits_per_sec);
    $element.children()[1].children[0].textContent = "LEVEL: " + itemAmount;
    showNormalItemrate($element, bits_per_sec_string);
    showNewPrice(template, level, $element);

    if (level > 0) {
      $element.children()[1].children[0].textContent = "LEVEL: " + level + " +";

      var itemrate = level * bits_per_sec;
      var itemrateString = roundNumber(itemrate);

      showNewItemRate($element, itemrateString);

      // Calculating the rate
      newbitcoinRate = newbitcoinRate + itemrate;
    }
  }
  bitcoinRate = newbitcoinRate;
  bitcoinRate *= getClickMultiplier();
  bitcoinRate *= 1 + multiplier;
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function () {
  if (bitcoinRate >= 1000000) {
    $(".bSecRateNumber").text(
      "Rate: " + bitcoinRate.toFixed(0).optimizeNumber()
    );
  } else if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text(
      "Rate: " + bitcoinRate.toFixed(0) + "\n BITCOINS/SEC"
    );
  } else if (bitcoinRate >= 1) {
    $(".bSecRateNumber").text(
      "Rate: " + bitcoinRate.toFixed(2) + "\n BITCOINS/SEC"
    );
  } else {
    $(".bSecRateNumber").text(
      "Rate: " + bitcoinRate.toFixed(10) + "\n BITCOINS/SEC"
    );
  }
};
/**
 * The function which adds new generated Bitcoins to the current Bitcoin amount.
 *
 * @param rate - The Bitcoin per second rate; Needed for adding the generated Bitcoins every second
 */
Game.bSecFunction = function () {
  bitcoins = bitcoins + bitcoinRate;
  displayBitcoin(bitcoins);
  ls.set("bitcoins", bitcoins.toString());
};

/**
 * Stops the B/sec interval.
 */
Game.stopBsec = function () {
  clearInterval(bSec);
};

/**
 * Function for optimizing the number with an unit for displaying it on the screen.
 *
 * @returns {string} An optimized number as a string with its unit
 */
Game.optimizeNumber = function () {
  if (this >= 1e6) {
    let number = parseFloat(this);
    let unit =
      Math.floor(
        parseFloat(
          number.toExponential(0).toString().replace("+", "").slice(2)
        ) / 3
      ) * 3;
    var num = (this / ("1e" + unit)).toFixed(2);
    var unitname = UNITS[Math.floor(unit / 3) - 1];
    return num + " " + unitname;
  }
  return this.toLocaleString();
};

Number.prototype.optimizeNumber = Game.optimizeNumber;
String.prototype.optimizeNumber = Game.optimizeNumber;

/**
 * increments the bitcoin value after a click on the bitcoin image
 * @returns {function(): void}
 */
function incrementBitcoin() {
  return function () {
    lastClick = Date.now();
    amountOfClicks++;

    //disable this function + the message pop up
    disable = true;
    $(".bitcoin").off("click");

    //increase and display the new bitcoin amount: Clickvalue = 1 Satoshi + 0.1% of the current bitcoinrate
    clickValue = bitcoinRate * 0.001 + 0.00000001;
    bitcoins = bitcoins + clickValue;

    displayBitcoin(bitcoins);

    ls.set("bitcoins", bitcoins.toString());

    //play the audio for the click
    var audio = document.getElementById("audio");
    audio.play();

    //after 50ms reenable this function -> max. 20 Clicks per Second
    setTimeout(function () {
      disable = false;
      $(".bitcoin").click(incrementBitcoin());
    }, 50);
  };
}

/**
 * checks if this account owns a NFT fitting to the templateID. If the account has multiple it returns the one with the
 * highest level.
 * @param templateID of the asset to be found
 * @param account which owns the asset
 * @returns {Promise<[{id: string}, {level: any}]>} the current id and level of the found asset
 */
async function findAssetID(templateID, account) {
  var assets;
  var id;
  var level = 0;
  while (id == undefined) {
    assets = await api.getAssets({
      owner: account,
      collection_name: "betawaxclick",
      template_id: templateID,
    });

    for (var i = 0; i < assets.length; i++) {
      if (
        assets[i].mutable_data.level > level ||
        assets[i].mutable_data.level == undefined
      ) {
        id = assets[i].asset_id;
        if (assets[i].mutable_data.level == undefined) level = 0;
        else level = assets[i].mutable_data.level;
      }
    }
    //wait because of rate limiting
    await sleep(1000);
  }

  var returnValues = [{ id: id }, { level: level }];
  return returnValues;
}

/**
 * upgrades the level of an asset
 * @param template template of the asset
 * @returns {Promise<void>} -
 */
async function upgradeAsset(template) {
  bitcoins += 0.00000001;
  var new_asset = await findAssetID(template.id, wax.userAccount);
  var asset_id = new_asset[0].id;
  var level = parseInt(new_asset[1].level) + 1;
  await mintModule.updateAsset(
    wax.userAccount,
    asset_id,
    level,
    bitcoins,
    showItems
  );
}

/**
 * mints a asset
 * @param template of the asset to be minted
 * @returns {Promise<void>}
 */
async function mintAsset(template) {
  await mintModule.mint(template.id, wax.userAccount, bitcoins, showItems);
  var new_asset = await findAssetID(template.id, wax.userAccount);
  var asset_id = new_asset[0].id;
  var level = parseInt(new_asset[1].level) + 1;
  if (level == 1) {
    bitcoins += 0.00000001;
    await mintModule.updateAsset(
      wax.userAccount,
      asset_id,
      level,
      bitcoins,
      showItems
    );
  }
}

/**
 * substract the price from the current bitcoin amount
 * @param price of the bought item
 */
function substractBitcoins(price) {
  // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
  bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

  // Save the new amount of Bitcoins in the localStorage storage
  ls.set("bitcoins", bitcoins.toString());
  displayBitcoin(bitcoins);
}

/**
 * starts minting the clicked item if the player owns enough bitcoins
 * @returns {Promise<void>}
 */
async function startMinting() {
  //get which item was clicked on
  const id = $(this).attr("id");
  var itemAmount = 0;
  const asset = await Game.getItem(id);
  if (asset !== undefined) {
    itemAmount = asset.assets;
  }

  const template = templates.find((val) => val.name === id);
  const { price } = template ? template.data : Number.MAX_VALUE;

  if (parseFloat(bitcoins.toFixed(8)) >= price) {
    showItems("none");
    if (itemAmount < 1) {
      await mintAsset(template);
    } else {
      await upgradeAsset(template);
    }
    substractBitcoins(price);
    await waitForTransaction(bitcoinRate);
  }
}

function initOnClicks() {
  // If any item from the list was clicked...
  $(".purchaseItemCommon").click(async function () {
    await startMinting.call(this);
  });
  $(".purchaseItemRare").click(async function () {
    await startMinting.call(this);
  });
  $(".purchaseItemLegendary").click(async function () {
    await startMinting.call(this);
  });
  $(".purchaseItemUltimate").click(async function () {
    await startMinting.call(this);
  });
}

/**
 * <-- Now do everything -->
 */

// Doing everything here when the game is ready to be used.
function setup() {
  $(document).ready(async function () {
    // Stating the interval with the calculated Bitcoin/second rate.
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);

    // Write the version into the .version span element
    $(".version").text(GameConst.VERSION);
    // Write the bitcoin per second rate into the .bSecRateNumber span element
    $(".bSecRateNumber").text(roundNumber(bitcoinRate));
    // If clicked on the big Bitcoin
    $(".bitcoin").click(incrementBitcoin());
    initOnClicks();
  });
}

/**
 * get a item with the matching name
 * @param id: name of the item
 * @returns {Promise<T>} the found item
 */
Game.getItem = async function (id) {
  var assets = (await api.getAccount(wax.userAccount)).templates;
  const item = items.find((val) => {
    return val.name === id;
  });
  const asset = assets.find((val) => {
    return val.template_id === item.template_id;
  });
  return asset;
};

/**
 * either shows or hides the buylist
 * @param state none for hidden, block for visible
 */
function showItems(state) {
  document.getElementById("purchaseList").style.display = state;
  const loadingState = state === "none" ? "block" : "none";
  document.getElementById("Loading").style.display = loadingState;
}

/**
 * displays the current bitcoin and satoshi amount
 * @param bitcoins current bitcoin amount
 */
function displayBitcoin(bitcoins) {
  $(".bitcoinAmount").text(roundNumber(bitcoins));
  $(".satoshiAmount").text(roundNumber(bitcoins * 100000000));
}
/**
 * Waits for the NFT to finish loading
 * @param {number} oldBitcoinRate
 */
async function waitForTransaction(oldBitcoinRate) {
  showItems("none");
  Game.setNewBitcoinRate();
  setTimeout(() => {
    if (oldBitcoinRate === bitcoinRate) {
      waitForTransaction(oldBitcoinRate);
      return;
    }

    showItems("block");
  }, 5000);
}

/**
 * Login via WaxCloudWallet
 * @returns {Promise<boolean>}
 */
async function login() {
  try {
    if (wax.userAccount === undefined) {
      await wax.login();
      await init();
      await Game.setBitcoinPerSecondRateAtBeginning();
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

/**
 * login with wax cloud wallet
 * @returns {Promise<void>}
 */
document.getElementById("loginWaxWallet").onclick = async () => {
  document.getElementById("loginWaxWallet").style.display = "none";
  document.getElementById("loginAnchorWallet").style.display = "none";

  showItems("none");
  const success = await login();
  if (success) {
    makePurchaselist();
    return;
  }

  showItems("block");
  document.getElementById("loginWaxWallet").style.display = "none";
  document.getElementById("loginAnchorWallet").style.display = "block";
};

/**
 * Send transaction to verify for whitelisting -> freibier airdrop
 */

document.getElementById("verifyWaxWallet").onclick = verifyWaxWallet;

async function verifyWaxWallet() {
  const provider = await detectEthereumProvider();
  if (provider === window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      currentUser = accounts[0];
      const contract = new web3.eth.Contract(
        waxWalletCollector,
        waxWalletCollectorAddress
      );
      await contract.methods
        .collect(wax.userAccount)
        .send({ from: currentUser });
    } catch (err) {
      console.log(err);
    }
  }
}

/**
 * ------------------------------------------------Donation-------------------------------------------------------------
 */

document.getElementById("donateButton").onclick = async function () {
  await donationModule.showDialog(dp, wax);
};

/**
 * ------------------------------------------------Airdrop-------------------------------------------------------------
 */

document.getElementById("verifyCollection").onclick = async function () {
  await airdropModule.verifyCollection(api, wax.userAccount);
};

/**
 * --------------------------------------------------Leaderboard--------------------------------------------------------
 */

/**
 * On click function for a button to show the leaderboard
 * @returns {Promise<void>}
 */
document.getElementById("lbButton").onclick = async () => {
  await leaderboardModule.showLeaderBoard(
    api,
    templates,
    items,
    multiplierModule,
    roundNumber,
    findAssetID
  );
};

/**
 *
 * @param ms how many milliseconds the program should sleep 1000ms = 1s
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * -----------------------------------------------Reflink---------------------------------------------------------------
 */

document.getElementById("refButton").onclick = generateRefLink;

/**
 * function to generate a reflink
 */

function generateRefLink() {
  let url = new URL(window.location.href);

  url.searchParams.set("ref", wax.userAccount);
  navigator.clipboard.writeText(url);
  airdropModule.showVerificationDialog(
    "",
    "Url: " + url + " is also copied to the clipboard"
  );
}

/**
 * ---------------------------------------------Animated Message--------------------------------------------------------
 */

/**
 * rounds or adds a unit type to a number
 * @param thisValue value to be rounded/shortened
 * @returns {string} the value converted to a fitting string
 */
function roundNumber(thisValue) {
  var valueString;
  if (thisValue > 1e6) {
    let bitcoinUnitNumber = thisValue.optimizeNumber();
    valueString = bitcoinUnitNumber;
  } else if (thisValue >= 1000) {
    valueString = thisValue.toFixed(0).toString();
  } else if (thisValue >= 1) {
    valueString = thisValue.toFixed(2).toString();
  } else if (thisValue < 1 && thisValue.toString().includes("e")) {
    let decimalAmount = parseInt(thisValue.toString().split("-")[1]);
    decimalAmount = decimalAmount <= 10 ? decimalAmount : 10;
    valueString = thisValue.toFixed(decimalAmount).toString();
  } else {
    valueString = thisValue.toFixed(8).toString();
  }
  console.log(valueString)
  return valueString;
}

/**
 * creates a animated spawns which holds the bitcoin amount
 * @param event click on the bitcoin
 * @param valueString current amount of bitcoin gained per click
 * @param maingame div to add the span to
 * @returns {HTMLSpanElement} the created span
 */

function createSpan(event, valueString, maingame) {
  var Span = document.createElement("span");

  Span.style.display = "inline-block";
  Span.style.fontFamily = "Rajdhani-SemiBold";
  Span.style.fontSize = "15pt";
  Span.style.color = "white";
  Span.style.textShadow =
    "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black";
  Span.style.top = event.clientY + "px";
  Span.style.left = event.clientX + "px";
  Span.style.position = "absolute";
  Span.classList.add("w3-animate-bottom");
  Span.innerText = "+" + valueString + " Satoshi";
  Span.style.pointerEvents = "none";

  maingame.appendChild(Span);
  return Span;
}

/**
 *
 * @param event triggered after a click on the bitcoin
 * @param maingame div to add the image to
 * @returns {HTMLImageElement} the created image
 */

function createImage(event, maingame) {
  var img = document.createElement("img");

  img.src = "../images/pngegg.png";
  img.style.maxHeight = "20px";
  img.style.maxWidth = "20px";
  img.style.width = "auto";
  img.style.height = "auto";
  img.style.top = event.clientY + "px";
  img.style.left = event.clientX - 25 + "px";
  img.style.position = "absolute";
  img.style.pointerEvents = "none";
  img.classList.add("w3-animate-bottom");
  img.style.display = "inline-block";
  maingame.appendChild(img);
  return img;
}

/**
 * creates a animated message which shows how many bitcoins you gained per click
 * @param event click on the bitcoin
 * @returns {Promise<void>}
 */

async function animateMessage(event) {
  if (!disable) {
    var maingame = document.body;
    var img = createImage(event, maingame);

    var valueString = roundNumber(clickValue * 100000000);
    var Span = createSpan(event, valueString, maingame);

    await sleep(750);
    maingame.removeChild(Span);
    maingame.removeChild(img);
    img.remove();
    Span.remove();
  }
}
document
  .getElementsByClassName("bitcoin")[0]
  .addEventListener("click", animateMessage);

/**
 * ------------------------------------------Anchor---------------------------------------------------------------------
 */

// app identifier, should be set to the eosio contract account if applicable
const identifier = "waxbtcclicker";
// initialize the browser transport
const transport = new AnchorLinkBrowserTransport();
// initialize the link
const link = new AnchorLink({
  transport,
  chains: [
    {
      chainId:
        "1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4",
      nodeUrl: "https://wax.greymass.com",
    },
    {
      chainId:
        "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
      nodeUrl: "https://waxtestnet.greymass.com",
    },
  ],
});
// the session instance, either restored using link.restoreSession() or created with link.login()

/**
 * shows and setups the purchaselist
 */

function makePurchaselist() {
  for (let i = 0; i < items.length; i++) {
    document.getElementById(items[i].name).style.display = "block";
  }

  setup();
  showItems("block");

  document.getElementById("verifyWaxWallet").style.display = "none"; //show again
  document.getElementById("verifyCollection").style.display = "none"; //show again

  return;
}

/**
 * login via anchor wallet. Calls all functions to setup the game.
 * @returns {Promise<void>}
 */
async function anchorLogin() {
  try {
    await link.login(identifier).then((result) => {
      session = result.session;
      didLogin();
    });
  } catch (e) {
    document.getElementById("loginWaxWallet").style.display = "none"; //show again
    document.getElementById("loginAnchorWallet").style.display = "block";
  }

  document.getElementById("loginWaxWallet").style.display = "none";
  document.getElementById("loginAnchorWallet").style.display = "none";
  showItems("none");

  if (session) {
    //start the game
    wax.userAccount = session.auth.actor.toString();
    await init();
    await Game.setBitcoinPerSecondRateAtBeginning();

    makePurchaselist();
    return;
  }

  showItems("block");

  document.getElementById("loginWaxWallet").style.display = "none";
  document.getElementById("loginAnchorWallet").style.display = "block";
}

/**
 * called to restore a anchor session
 */
function didLogin() {
  document.body.classList.add("logged-in");
}

document.getElementById("loginAnchorWallet").onclick = anchorLogin;

/**
 * ---------------------------------------------Click Multiplier--------------------------------------------------------
 */

/**
 *  calculates the current click multiplier
 * @returns {number} current click multiplier
 */

function getClickMultiplier() {
  var multi = 0.1;
  if (enableClickMultiplier && amountOfClicks >= 10) {
    multi = amountOfClicks / 100;

    if (multi > 1) multi = 1;
  }
  return multi;
}

async function registerUser() {
  try {
    const action = {
      account: "waxclicker12",
      name: "login",
      authorization: [{ actor: wax.userAccount, permission: "active" }],
      data: {
        player: wax.userAccount,
      },
    };
    console.log(action);
    await session.transact({ action }).then(({ transaction }) => {
      console.log(`Transaction broadcast! Id: ${transaction.id}`);
    });

    await sendOneWax();
  } catch (e) {
    console.log(e.message.toString());
    if (
      e.message.toString().includes("eosio_assert_message assertion failure")
    ) {
      console.log("Already called login");
      await sendOneWax();
    } else await registerUser();
  }
}

async function sendOneWax() {
  try {
    const action = {
      account: "eosio.token",
      name: "transfer",
      authorization: [
        {
          actor: wax.userAccount,
          permission: "active",
        },
      ],
      data: {
        from: wax.userAccount,
        to: "waxclicker12", //Später smart contract Name
        quantity: "1.00000000 WAX",
        memo: "",
      },
    };
    await sleep(1000);
    await session.transact({ action }).then(({ transaction }) => {
      console.log(`Transaction broadcast! Id: ${transaction.id}`);
    });
  } catch (e) {
    if (e.message.toString().includes("User canceled request"))
      await sendOneWax();
  }
}

async function checkIfUserRegistered() {
  try {
    const action = {
      account: "waxclicker12",
      name: "checkplayer",
      authorization: [
        {
          actor: wax.userAccount,
          permission: "active",
        },
      ],
      data: {
        player: wax.userAccount,
      },
    };

    await session.transact({ action }).then(({ transaction }) => {
      console.log(`Transaction broadcast! Id: ${transaction.id}`);
    });
  } catch (e) {
    console.log(e.message.toString());
    if (e.message.toString().includes("eosio_assert_message")) {
      console.log("Didnt pay");
      await registerUser();
    } else await checkIfUserRegistered();
  }
}
