//normal login. Triggers a popup for non-whitelisted dapps
const wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    const userAccount = await wax.login();
    console.log(userAccount);
  } catch (e) {
    console.log(e);
  }
}
login();

async function buyItem(item) {
  console.log(item);
}
