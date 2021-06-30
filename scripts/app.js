const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const waxjs = require("@waxio/waxjs/dist");
const api = new ExplorerApi("https://wax.api.atomicassets.io", "atomicassets", {
  fetch,
});
const wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);

var userData = {
  bitcoins: 0,
  waxWallet: "",
};
var bitcoins = 0;
var bitcoinRate = 0;

// Every item in the game
// TODO: items should be part of the Game variable
var items = [
  {
    name: "item_oldCalculator",
    price: "0.0000001",
    template_id: "180336",
  },
  {
    name: "item_oldCpu",
    price: "0.00000125",
    template_id: "180473",
  },
  {
    name: "item_oldComputerFromGrandpa",
    price: "0.00003",
    template_id: "180512",
  },
  {
    name: "item_raspberrypi",
    price: "0.00005",
    template_id: "180513",
  },
  {
    name: "item_smartphone",
    price: "0.0005",
    template_id: "180515",
  },
  {
    name: "item_middleClassPC",
    price: "0.0015",
    template_id: "180516",
  },
  {
    name: "item_cheapServer",
    price: "0.004",
    template_id: "180517",
  },
  {
    name: "item_gamingPC",
    price: "0.015",
    template_id: "180519",
  },
  {
    name: "item_cheapMiner",
    price: "0.05",
    template_id: "180521",
  },
  {
    name: "item_highEndUltraPC",
    price: "0.15",
    template_id: "180522",
  },
  {
    name: "item_bigMiner",
    price: "1.5",
    template_id: "180524",
  },
  {
    name: "item_miningFarm",
    price: "250",
    template_id: "180525",
  },
  {
    name: "item_nasaPC",
    price: "5000",
    template_id: "180526",
  },
  {
    name: "item_quantumRig",
    price: "245000",
    template_id: "180528",
  },
  {
    name: "item_miningFarmSpace",
    price: "2000000",
    template_id: "180529",
  },
  {
    name: "item_miningFarmMoon",
    price: "75500000",
    template_id: "180530",
  },
  {
    name: "item_bitcoinTimeMachine",
    price: "975000000",
    template_id: "180531",
  },
  {
    name: "item_blackHolePoweredMiner",
    price: "750000000000",
    template_id: "180532",
  },
];

// Rate is null (at the beginning)
var bSec = null;

// If there is no bitcoins Item in the localStorage, create one.
// If there is one, do the other thing.
function init() {
  const data = JSON.parse(localStorage.getItem("userData"));
  if (data === null || data.waxWallet === "") {
    // Bitcoins are 0
    bitcoins = 0;
    waxWallet = wax.userAccount;
    userData = {
      bitcoins,
      waxWallet,
    };
    // Set the localStorage Item for the first time
    localStorage.setItem("userData", JSON.stringify(userData));
    // Write the current amount of Bitcoins on the page
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  } else {
    // Get the amount of Bitcoins and parse them to a float number
    bitcoins = parseFloat(
      JSON.parse(localStorage.getItem("userData")).bitcoins
    );
    $(".bitcoinAmount").text("loading...");
    $(".satoshiAmount").text("loading...");

    // let satoshis = bitcoins * 100000000;
  }
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
  for (var i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    var itemAmount = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
    }
    // HTML element on the game page
    var $element = $("#" + items[i].name);

    // Writing the amount on the page at the item´s element
    $element.children()[0].textContent = itemAmount;

    // Only calculate the new price if there is more than 0 items.
    // If there are not enough items, it will just continue, and if there are,
    // it will execute the function and continue after it as well.
    if (itemAmount > 0) {
      Game.setPriceAtGameBeginning(
        $element,
        parseFloat(items[i].price),
        parseInt(itemAmount)
      );
    }

    // Getting the data-bits-per-sec attribute, needed for calculating the bitcoin/sec rate
    var bits_per_sec = $element.attr("data-bits-per-sec");
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
    var itemAmount = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
    }
    var $element = $("#" + items[i].name);
    $element.children()[0].textContent = itemAmount;

    // Only calculate if there is more than 0 items
    if (itemAmount > 0) {
      // Calculation of the price
      var multiplier = Game.GameConst.priceMultiplier;
      var calculation = (
        parseFloat(items[i].price) * Math.pow(multiplier, parseInt(itemAmount))
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
  userData.bitcoins = bitcoins;
  // Save bitcoin amount in the storage
  localStorage.setItem("userData", JSON.stringify(userData));
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

// Calculates the Bitcoin/sec rate with the amount of every item multiplied with their given Bitcoins/second rate.

// Stating the interval with the calculated Bitcoin/second rate.
bSec = setInterval(function () {
  Game.bSecFunction(bitcoinRate);
}, 1000);

// Doing everything here when the game is ready to be used.
$(document).ready(async function () {
  await login();
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
    userData.bitcoins = bitcoins;
    // Save the new amount of Bitcoins in the localStorage storage
    localStorage.setItem("userData", JSON.stringify(userData));
  });

  // If any item from the list was clicked...
  $(".purchaseItem").click(async function () {
    // Get following attributes and children elements

    // id of the item
    var id = $(this).attr("id");
    // The price attribute as a float number
    var price = parseFloat($(this).attr("data-price"));

    // The element which shows how many of the item is existing
    // If you have enough Bitcoins, it´ll buy one item
    if (parseFloat(bitcoins.toFixed(8)) >= price) {
      showItems("none");
      await mint(id);
      // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
      bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

      // Save the new amount of Bitcoins in the localStorage storage
      userData.bitcoins = bitcoins;
      localStorage.setItem("userData", JSON.stringify(userData));

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
      oldBitcoinRate = bitcoinRate;
      // Setting a new price and show it
      await Game.setNewPrice();
      // Restarting the interval with the new rate
      await waitForTransaction(oldBitcoinRate);
    }
  });
});

Game.getItem = async function (id) {
  const assets = (await api.getAccount(wax.userAccount)).templates;
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
  const actions = await (
    await api.action
  ).mintasset(
    [{ actor: "1mbtu.wam", permission: "active" }],
    "1mbtu.wam",
    "waxbtcclickr",
    "equipments",
    template_id,
    wax.userAccount,
    {},
    {},
    0
  );
  await wax.api
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
}

function showItems(state) {
  document.getElementById("purchaseList").style.display = state;
  const loadingState = state === "none" ? "initial" : "none";
  document.getElementById("Loading").style.display = loadingState;
}

async function waitForTransaction(oldBitcoinRate) {
  await Game.setBitcoinPerSecondRateAtBeginning();
  Game.setNewBitcoinRate();
  setTimeout(() => {
    if (oldBitcoinRate === bitcoinRate) {
      waitForTransaction(oldBitcoinRate);
      return;
    }
    showItems("initial");
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);
  }, 1000);
}

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    await wax.login();
    await Game.setBitcoinPerSecondRateAtBeginning();
    init();
  } catch (e) {
    console.log(e);
  }
}
