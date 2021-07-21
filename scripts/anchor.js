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

// tries to restore session, called when document is loaded
function restoreSession() {
  link.restoreSession(identifier).then((result) => {
    session = result;
    if (session) {
      didLogin();
    }
  });
}

// login and store session if sucessful
function login() {
  link.login(identifier).then((result) => {
    session = result.session;
    didLogin();
  });
}

// logout and remove session from storage
function logout() {
  document.body.classList.remove("logged-in");
  session.remove();
}

// called when session was restored or created
function didLogin() {
  document.getElementById("account-name").textContent = session.auth.actor;
  document.body.classList.add("logged-in");
}

document.getElementById("anchorLogin").onclick = login;
