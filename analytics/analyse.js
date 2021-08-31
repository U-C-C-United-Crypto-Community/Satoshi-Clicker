import fetch from "node-fetch";
import fs from "fs";
import { ExplorerApi } from "atomicassets";

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

const ATOMIC_TEST_URL = "https://test.wax.api.atomicassets.io";
const ATOMIC_MAIN_URL = "https://wax.api.atomicassets.io";
const api = new ExplorerApi(ATOMIC_TEST_URL, "atomicassets", {
  fetch,
});

const COLLECTION_NAME = "betawaxclick";

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

    data = transformData(data);

    for (let i in data) {
      if (data[i].action == "setassetdata") {
        const asset_id = data[i].asset_id;
        const asset = await api.getAsset(asset_id);
        delete data[i].asset_id;
        data[i].item = asset.name;
      } else {
        const template_id = data[i].template_id;
        const template = await api.getTemplate(COLLECTION_NAME, template_id);
        delete data[i].template_id;
        data[i].item = template.name;
      }
      const actionTime = new Date(data[i].timestamp).getTime();
      if (actionTime < startTime) {
        const container = [...data].slice(0, i);
        data = container;
        finished = true;
        break;
      }
    }
    players.push(...data);
    skip += 100;
  }

  function compare(a, b) {
    if (a.account < b.account) {
      return -1;
    }
    if (a.account > b.account) {
      return 1;
    }
    return 0;
  }
  players = players.sort(compare);
  writeToCSVFile(players);
}

function transformData(data) {
  return data.actions
    .map((val) => {
      const action = val.act.name;
      const contract = val.act.account;
      if (action == "mintasset" && contract == "atomicassets") {
        const template_id = val.act.data.data.template_id;
        return {
          account: val.act.data.data.new_asset_owner,
          action,
          timestamp: val.timestamp,
          template_id,
          level: "1",
        };
      } else if (action == "setassetdata") {
        const asset_id = val.act.data.asset_id;
        const level = val.act.data.new_mutable_data[0].value[1];
        return {
          account: val.act.data.asset_owner,
          action,
          timestamp: val.timestamp,
          asset_id,
          level,
        };
      }
    })
    .filter(function (x) {
      return x !== undefined;
    });
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
  const header = ["Player, Action, Item, Level, Timestamp"];
  const rows = players.map(
    (player) =>
      `${player.account}, ${player.action}, ${player.item}, ${
        player.level
      },${new Date(player.timestamp).addHours(2)}`
  );
  return header.concat(rows).join("\n");
}

await fetchData();
