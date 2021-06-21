const { waxjs } = require("../node_modules/@waxio/waxjs");

//normal login. Triggers a popup for non-whitelisted dapps
const wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);

autoLogin();

//checks if autologin is available and calls the normal login function if it is
async function autoLogin() {
  var isAutoLoginAvailable = await wax.isAutoLoginAvailable();
  if (isAutoLoginAvailable) {
    login();
  }
}

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    const userAccount = await wax.login();
  } catch (e) {}
}
