import fetch from "node-fetch";

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
const index = process.argv.slice(2)[0] || 0;

let API_URL =
  "https://testnet.wax.pink.gg/v2/history/get_actions?" +
  "limit=" +
  20 +
  "&skip=" +
  index +
  "&account=" +
  "waxclicker12";

var result = await fetch(API_URL, {
  method: "get",
}).then((val) => {
  return val.json();
});
result = result.actions
  .map((val) => {
    return {
      account: val.act.data.asset_owner,
      act: val.act.name,
      timestamp: val.timestamp,
    };
  })
  .filter((value) => {
    return value.account;
  });
console.log(result);
