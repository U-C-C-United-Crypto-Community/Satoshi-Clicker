const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const SecureLS = require("secure-ls");
const waxjs = require("@waxio/waxjs/dist");
const DOMPurify = require("dompurify");
const api = new ExplorerApi("https://wax.api.atomicassets.io", "atomicassets", {
  fetch,
});
var wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);
const detectEthereumProvider = require("@metamask/detect-provider");
const waxWalletCollectorAddress = "0xB3528065F526Acf871B35ae322Ed28b24C096548";
const dp = new DOMPurify();
const ls = new SecureLS();

var bitcoins = 0;
var bitcoinRate = 0;
var currentUser = null;
// Every item in the game
// TODO: items should be part of the Game variable

var items = [
  {
    name: "item_oldCalculator",
    template_id: "180336",
  },
  {
    name: "item_oldCpu",
    template_id: "180473",
  },
  {
    name: "item_oldComputerFromGrandpa",
    template_id: "180512",
  },
  {
    name: "item_raspberrypi",
    template_id: "180513",
  },
  {
    name: "item_smartphone",
    template_id: "180515",
  },
  {
    name: "item_middleClassPC",
    template_id: "180516",
  },
  {
    name: "item_cheapServer",
    template_id: "180517",
  },
  {
    name: "item_gamingPC",
    template_id: "180519",
  },
  {
    name: "item_cheapMiner",
    template_id: "180521",
  },
  {
    name: "item_highEndUltraPC",
    template_id: "180522",
  },
  {
    name: "item_bigMiner",
    template_id: "180524",
  },
  {
    name: "item_miningFarm",
    template_id: "180525",
  },
  {
    name: "item_nasaPC",
    template_id: "180526",
  },
  {
    name: "item_quantumRig",
    template_id: "180528",
  },
  {
    name: "item_miningFarmSpace",
    template_id: "180529",
  },
  {
    name: "item_miningFarmMoon",
    template_id: "180530",
  },
  {
    name: "item_bitcoinTimeMachine",
    template_id: "180531",
  },
  {
    name: "item_blackHolePoweredMiner",
    template_id: "180532",
  },
];

var templates = [];

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

// If there is no bitcoins Item in the localStorage, create one.
// If there is one, do the other thing.
async function init() {

  const keys = ls.getAllKeys()
  if (keys.length == 0 || !keys.includes("bitcoins"))
    ls.set("bitcoins", 0);

  const wallet = localStorage.getItem("waxWallet");
  const btcs = ls.get("bitcoins");
  console.log(btcs)
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
detectRef();
}
/**
 *
 *  <-- Setting up the game´s functions -->
 *
 */

// Game variable which will contain any needed major function or needed variables for the game.
var Game = {};

// Every constant variable is saved here
Game.GameConst = {
  priceMultiplier: 1.15,
  VERSION: "1.4.0",
};

Game.units = [
  "Million",
  "Billion",
  "Trillion",
  "Quadrillion",
  "Quintillion",
  "Sextillion",
  "Septillion",
  "Octillion",
  "Nonillion",
  "Decillion",
  "Undecillion",
  "Duodecillion",
  "Tredecillion",
  "Quattuordecillion",
  "Quindecillion",
  "Sexdecillion",
  "Septdecillion",
  "Octodecillion",
  "Novemdecillion",
  "Vigintillion",
  "Unvigintillion",
  "Duovigintillion",
  "Trevigintillion",
  "Quattuorvigintillion",
  "Quinvigintillion",
  "Sexvigintillion",
  "Septvigintillion",
  "Octovigintillion",
  "Novemvigintillion",
  "Trigintillion",
];

/**
 * Calculating every price for the items when the game was started (and if there are any items).
 *
 * @param element {HTMLElement} - The HTML element of the item on the game page
 * @param price {Number} - The price of the item, got from the items Object
 * @param itemAmount {Number} - The current amount of the item, saved in the localStorage
 */

Game.setPriceAtGameBeginning = function (element, price, itemAmount) {
  // Calculation of the price
  var multiplier = Game.GameConst.priceMultiplier;

  // Calculate the new price -> price * multiplier^itemAmount
  var calculation = (
    parseFloat(price) * Math.pow(multiplier, parseInt(itemAmount))
  ).toFixed(8);

  // Showing the actual price
  element.children()[2].textContent = calculation + " Bitcoins";

  // Set the data-price attribute with the new price
  element.attr("data-price", calculation.toString());
};

/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 *
 */
Game.setBitcoinPerSecondRateAtBeginning = async function () {
  bitcoinRate = 0;
  for (let i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    const template = templates.find((val) => val.name === items[i].name).data;
    let itemAmount = 0;
    let bits_per_sec = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
      bits_per_sec = template.rate;
    }
    // HTML element on the game page
    var $element = $("#" + items[i].name);

    // Writing the amount on the page at the item´s element
    $element.children()[3].textContent = "Level: " + itemAmount;

    // Only calculate the new price if there is more than 0 items.
    // If there are not enough items, it will just continue, and if there are,
    // it will execute the function and continue after it as well.
    if (itemAmount > 0) {
      Game.setPriceAtGameBeginning(
        $element,
        parseFloat(template.price),
        parseInt(itemAmount)
      );
    }
    itemAmount = parseInt(itemAmount);

    // Calculating the rate
    bitcoinRate = bitcoinRate + itemAmount * bits_per_sec;
  }
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function () {
  // Showing the new rate on the page
  // Rounding at specific values
  if (bitcoinRate >= 1000000) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0).optimizeNumber());
  } else if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0));
  } else if (bitcoinRate >= 1) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(2));
  } else {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(8));
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
  // for-loop for getting the price multiplier and to calculate the new price
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
      var multiplier = Game.GameConst.priceMultiplier;
      var calculation = (
        parseFloat(template.price) * Math.pow(multiplier, parseInt(itemAmount))
      ).toFixed(8);

      // Showing the actual price
      $element.children()[2].textContent = calculation + " Bitcoins";

      // Set the data-price attribute with the new price
      $element.attr("data-price", calculation.toString());
    }
  }
  // End of the for-loop
};

/**
 * The function which adds new generated Bitcoins to the current Bitcoin amount.
 *
 * @param rate - The Bitcoin per second rate; Needed for adding the generated Bitcoins every second
 */
Game.bSecFunction = function (rate) {
  bitcoins = bitcoins + rate;
  // Show both values on the page
  // Rounding the bitcoin number at specific set values
  if (bitcoins > 1000000) {
    let bitcoinUnitNumber = bitcoins.optimizeNumber();

    $(".bitcoinAmount").text(bitcoinUnitNumber);
  } else if (bitcoins >= 1000) {
    $(".bitcoinAmount").text(bitcoins.toFixed(0));
  } else if (bitcoins >= 1) {
    $(".bitcoinAmount").text(bitcoins.toFixed(2));
  } else {
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  }

  // Rounding the satoshis amount at a specific value and optimize it for displaying on the screen.
  var satoshis = bitcoins * 100000000;

  if (satoshis < 1000000) {
    $(".satoshiAmount").text(Math.round(satoshis));
  } else {
    let satoshiUnitNumber = satoshis.optimizeNumber();
    $(".satoshiAmount").text(satoshiUnitNumber);
  }
  // Save bitcoin amount in the storage
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

    // let test = this.toExponential(0).toString().replace("+", "").slice(2)
    // console.log(test)

    var num = (this / ("1e" + unit)).toFixed(2);

    var unitname = Game.units[Math.floor(unit / 3) - 1];

    return num + " " + unitname;
  }

  return this.toLocaleString();
};

Number.prototype.optimizeNumber = Game.optimizeNumber;
String.prototype.optimizeNumber = Game.optimizeNumber;

// --------------------------------------------------- //

/**
 * <-- Now doing everything -->
 */

// Doing everything here when the game is ready to be used.
function setup() {
  $(document).ready(async function () {
    // Stating the interval with the calculated Bitcoin/second rate.
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);

    // Write the version into the .version span element
    $(".version").text("Version " + Game.GameConst.VERSION);
    // Write the bitcoin per second rate into the .bSecRateNumber span element
    if (bitcoinRate >= 1000) {
      $(".bSecRateNumber").text(bitcoinRate.toFixed(0));
    } else if (bitcoinRate >= 1) {
      $(".bSecRateNumber").text(bitcoinRate.toFixed(2));
    } else {
      $(".bSecRateNumber").text(bitcoinRate.toFixed(8));
    }

    // If clicked on the big Bitcoin
    $(".bitcoin").click(function () {
      // Add 1^-8 Bitcoins (equal to 1 satoshi)
      bitcoins = bitcoins + 0.00000001;

      // Show the new number on the page
      if (bitcoins > 1000000) {
        let bitcoinUnitNumber = bitcoins.optimizeNumber();
        $(".bitcoinAmount").text(bitcoinUnitNumber);
      } else if (bitcoins >= 1000) {
        $(".bitcoinAmount").text(bitcoins.toFixed(0));
      } else if (bitcoins >= 1) {
        $(".bitcoinAmount").text(bitcoins.toFixed(2));
      } else {
        $(".bitcoinAmount").text(bitcoins.toFixed(8));
      }

      if (bitcoins * 100000000 < 1000000) {
        $(".satoshiAmount").text(Math.round(bitcoins * 100000000));
      } else {
        let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber();
        $(".satoshiAmount").text(satoshiUnitNumber);
      }
      // Save the new amount of Bitcoins in the localStorage storage
      ls.set("bitcoins", bitcoins.toString());
    });

    // If any item from the list was clicked...
    $(".purchaseItem").click(async function () {
      // Get following attributes and children elements

      // id of the item
      const id = $(this).attr("id");
      // The price attribute as a float number
      const template = templates.find((val) => val.name === id);
      const { price } = template ? template.data : Number.MAX_VALUE;

      // The element which shows how many of the item is existing
      // If you have enough Bitcoins, it´ll buy one item
      if (parseFloat(bitcoins.toFixed(8)) >= price) {
        showItems("none");

        // mint throws undefined if RAM is unsufficient
        const err = await mint(id);
        if (err === undefined) {
          showItems("block");
          alert("Unsufficient RAM:\nThe item is not available...");
          return;
        }
        // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
        bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

        // Save the new amount of Bitcoins in the localStorage storage
        ls.set("bitcoins", bitcoins.toString());

        // Changing the Bitcoins amount
        // Rounding the Bitcoin number at specific values
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

        // Stops the interval
        Game.stopBsec();
        const oldBitcoinRate = bitcoinRate;
        // Setting a new price and show it
        await Game.setNewPrice();
        // Restarting the interval with the new rate
        await waitForTransaction(oldBitcoinRate);
      }
    });
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
  const actions = await (await api.action)
    .mintasset(
      [{ actor: wax.userAccount, permission: "active" }],
      wax.userAccount,
      "waxbtcclickr",
      "equipments",
      template_id,
      wax.userAccount,
      {},
      {},
      0
    )
    .catch(console.log);
  const result = await wax.api
    .transact(
      {
        actions: actions,
      },
      {
        blocksBehind: 30,
        expireSeconds: 1200,
      }
    )
    .catch(console.log);
  console.log(result);
  return result;
}

function showItems(state) {
  document.getElementById("purchaseList").style.display = state;
  const loadingState = state === "none" ? "block" : "none";
  document.getElementById("Loading").style.display = loadingState;
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
  }, 1000);
}

// normal login. Triggers a popup for non-whitelisted dapps
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
  showItems("none");
  const success = await login();
  if (success) {
    for (let i = 0; i < items.length; i++) {
      document.getElementById(items[i].name).style.display = "block";
    }
    setup();
    showItems("block");
    document.getElementById("verifyWaxWallet").style.display = "block";
    document.getElementById("verifyCollection").style.display = "block";
    return;
  }
  showItems("block");
  document.getElementById("loginWaxWallet").style.display = "block";
};

/**
 * Send transaction to verify for whitelisting
 */

document.getElementById("verifyWaxWallet").onclick = verifyWaxWallet;

async function verifyWaxWallet() {
  const provider = await detectEthereumProvider();
  console.log(provider);
  if (provider === window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.request({method: "eth_requestAccounts"});
      const accounts = await ethereum.request({method: "eth_accounts"});
      currentUser = accounts[0];
      const contract = new web3.eth.Contract(
          waxWalletCollector,
          waxWalletCollectorAddress
      );
      await contract.methods
          .collect(wax.userAccount)
          .send({from: currentUser});
    } catch (err) {
      console.log(err);
    }
  }

}


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

  modal.style.display = "block"

  span.onclick = function() {
    modal.style.display = "none";

    //Get user input
    var userinput = dp.sanitize(input.value);

    if (userinput != "")
    userinput = parseFloat(userinput);

    console.log(typeof userinput)
    //Do transaction with the userinput
    if (typeof userinput != "number")
      alert("Please input a number");
    else {
      sign(userinput);
    }
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


}

/**
 * Transact wax from the user to our contract. Need to adjust receiver after smart contract is finished.
 * @param amount: the amount of WAX the user put in to donate
 * @returns {Promise<void>}
 */
async function sign(amount) {
  if(wax.userAccount === undefined) {
    await wax.login();
  }

  //convert amount into the right format
  var quantity = amount.toString();

  quantity = quantity + " WAX"
  console.log(quantity);


  //execute transaction
  try {
    const result = await wax.api.transact({
      actions: [{
        account: 'eosio',
        name: 'buyram',
        authorization: [{
          actor: wax.userAccount,
          permission: 'active',
        }],
        data: {
          payer: wax.userAccount,
          receiver: "1mbtu.wam",    //Später smart contract Name
          quant: quantity,
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
    console.log(JSON.stringify(result, null, 2))
  } catch(e) {
    console.log(e.message);
  }
}

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
      .then(data => showVerificationDialog(data["Private Key"], "Authentification was succesfull! Found " + amount + " assets from 1cryptobeard" + "\n" + "Link for the airdrop: "))
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

  span.onclick = function() {
    modal.style.display = "none"; }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  mcontent.innerText = msg + privateKey;
}


/**
 * fills the leaderboard table
 * @param scores Map with each account and its corresponding score
 */
function fillLeaderboard(scores) {
  var counter = 1;

  //iterate over the sorted map
  for (let [key, value] of scores) {
    var currentText = document.getElementById("lb" + counter);
    var valueString = "";

    //rounds the bitcoin/sec number
    if (value > 1e6) {
      let bitcoinUnitNumber = value.optimizeNumber();
      valueString = bitcoinUnitNumber;
    } else if (bitcoins >= 1000) {
      valueString = value.toFixed(0).toString();
    } else if (bitcoins >= 1) {
      valueString = value.toFixed(2).toString();
    } else {
      valueString = value.toFixed(8).toString();
    }

    currentText.innerText = counter + ". " + key + " - " + valueString + " B/SEC";
    counter++;
  }
  //Finished loading -> we can now show the button to refresh
  document.getElementById("lbLoading").style.display = "none";
  document.getElementById("refreshSpan").style.display = "inline-block";
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

    var bitcoinrate = 0;
    var bits_per_sec = 0;

    //fetch all accounts which own a version of the current item
    var accounts = await api.getAccounts({ collection_name: "waxbtcclickr", schema_name: "equipments", template_id: items[j].template_id, });

    //get the template of the current item
    const template = templates.find((val) => val.name === items[j].name).data;
    bits_per_sec = template.rate;

    //iterate over all accounts
    for (var i = 0; i < accounts.length; i++) {

      //if the account already exists get the current score
      if (scores.has(accounts[i].account)) {
        bitcoinrate = scores.get(accounts[i].account)
      }

      //set and save the new bitcoinrate
      bitcoinrate = bitcoinrate + accounts[i].assets * bits_per_sec;

      scores.set(accounts[i].account, bitcoinrate);
    }
    //wait a second because of rate limiting
    await sleep(1000);
  }
  //sort the map descending
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById("refButton").onclick = generateRefLink;

function generateRefLink() {
  let url = new URL(window.location.href);

  url.searchParams.set('ref', wax.userAccount);
  showVerificationDialog("", url);
}

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
      //mintasset for both
      ls.set("ref", true);
    } else {
      console.log("You cant refer yourself!");
    }
  }
  else {
    console.log("No reflink detected or you already received a ref");
  }
}






