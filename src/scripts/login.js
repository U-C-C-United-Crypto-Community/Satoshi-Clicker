import { wax } from "./wax";

export async function hasRegistered() {
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
    console.log(e);
    return false;
  }
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
