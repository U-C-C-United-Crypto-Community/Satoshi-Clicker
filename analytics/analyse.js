import fetch from "node-fetch";
import fs from "fs";

/*
https://testnet.wax.pink.gg/v2/docs/index.html#/history/post_v1_history_get_actions
https://hyperion.docs.eosrio.io/endpoint/
{
account_name	string
                minLength: 1
                maxLength: 12
                notified account

pos	            integer
                action position (pagination)

offset	        integer
                limit of [n] actions per page

filter	        string
                minLength: 3
                code:name filter

after	        string($date-time)
                filter after specified date (ISO8601)

before	        string($date-time)
                filter before specified date (ISO8601)
}
*/

/* POST Request
    const API_URL = "https://testnet.wax.pink.gg/v1/history/get_actions";
    var body = {
    account_name: "waxclicker12",
    pos: index,
    limit: 100,
    };
*/
async function fetchData() {
  const startTime = new Date("2021-08-18T00:00:00").getTime();
  let players = [];
  let skip = 0;
  let finished = false;
  while (!finished) {
    let data = await fetch(getURL(skip), {
      method: "get",
    }).then((val) => {
      return val.json();
    });
    data = data.actions
      .map((val) => {
        const action = val.act.name;
        const contract = val.act.account;
        if (action == "mintasset" && contract == "atomicassets") {
          return {
            account: val.act.data.data.new_asset_owner,
            act: val.act.name,
            timestamp: val.timestamp,
          };
        } else if (action == "setassetdata") {
          return {
            account: val.act.data.asset_owner,
            act: val.act.name,
            timestamp: val.timestamp,
          };
        }
      })
      .filter(function (x) {
        return x !== undefined;
      });
    for (let i in data) {
      const actionTime = new Date(data[i].timestamp).getTime();
      if (actionTime < startTime) {
        finished = true;
        break;
      }
    }
    players.push(...data);
    skip += 100;
  }
  players = players.sort(compare);
  function compare(a, b) {
    if (a.account < b.account) {
      return -1;
    }
    if (a.account > b.account) {
      return 1;
    }
    return 0;
  }
  writeToCSVFile(players);
}

function getURL(skip) {
  return (
    "https://testnet.wax.pink.gg/v2/history/get_actions?" +
    "limit=" +
    100 +
    "&skip=" +
    skip +
    "&account=" +
    "waxclicker12"
  );
}

function writeToCSVFile(players) {
  const filename = "players.csv";
  fs.writeFile(filename, extractAsCSV(players), (err) => {
    if (err) {
      console.log("Error writing to csv file", err);
    } else {
      console.log(`saved as ${filename}`);
    }
  });
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

function extractAsCSV(players) {
  players.keys();
  const header = ["Player, Action, Timestamp"];
  const rows = players.map(
    (player) =>
      `${player.account}, ${player.act}, ${new Date(player.timestamp).addHours(
        2
      )}`
  );
  return header.concat(rows).join("\n");
}

await fetchData();
