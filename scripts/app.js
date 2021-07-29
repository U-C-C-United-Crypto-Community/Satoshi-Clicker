/**--------------------------Global varibles  and requires------------------------------------------------------- */

const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const SecureLS = require("secure-ls");
const waxjs = require("@waxio/waxjs/dist");
const DOMPurify = require("dompurify");
const api = new ExplorerApi(ATOMIC_TEST_URL, "atomicassets", {
  fetch,
});

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

var templates = [];
var specialTemplates = [];
const items = TEST_ITEMS;



/**
--------------------------------- Game Functionality -------------------------------------
 */

async function getTemplates() {
  for (let i = 0; i < items.length; i++) {
    const id = items[i].template_id;
    const name = items[i].name;
    const data = (await api.getTemplate("waxbtcclickr", id)).immutable_data;

    const result = { name, id, data };
    templates.push(result);
  }
}

// Rate is null (at the beginning)
var bSec = null;

function initIntervalLastclick() {
  setInterval(function () {
    currentTime = Date.now();

    var timeBetweenCLicks = currentTime - lastClick;

    if (Math.floor(timeBetweenCLicks / 1000) > 30) {
      enableClickMultiplier = false;
      amountOfClicks = 0;
    } else {
      enableClickMultiplier = true;
    }
  }, 1000);
}

function initIntervalNewBitcoinRate() {
  setInterval(async function () {
    await Game.setBitcoinPerSecondRateAtBeginning()
  }, 10000);
}

function initIntervalShowNewRate() {
  setInterval(function () {
    Game.setNewBitcoinRate();
  }, 1000);
}

// If there is no bitcoins Item in the localStorage, create one.
function initIntervals() {
  initIntervalLastclick();
  initIntervalNewBitcoinRate();
  initIntervalShowNewRate();
}

// If there is one, do the other thing.
async function init() {
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
    console.log("Init", bitcoins);
    $(".bitcoinAmount").text("loading...");
    $(".satoshiAmount").text("loading...");
  }
document.getElementById("lbButton").style.display = "block";
document.getElementById("refButton").style.display = "block";
detectRef();
initIntervals();
multiplier = await calculateMultiplier(wax.userAccount);

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


Game.setPriceAtGameBeginning = function ($element, price, itemAmount) {
  var multiplier = GameConst.priceMultiplier;


  // Calculate the new price -> price * multiplier^itemAmount
  var calculation = (
    parseFloat(price) * Math.pow(multiplier, parseInt(itemAmount))
  );

  $element.children()[2].textContent = "Buy: " + roundNumber(calculation) + " Bitcoins";


  // Showing the actual price
  //element.children()[2].textContent = calculation + " Bitcoins";

  // Set the data-price attribute with the new price
  $element.attr("data-price", calculation.toString());
};

function showNewItemRate($element, itemrateString) {
  $element.children()[3].style.color = "white";
  $element.children()[3].textContent = "Rate: " + itemrateString + " B/SEC";
  $element.children()[3].style.textShadow = "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black,\n" +
      "  -1px -1px 1px black";
  $element.children()[3].style.display = "block";
}

function showNormalItemrate($element, bits_per_sec_string) {
  $element.children()[3].style.color = "black";
  $element.children()[3].style.textShadow = "none";
  $element.children()[3].textContent = "( Rate: " + bits_per_sec_string + " B/SEC )";
  $element.children()[3].style.display = "block";
}

/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 *
 */
Game.setBitcoinPerSecondRateAtBeginning = async function () {
  var newbitcoinRate = 0;
  for (let i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    const template = templates.find((val) => val.name === items[i].name).data;
    let itemAmount = 0;
    let bits_per_sec = 0;
    bits_per_sec = parseFloat(template.rate);
    if (asset !== undefined) {
      itemAmount = asset.assets;

    }
    // HTML element on the game page
    var $element = $("#" + items[i].name);

    // Writing the amount on the page at the item´s element
    $element.children()[1].children[0].textContent = "LEVEL: " + itemAmount;
    if (itemAmount > 0)
      $element.children()[1].children[0].textContent += " +";

      Game.setPriceAtGameBeginning(
        $element,
        parseFloat(template.price),
        parseInt(itemAmount)
      );

    itemAmount = parseInt(itemAmount);

    var itemrate = itemAmount * bits_per_sec;
    var itemrateString = roundNumber(itemrate);
    var bits_per_sec_string = roundNumber(bits_per_sec);

    if (itemrate > 0) {
      showNewItemRate($element, itemrateString);

    }
    else {
      showNormalItemrate($element, bits_per_sec_string);
    }

    // Calculating the rate
    newbitcoinRate = newbitcoinRate + itemrate;
  }
  bitcoinRate = newbitcoinRate;
  bitcoinRate *= getClickMultiplier();
  bitcoinRate *= (1 + multiplier);
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function () {
  if (bitcoinRate >= 1000000) {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(0).optimizeNumber());
  } else if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(0) + "BITCOINS/SEC");
  } else if (bitcoinRate >= 1) {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(2) + "BITCOINS/SEC");
  } else {
    $(".bSecRateNumber").text("Rate: " + bitcoinRate.toFixed(8) + "BITCOINS/SEC");
  }
};

/**
 * This function will check if there is any change in the localStorage,
 * especially looking at the item amount. So it will actually calculate every price again and
 * again. (This function should be recoded)
 *
 * TODO: Find a better way for setting the price after an item was bought.
 */
Game.setNewPrice = async function () {
  for (var i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    const template = templates.find((val) => val.name === items[i].name).data;
    var itemAmount = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
    }
    var $element = $("#" + items[i].name);
    $element.children()[3].textContent = "Level: " + itemAmount;

    // Only calculate if there is more than 0 items
    if (itemAmount > 0) {

      // Calculation of the price
      var multiplier = GameConst.priceMultiplier;
      var calculation = (
        parseFloat(template.price) * Math.pow(multiplier, parseInt(itemAmount))
      );

      $element.children()[2].textContent = "Buy: " + roundNumber(calculation) + " Bitcoins";


      // Set the data-price attribute with the new price
      $element.attr("data-price", calculation.toString());
    }
  }
};

/**
 * The function which adds new generated Bitcoins to the current Bitcoin amount.
 *
 * @param rate - The Bitcoin per second rate; Needed for adding the generated Bitcoins every second
 */
Game.bSecFunction = function (rate) {
  bitcoins = bitcoins + rate;
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

// --------------------------------------------------- //

function incrementBitcoin() {
  return function () {
    lastClick = Date.now();

    amountOfClicks++;
    disable = true;
    $(".bitcoin").off("click");


    clickValue = bitcoinRate * 0.001;
    bitcoins = bitcoins + clickValue;

    displayBitcoin(bitcoins);

    ls.set("bitcoins", bitcoins.toString());

    var audio = document.getElementById("audio");
    audio.play();

    setTimeout(function (){
      disable = false;
      $(".bitcoin").click(incrementBitcoin());

    },50);
  };
}

/**
 * starts minting the clicked item if the player owns enough bitcoins
 * @returns {Promise<void>}
 */
async function startMinting() {
  const id = $(this).attr("id");

  const template = templates.find((val) => val.name === id);
  const {price} = template ? template.data : Number.MAX_VALUE;

  if (parseFloat(bitcoins.toFixed(8)) >= price) {

    showItems("none");
     await mint(id);

    // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
    bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

    // Save the new amount of Bitcoins in the localStorage storage
    ls.set("bitcoins", bitcoins.toString());
    displayBitcoin(bitcoins);

    // Stops the interval
    Game.stopBsec();
    const oldBitcoinRate = bitcoinRate;
    await Game.setNewPrice();
    // Restarting the interval with the new rate
    await waitForTransaction(oldBitcoinRate);
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
    $(".version").text("Version " + GameConst.VERSION);
    // Write the bitcoin per second rate into the .bSecRateNumber span element
    $(".bSecRateNumber").text(roundNumber(bitcoinRate));
    // If clicked on the big Bitcoin
    $(".bitcoin").click(incrementBitcoin());
    initOnClicks();
  });
}

Game.getItem = async function (id) {
  assets = (await api.getAccount(wax.userAccount)).templates;
  const item = items.find((val) => {
    return val.name === id;
  });
  const asset = assets.find((val) => {
    return val.template_id === item.template_id;
  });
  return asset;
};

async function mint(id) {
  const item = items.find((val) => {
    return val.name === id;
  });
  const template_id = parseInt(item.template_id);
  const action = {
      account: 'waxclicker12',
      name: 'mintasset',
      authorization: [{ actor: wax.userAccount, permission: "active" }],
      data: {
      authorized_minter: "waxclicker12",
      collection_name: TEST_COLLECTION, //"waxbtcclickr",
      schema_name: "equipments",
      template_id: template_id,
      new_asset_owner: wax.userAccount
      },
  }
  session.transact({action}).then(({transaction}) => {
    console.log(`Transaction broadcast! Id: ${transaction.id}`)
  })

}

function showItems(state) {
  document.getElementById("purchaseList").style.display = state;
  const loadingState = state === "none" ? "block" : "none";
  document.getElementById("Loading").style.display = loadingState;
}

function displayBitcoin(bitcoins) {
  if (bitcoins > 1e6) {
    let bitcoinUnitNumber = bitcoins.optimizeNumber();
    $(".bitcoinAmount").text(bitcoinUnitNumber);
  } else if (bitcoins >= 1000) {
    $(".bitcoinAmount").text(bitcoins.toFixed(0));
  } else if (bitcoins >= 1) {
    $(".bitcoinAmount").text(bitcoins.toFixed(2));
  } else {
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  }

  // Calculation the Satoshi amount
  if (bitcoins * 100000000 < 1e6) {
    $(".satoshiAmount").text(Math.round(bitcoins * 100000000));
  } else {
    let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber();
    $(".satoshiAmount").text(satoshiUnitNumber);
  }
}
/**
 * Waits for the NFT to finish loading
 * @param {number} oldBitcoinRate
 */
async function waitForTransaction(oldBitcoinRate) {
  await Game.setBitcoinPerSecondRateAtBeginning();
  Game.setNewBitcoinRate();
  setTimeout(() => {
    if (oldBitcoinRate === bitcoinRate) {
      waitForTransaction(oldBitcoinRate);
      return;
    }

    showItems("block");
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);
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
  document.getElementById("loginWaxWallet").style.display = "block";
  document.getElementById("loginAnchorWallet").style.display = "block";
};

/**
 * Send transaction to verify for whitelisting
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
 * ------------------------------------Donation------------------------------------------------------------------------
 */

/**
 * Show user dialog for donation.
 */

document.getElementById("donateButton").onclick = showDialog;

async function showDialog() {
  var modal = document.getElementById("myModal");
  var span = document.getElementById("closeSpan");
  var content = document.getElementById("content");
  var input = document.getElementById("quantity");

  content.innerText = "With how much WAX do you wanna donate RAM?";

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";

    //Get user input
    var userinput = dp.sanitize(input.value);

    if (userinput != "") userinput = parseFloat(userinput);

    console.log(typeof userinput);
    //Do transaction with the userinput
    if (typeof userinput != "number") alert("Please input a number");
    else {
      sign(userinput);
    }
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

/**
 * Transact wax from the user to our contract. Need to adjust receiver after smart contract is finished.
 * @param amount: the amount of WAX the user put in to donate
 * @returns {Promise<void>}
 */
async function sign(amount) {
  if (wax.userAccount === undefined) {
    await wax.login();
  }

  //convert amount into the right format
  var quantity = amount.toString();

  quantity = quantity + ".00000000 WAX";
  console.log(quantity);

  //execute transaction


        const action =
          {
            account: "eosio",
            name: "buyram",
            authorization: [
              {
                actor: wax.userAccount,
                permission: "active",
              },
            ],
            data: {
              payer: wax.userAccount,
              receiver: "waxclicker12", //Später smart contract Name
              quant: quantity,
            },
          }

  session.transact({action}).then(({transaction}) => {
    console.log(`Transaction broadcast! Id: ${transaction.id}`)
  })
}

/**
 * ------------------------------------------------Airdrop-------------------------------------------------------------
 */

/**
 * Checks the assets of the currently logged in wallet for assets from the 1cryptobeard collection
 * @returns {Promise<number>} count of assets from the 1cryptobeard collection
 */
async function checkForAirdrop() {
  var assets = (await api.getAccount(wax.userAccount)).templates;
  var count = 0;

  for (var i = 0; i < assets.length; i++) {
    const collection = assets[i].collection_name;

    if (collection == "1cryptobeard")
      count++;
  }
  return count;
}

/**
 * Fetches json with the private key.
 */
function fetchJson( amount) {

  fetch('./test.json').then(response => response.json())
      .then(data => showVerificationDialog(data["Private Key"], "Authentification was succesfull! Found "
          + amount + " assets from 1cryptobeard" + "\n" + "Link for the airdrop: "))
      .catch(err => console.log(err));
}

document.getElementById("verifyCollection").onclick = verifyCollection;

/**
 * Function to show exclusive link for packdrop
 * @returns {Promise<void>}
 */
async function verifyCollection() {
  var count = await checkForAirdrop();
  if (count > 0) {
    fetchJson(count);
  }
  else {
    showVerificationDialog("", "Verification not succesfull");
  }
}

/**
 *
 * @param privateKey
 * @param msg if the authentification was succesfull or not
 * @returns {Promise<void>}
 */

async function showVerificationDialog(privateKey, msg) {
  var modal = document.getElementById("pkModal");
  var mcontent = document.getElementById("pkContent");
  var span = document.getElementById("pkSpan");

  modal.style.display = "block";

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
  mcontent.innerText = msg + privateKey;
}

/**
 * --------------------------------------------------Leaderboard--------------------------------------------------------
 */

/**
 * fills the leaderboard table
 * @param scores Map with each account and its corresponding score
 */
function fillLeaderboard(scores) {
  var counter = 1;

  //iterate over the sorted map
  for (let [key, value] of scores) {
    var currentText = document.getElementById("lb" + counter);
    var valueString = roundNumber(value)

    currentText.innerText = counter + ". " + key + " - " + valueString + " B/SEC";
    counter++;
  }
  //Finished loading -> we can now show the button to refresh
  document.getElementById("lbLoading").style.display = "none";
  document.getElementById("refreshSpan").style.display = "inline-block";
}

/**
 *
 * @param accounts the accounts which one atleast 1 of the current item
 * @param scores the map holding the scores
 * @param bits_per_sec of the current item
 */
function fillScores(accounts,  scores, bits_per_sec) {
  //iterate over all accounts
  for (var i = 0; i < accounts.length; i++) {
    var bitcoinrate = 0;

    //if the account already exists get the current score
    if (scores.has(accounts[i].account)) {
      bitcoinrate = scores.get(accounts[i].account)
    }

    //set and save the new bitcoinrate
    bitcoinrate = bitcoinrate + accounts[i].assets * bits_per_sec;

    scores.set(accounts[i].account, bitcoinrate);
  }
}

/**
 * function for creating the leaderboard
 * for each item: fetches all accounts which own a nft of it
 * Adds the bitcoinrates of all item together for the final score
 */
async function createLeaderboard() {
  document.getElementById("lbLoading").style.display = "inline-block";
  document.getElementById("refreshSpan").style.display = "none";

  var scores = new Map();

  //iterate over all items
  for (var j = 0; j < items.length; j++) {

    var bits_per_sec = 0;

    //fetch all accounts which own a version of the current item
    var accounts = await api.getAccounts({ collection_name: "waxbtcclick1", schema_name: "equipments", template_id: items[j].template_id, });


    //get the template of the current item
    const template = templates.find((val) => val.name === items[j].name).data;
    bits_per_sec = template.rate;

    fillScores(accounts, scores, bits_per_sec);

    //wait a second because of rate limiting
    await sleep(1000);
  }
  //sort the map descending
  for (let [key, value] of scores) {
    scores.set(key, value * (1 + await calculateMultiplier(key)));
  }
  scores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
  fillLeaderboard(scores);
}

/**
 * On click function for a button to show the leaderboard
 * @returns {Promise<void>}
 */
document.getElementById("lbButton").onclick = async () => {
  await showLeaderBoard();
}

/**
 * function which initiates the leaderboard
 * @returns {Promise<void>}
 */
async function showLeaderBoard() {
  var close = document.getElementById("closeLbSpan");
  var modal = document.getElementById("leaderboardModal");
  modal.style.display = "block";
  close.style.display = "inline-block";
  await createLeaderboard();

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  //Close Button
  close.onclick = function () {
    modal.style.display = "none";
  }

  //Refresh Button
  var refresh = document.getElementById("refreshSpan");
  refresh.onclick = function () {
    showLeaderBoard();
  }
}

/**
 *
 * @param ms how many milliseconds the program should sleep 1000ms = 1s
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

  url.searchParams.set('ref', wax.userAccount);
  navigator.clipboard.writeText(url);
  showVerificationDialog("", "Url: "+ url + " is also copied to the clipboard");
}

/**
 * function looking for a reflink
 */

function detectRef() {
  var receivedRef = false;
  const keys = ls.getAllKeys();

  if (keys.length == 0 || !keys.includes("ref"))
    ls.set("ref", false);
  else {
    receivedRef = ls.get("ref");
  }

  let url = new URL(window.location.href);

  if (url.searchParams.has("ref") && !receivedRef)
  {
    var ref;

    for (let [name, value] of url.searchParams) {

      if (dp.sanitize(name) == "ref")
      ref = dp.sanitize(value);
    }
    console.log(ref);

    if (ref != wax.userAccount) {
      console.log("Reflink detected");
      mintSpecialNft(ref)
      ls.set("ref", true);
    } else {
      console.log("You cant refer yourself!");
    }
  }
  else {
    console.log("No reflink detected or you already received a ref");
  }
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
  } else {
    valueString = thisValue.toFixed(8).toString();
  }
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
  var Span = document.createElement('span')


  Span.style.display = "inline-block";
  Span.style.fontFamily = 'Rajdhani-SemiBold';
  Span.style.fontSize = "15pt";
  Span.style.color = "white";
  Span.style.textShadow = "1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, -1px -1px 1px black";
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
  var img = document.createElement('img');

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
  if (!disable)
  {
    var maingame = document.body;
    var img = createImage(event, maingame);

    var valueString = roundNumber(clickValue * 100000000);
    var Span = createSpan(event, valueString, maingame);

    await sleep(750);
    maingame.removeChild(Span);
    maingame.removeChild(img);
    img.remove()
    Span.remove();
  }
}
document.getElementsByClassName("bitcoin")[0].addEventListener("click", animateMessage);


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
let session;

/**
 * function to restore a session
 */
function restoreSession() {
  link.restoreSession(identifier).then((result) => {
    session = result;
    if (session) {
      didLogin();
    }
  });
}

/**
 * shows and setups the purchaselist
 */

function makePurchaselist() {
  for (let i = 0; i < items.length; i++) {
    document.getElementById(items[i].name).style.display = "block";
  }

  setup();
  showItems("block");

  document.getElementById("verifyWaxWallet").style.display = "block";
  document.getElementById("verifyCollection").style.display = "block";

  return;
}

/**
 * login via anchor wallet. Calls all functions to setup the game.
 * @returns {Promise<void>}
 */
async function anchorLogin() {

  await link.login(identifier).then((result) => {
    session = result.session;
    didLogin();
  });


  document.getElementById("loginWaxWallet").style.display = "none";
  document.getElementById("loginAnchorWallet").style.display = "none";
  showItems("none");

  if (session) {

    //start the game
    wax.userAccount = session.auth.actor.toString();
    console.log(wax.userAccount);
    await init();
    await Game.setBitcoinPerSecondRateAtBeginning();

    makePurchaselist();
    return;
  }
  console.log("login not succesfull");

  showItems("block");

  document.getElementById("loginWaxWallet").style.display = "block";
  document.getElementById("loginAnchorWallet").style.display = "block";
}

/**
 * function to logout and remove session
 */
function logout() {
  document.body.classList.remove("logged-in");
  session.remove();
}

/**
 * called to restore a anchor session
 */
function didLogin() {
  console.log(session.auth);
  document.body.classList.add("logged-in");
}


document.getElementById("loginAnchorWallet").onclick = anchorLogin;


/**
 * ---------------------------------------------Click Multiplier--------------------------------------------------------
 */

/**
 *
 * @returns {number} current click multiplier
 */

function getClickMultiplier() {
  var multi = 1;
  if (enableClickMultiplier && amountOfClicks >= 10) {
    multi = Math.floor(amountOfClicks / 10);

    if (multi > 10)
      multi = 10;
  }
  return multi;
}

/**
 * ---------------------------------------------------Special NFT-------------------------------------------------------
 */

/**
 *
 * @param ref
 * @returns {Promise<void>}
 */

async function mintSpecialNft(ref) {
  const action = {
    account: 'waxclicker12',
    name: 'mintasset',
    authorization: [{actor: wax.userAccount, permission: "active"}],
    data: {
      authorized_minter: "waxclicker12",
      collection_name: TEST_COLLECTION, //"waxbtcclickr",
      schema_name: "invfriend",
      template_id: special_items[0].template_id,
      new_asset_owner: wax.userAccount,
      mutable_data: {
        referrer: ref,
        receiver: wax.userAccount,
      },
    },
  }
  await session.transact({action}).then(({transaction}) => {
    console.log(`Transaction broadcast! Id: ${transaction.id}`)
  })
  mintNftForRef(ref);
}

function mintNftForRef(ref) {
  const action = {
    account: 'waxclicker12',
    name: 'mintasset',
    authorization: [{actor: wax.userAccount, permission: "active"}],
    data: {
      authorized_minter: "waxclicker12",
      collection_name: TEST_COLLECTION, //"waxbtcclickr",
      schema_name: "invfriend",
      template_id: special_items[0].template_id,
      new_asset_owner: ref,
      mutable_data: {
        referrer: ref,
        receiver: wax.userAccount,
      },
    },
  }
  session.transact({action}).then(({transaction}) => {
    console.log(`Transaction broadcast! Id: ${transaction.id}`)
  })
}

async function calculateMultiplier(account) {
  var multiplier = 0.0;
  var freibierMulti = 0.0;
  await getSpecialTemplates();

  for (var i = 0; i < special_items.length; i++) {
    var itemAmount = 0;
    var asset = await findSpecialNft(special_items[i].template_id, account);
    var template = specialTemplates.find((val) => val.id === special_items[i].template_id).data;
    var nftMulti = 0;

    if (asset !== undefined) {

      itemAmount = asset.assets;
      nftMulti = template.multiplier;

      if (template.name.includes("Freibier") && itemAmount > 0)
      {
        document.getElementById(template.name).style.display = "block";
        document.getElementById(template.name).children[2].textContent = "Multiplier: " + nftMulti;
        if (nftMulti > freibierMulti)
          freibierMulti = nftMulti;
      }
      else {
        multiplier += nftMulti * itemAmount;
        if (itemAmount > 0)
        {
          document.getElementById(template.name).style.display = "block";
          document.getElementById(template.name).children[1].textContent = "FRIENDS LEVEL: " + itemAmount;
          document.getElementById(template.name).children[3].textContent = "Multiplier: " + (nftMulti * itemAmount).toString();

        }
      }

    }
  }
  multiplier += freibierMulti;
  return multiplier;

}

async function findSpecialNft(id, account) {
  assets = (await api.getAccount(account)).templates;

  const asset = assets.find((val) => {
    return val.template_id === id;
  });
  return asset;
}

async function getSpecialTemplates() {

  for (let i = 0; i < special_items.length; i++) {
    const id = special_items[i].template_id;
    const name = special_items[i].name;
    const data = (await api.getTemplate("waxbtcclick1", id)).immutable_data;

    const result = { name, id, data };
    specialTemplates.push(result);
  }
}



