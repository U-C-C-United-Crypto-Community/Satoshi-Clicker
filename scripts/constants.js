const WAX_MAINNET = "https://wax.greymass.com";
 const WAX_TESTNET = "https://waxtestnet.greymass.com";

 const ATOMIC_TEST_URL = "https://test.wax.api.atomicassets.io";
 const ATOMIC_MAIN_URL = "https://wax.api.atomicassets.io";

 const TEST_COLLECTION = "waxclickbeta";

let session;

 var ITEMS = [
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

var TEST_ITEMS = [
  {
    name: "item_oldCalculator",
    template_id: "150075",
  },
  {
    name: "item_oldCpu",
    template_id: "150076",
  },
  {
    name: "item_oldComputerFromGrandpa",
    template_id: "150077",
  },
  {
    name: "item_raspberrypi",
    template_id: "150079",
  },
  {
    name: "item_smartphone",
    template_id: "150080",
  },
  {
    name: "item_middleClassPC",
    template_id: "150081",
  },
  {
    name: "item_cheapServer",
    template_id: "150084",
  },
  {
    name: "item_gamingPC",
    template_id: "150082",
  },
  {
    name: "item_cheapMiner",
    template_id: "150083",
  },
  {
    name: "item_highEndUltraPC",
    template_id: "150095",
  },
  {
    name: "item_bigMiner",
    template_id: "150093",
  },
  {
    name: "item_miningFarm",
    template_id: "150091",
  },
  {
    name: "item_nasaPC",
    template_id: "150089",
  },
  {
    name: "item_quantumRig",
    template_id: "150088",
  },
  {
    name: "item_miningFarmSpace",
    template_id: "150085",
  },
  {
    name: "item_miningFarmMoon",
    template_id: "150087",
  },
  {
    name: "item_bitcoinTimeMachine",
    template_id: "150086",
  },
  {
    name: "item_blackHolePoweredMiner",
    template_id: "150074",
  },
];

// Every constant variable is saved here
 const GameConst = {
  priceMultiplier: 1.15,
  VERSION: "1.4.0",
};

 const UNITS = [
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

 var special_items = [
     {
        name: "FRIENDS",
        template_id: "150096",
     }
 ]
