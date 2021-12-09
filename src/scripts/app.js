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

/**--------------------------Global variables and requires------------------------------------------------------- */

const { ExplorerApi } = require("atomicassets");
const SecureLS = require("secure-ls");

const DOMPurify = require("dompurify");
const api = new ExplorerApi(ATOMIC_MAIN_URL, "atomicassets", {
  fetch,
});
const waxjs = require("@waxio/waxjs/dist");
const wax = new waxjs.WaxJS(WAX_MAINNET, null, null, false);

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

// Rate is null (at the beginning)
var bSec = null;
var templates = [];

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
  for (let i = 0; i < ITEMS.length; i++) {
    const id = ITEMS[i].template_id;
    const name = ITEMS[i].name;
    const data = (await api.getTemplate(COLLECTION, id)).immutable_data;
    const base_price = data.price;
    const result = { name, id, data, base_price };
    templates.push(result);
  }
}

/**
 * Inits the interval which messures how long ago the last click was
 */

function initIntervalLastclick() {
  setInterval(function () {
    var currentTime = Date.now();

    var timeBetweenCLicks = currentTime - lastClick;

    if (Math.floor(timeBetweenCLicks / 1000) > 120) {
      enableClickMultiplier = false;
      amountOfClicks = 0;
    } else {
      enableClickMultiplier = true;
    }
  }, 1000);
}

/**
 * Inits the interval which calculates the current bitcoinrate again
 */

function initIntervalNewBitcoinRate() {
  setInterval(async function () {
    await Game.setBtcRate();
  }, 15000);
}

/**
 *
 *  <-- Setting up the game´s functions -->
 *
 */

// Game variable which will contain any needed major function or needed variables for the game.
var Game = {};

/**
 * shows the calculated bitcoinrate in white colour if the player owns atleast 1 corresponding NFT
 * @param $element the current html element
 * @param itemrateString the value to be shown as string
 */
function showItemRate($element, rate, level) {
  $element.children()[3].style.display = "block";
  if (level == 0) {
    $element.children()[3].style.color = "black";
    $element.children()[3].style.textShadow = "none";
    $element.children()[3].style.opacity = 0.5;
  } else {
    $element.children()[3].style.color = "white";
    $element.children()[3].style.textShadow =
      "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black,\n" +
      "  -1px -1px 1px black";
    $element.children()[3].style.opacity = 1;
  }
  const UNIT = rate > 0.1 ? " BTC/SEC" : " SATOSHI/SEC";
  $element.children()[3].textContent = "Rate: " + roundNumber(rate) + UNIT;
}

/**
 * calculates the current price of an item and shows it
 * @param $element html element for the current element
 * @param level of the current item
 * @param template template of the current item
 */
function showNewPrice($element, level, template) {
  // Calculation of the price
  let multiplier = template.data["price_multiplier\t"];
  let calculation =
    parseFloat(template.base_price) * Math.pow(multiplier, parseInt(level));
  template.data.price = calculation;
  const UNIT = calculation > 0.1 ? " Bitcoins" : " Satoshi";
  $element.children()[2].textContent =
    "Buy: " + roundNumber(calculation) + UNIT;
}

async function fetchVariables(i) {
  let level = 0;
  let itemAmount = 0;

  const asset = await Game.getItem(ITEMS[i].name);
  const template = templates.find((val) => val.name === ITEMS[i].name);

  let bits_per_sec = parseFloat(template.data.rate);

  if (asset !== undefined) {
    itemAmount = asset.assets;
    level = (await findAssetID(template.id, wax.userAccount))[1].level;
  }
  return { level, template, itemAmount, bits_per_sec };
}

/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 * Or whenever this is called
 */
Game.setBtcRate = async function () {
  let newRate = 0;
  for (let i = 0; i < ITEMS.length; i++) {
    const values = await fetchVariables(i);

    //values of the current item
    const level = parseInt(values.level);
    const template = values.template;
    let rate = values.bits_per_sec;
    let itemAmount = values.itemAmount;

    // HTML element on the game page
    var $element = $("#" + ITEMS[i].name);

    // Writing the amount on the page at the items element
    $element.children()[1].children[0].textContent = "LEVEL: " + itemAmount;
    showNewPrice($element, level, template);

    if (level > 0) {
      $element.children()[1].children[0].textContent = "LEVEL: " + level + " +";
      showItemRate($element, rate * level, level);
      // Calculating the rate
      newRate += rate * level;
    } else {
      showItemRate($element, rate, level);
    }
  }
  //bitcoinRate *= getClickMultiplier();
  newRate *= 1 + multiplier;
  Game.updateBitcoinRateView(newRate);
  bitcoinRate = newRate;
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.updateBitcoinRateView = function () {
  if (bitcoinRate >= 1000000) {
    $(".bSecRateNumber").text(
      "Rate: " + bitcoinRate.toFixed(0).optimizeNumber() + "\n BTC/SEC"
    );
  } else if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(0) + "\n BTC/SEC");
  } else if (bitcoinRate >= 0.1) {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(2) + "\n BTC/SEC");
  } else {
    let satoshi = bitcoinRate * Math.pow(10, 8);
    const DIGITS = satoshi > 1 ? 1 : 3;
    $(".bSecRateNumber").text(
      "Rate: " + satoshi.toFixed(DIGITS).toString() + "\n SATOSHI/SEC"
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
  if (!mute) audio.play();

  //after 50ms reenable this function -> max. 20 Clicks per Second
  setTimeout(function () {
    disable = false;
    $(".bitcoin").click(incrementBitcoin);
  }, 50);
}

/**
 * checks if this account owns a NFT fitting to the templateID. If the account has multiple it returns the one with the
 * highest level.
 * @param templateID of the asset to be found
 * @param account which owns the asset
 * @returns {Promise<[{id: string}, {level: any}]>} the current id and level of the found asset
 */
async function findAssetID(templateID, account) {
  try {
    let assets;
    let id;
    let level = 0;
    while (id == undefined) {
      assets = await api.getAssets({
        owner: account,
        collection_name: COLLECTION,
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

    var returnValues = [{ id }, { level: level }];
    return returnValues;
  } catch (e) {
    alert("Please reload the page!");
  }
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
  const success = await mintModule.updateAsset(
    wax.userAccount,
    asset_id,
    level,
    bitcoins,
    showItems,
    wax
  );
  return success;
}

/**
 * mints a asset
 * @param template of the asset to be minted
 * @returns {Promise<void>}
 */
async function mintAsset(template) {
  const success = await mintModule.mint(
    template.id,
    wax.userAccount,
    bitcoins,
    showItems,
    wax
  );
  if (!success) return false;
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
      showItems,
      wax
    );
  }
  return true;
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
  let success;
  if (parseFloat(bitcoins.toFixed(8)) >= price) {
    showItems("none");
    if (itemAmount < 1) {
      success = await mintAsset(template);
    } else {
      success = await upgradeAsset(template);
    }
    if (!success) return;
    //await waitForTransaction(bitcoinRate);
    await Game.setBtcRate();
    Game.updateBitcoinRateView(bitcoinRate);
    substractBitcoins(price);
    showItems("block");
  }
}

function initOnClicks() {
  let items =
    ".purchaseItemCommon, .purchaseItemRare,.purchaseItemLegendary,.purchaseItemUltimate";
  // If any item from the list was clicked...
  $(items).click(async function () {
    await startMinting.call(this);
  });
  let preUpgrade = "";
  let upgradeDisplay = "";
  $(items).bind("mouseover", (e) => {
    let lvlDisplay = $(e.currentTarget).find(".itemHeadline").text();
    lvlDisplay = lvlDisplay.replace(/[^0-9]/g, "");

    const level = parseInt(lvlDisplay);
    const rateDisplay = $(e.currentTarget).find(".itemPrice:last-child");

    preUpgrade = rateDisplay.text();
    upgradeDisplay = preUpgrade.replace(/[^0-9\.]?/g, "");

    let rate = ((parseFloat(upgradeDisplay) * (level + 1)) / level).toFixed(2);
    const UNIT = preUpgrade.includes("BTC") ? " BTC/SEC" : " SATOSHI/SEC";
    if (level > 0)
      rateDisplay.css({ color: "lightgreen" }).text("Rate: " + rate + UNIT);
  });
  $(items).bind("mouseout", (e) => {
    let lvlDisplay = $(e.currentTarget).find(".itemHeadline").text();
    lvlDisplay = lvlDisplay.replace(/[^0-9]/g, "");
    const level = parseInt(lvlDisplay);

    const rateDisplay = $(e.currentTarget).find(".itemPrice:last-child");
    if (level > 0) rateDisplay.css({ color: "white" }).text(preUpgrade);
  });
}

/**
 * <-- Now do everything -->
 */

// Doing everything here when the game is ready to be used.
async function setup() {
  // Stating the interval with the calculated Bitcoin/second rate.
  bSec = setInterval(function () {
    Game.bSecFunction(bitcoinRate);
  }, 1000);

  // Write the version into the .version span element
  $(".version").text(GameConst.VERSION);
  // Write the bitcoin per second rate into the .bSecRateNumber span element

  // If clicked on the big Bitcoin
  $(".bitcoin").click(incrementBitcoin);

  initOnClicks();

  initIntervals();
  leaderboardModule.initLeaderboard();
  await Game.setBtcRate();
  Game.updateBitcoinRateView(bitcoinRate);
  displayBitcoin(bitcoins);
  $(".bitcoin").removeClass("unclickable");
}

/**
 * get a item with the matching name
 * @param id: name of the item
 * @returns {Promise<T>} the found item
 */
Game.getItem = async function (id) {
  var assets = (await api.getAccount(wax.userAccount)).templates;
  const item = ITEMS.find((val) => {
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
  document.getElementById("itemList").style.display = state;
  const loadingState = state === "none" ? "block" : "none";
  document.getElementById("Loading").style.display = loadingState;
}

/**
 * displays the current bitcoin and satoshi amount
 * @param bitcoins current bitcoin amount
 */
function displayBitcoin(bitcoins) {
  if (bitcoins < 1) {
    $(".bitcoinAmount").text(roundNumber(bitcoins) + " \nSATOSHI");
  } else {
    $(".bitcoinAmount").text(roundNumber(bitcoins) + " \nBTC");
  }
}

/**
 * Login via WaxCloudWallet
 * @returns {Promise<boolean>}
 */
async function login() {
  try {
    if (wax.userAccount === undefined) {
      await wax.login();
    }
    return true;
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
  $("#loginWaxWallet").css({ display: "none" });
  document.getElementById("itemList").style.display = "none";
  const success = await login();
  if (success) {
    const initSuccess = await init();
    if (initSuccess) {
      showItems("block");
    } else {
      await sleep(1000);
      $("#loginWaxWallet").css({ display: "block" });
    }
  } else {
    $("#loginWaxWallet").css({ display: "block" });
  }
};

/**
 * ------------------------------------------------Donation-------------------------------------------------------------
 */

document.getElementById("donateButton").onclick = async function () {
  await donationModule.showDialog(dp, wax);
};

/**
 * On click function for a button to show the leaderboard
 * @returns {Promise<void>}
 */
document.getElementById("lbButton").onclick = async () => {
  await leaderboardModule.showLeaderBoard(
    api,
    templates,
    ITEMS,
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
    "Url: " + url + " copied to clipboard"
  );
}

/**
 * -----------------------------------------------Mute/Unmute Button---------------------------------------------------------------
 */

var mute = ls.get("mute") || false;
let msg = !mute ? "MUTE" : "UNMUTE";
$("#muteButton").text(msg);
$("#muteButton").click(() => {
  let msg = mute ? "MUTE" : "UNMUTE";
  $("#muteButton").text(msg);
  mute = !mute;
  ls.set("mute", mute);
});

/**
 * ---------------------------------------------Animated Message--------------------------------------------------------
 */

/**
 * rounds or adds a unit type to a number
 * @param value value to be rounded/shortened
 * @returns {string} the value converted to a fitting string
 */
function roundNumber(num) {
  let value;
  if (num > 1e6) {
    let bitcoinUnitNumber = num.optimizeNumber();
    value = bitcoinUnitNumber;
  } else if (num >= 1000) {
    value = num.toFixed(0).toString();
  } else if (num >= 0.1) {
    value = num.toFixed(2).toString();
  } else {
    const DIGITS = num * Math.pow(10, 8) > 1 ? 1 : 2;
    value = (num * Math.pow(10, 8)).toFixed(DIGITS).toString();
  }
  return value;
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

  img.src = "../images/btc-logo.png";
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
 * the initial setup for everything relevant for the game
 * @returns {Promise<void>}
 */
async function init() {
  const success = await hasRegistered();
  if (!success) return false;

  const wallet = ls.get("waxWallet");
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
    ls.set("verified", false);
    ls.set("bitcoins", 0);
    ls.set("waxWallet", waxWallet);

    // Write the current amount of Bitcoins on the page
  } else {
    // Get the amount of Bitcoins and parse them to a float number
    bitcoins = parseFloat(ls.get("bitcoins"));
  }
  $(".settingBtn").show();
  let hasRef = await reflinkModule.detectRef(
    dp,
    wax.userAccount,
    showItems,
    api,
    wax
  );

  if (hasRef) $("#FRIENDS").show();
  multiplier = await multiplierModule.calculateMultiplier(wax.userAccount, api);

  await setup();
  return true;
}

/**
 * init all the intervals
 */
function initIntervals() {
  initIntervalLastclick();
  initIntervalNewBitcoinRate();
  //initIntervalShowNewRate();
  setInterval(function () {
    tabModule.detectTab();
  }, 5000);
}

async function registerUser() {
  try {
    const action = {
      account: CONTRACT_ADDRESS,
      name: "login",
      authorization: [{ actor: wax.userAccount, permission: "active" }],
      data: {
        player: wax.userAccount,
      },
    };
    await wax.api.transact(
      {
        actions: [action],
      },
      {
        blocksBehind: 3,
        expireSeconds: 120,
      }
    );
    return await sendOneWax();
  } catch (e) {
    const msg = e.message.toString();
    if (msg.includes("billed CPU time")) {
      alert("Not enough CPU to push action!");
      return false;
    }
    return false;
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
        to: CONTRACT_ADDRESS,
        quantity: "1.00000000 WAX",
        memo: "",
      },
    };
    await wax.api.transact(
      {
        actions: [action],
      },
      {
        blocksBehind: 3,
        expireSeconds: 120,
      }
    );
    return true;
  } catch (e) {
    const msg = e.message.toString();
    if (msg.includes("billed CPU time")) {
      alert("Not enough CPU to push action!\n" + msg);
      return false;
    }
    return false;
  }
}

async function hasRegistered() {
  try {
    const action = {
      account: "satoshiclick",
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
    await wax.api.transact(
      {
        actions: [action],
      },
      {
        blocksBehind: 3,
        expireSeconds: 120,
      }
    );
    return true;
  } catch (e) {
    const msg = e.message.toString();
    if (msg.includes("Not registered!")) {
      return await registerUser();
    } else if (msg.includes("payment")) {
      return await sendOneWax();
    } else if (msg.includes("Safe exit")) {
      return true;
    }
    return false;
  }
}

api.getSchemas({ collection_name: COLLECTION }).then(console.log);
