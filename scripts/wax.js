const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const api = new ExplorerApi(
  "https://test.wax.api.atomicassets.io",
  "atomicassets",
  { fetch }
);

console.log(api);
//normal login. Triggers a popup for non-whitelisted dapps
const wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    userAccount = await wax.login();
  } catch (e) {
    console.log(e);
  }
}
login();

async function buyItem(item) {
  const actions = (await api.action).mintasset(
    [{ actor: userAccount, permission: "active" }],
    "collection",
    "scheme",
    -1,
    "pinknetworkx",
    { name: "test" },
    { species: "test2" }
  );
  console.log(actions);
}

// create the action to mint an asset
