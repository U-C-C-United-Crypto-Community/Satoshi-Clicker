/**Satoshi Clicker Game
 Copyright (C) 2021  daubit gmbh

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
const ecc = require("eosjs-ecc");
// const EosApi = require("eosjs-api"); // Or EosApi = require('./src')

// var eos = EosApi();

module.exports = {

    mint: async function (id, account, bitcoinamount) {

        var hasharray = await this.createHash(account, bitcoinamount);
        //await this.getLastTransaction(eosApi, rpc, account);

        const action = {
            account: 'waxclicker12',
            name: 'mintasset',
            authorization: [{ actor: account, permission: "active" }],
            data: {
                authorized_minter: "waxclicker12",
                collection_name: TEST_COLLECTION, //"waxbtcclickr",
                schema_name: "equipments",
                template_id: id,
                new_asset_owner: account,
                memo: hasharray[1].array,
                hash: hasharray[0].hash,
                amount: hasharray[2].amount,
                new_mutable_data: [{"key": "level", "value": ["uint64", 1]}]
            },
        }

        await session.transact({action}).then(({transaction}) => {
            console.log(`Transaction broadcast! Id: ${transaction.id}`)
        })
    },
    createHash:async function (account, bitcoinamount) {
        var hash;
        var random_array;
        var good = false;
        var hex_digist;
        var amount = bitcoinamount.toString();


        while (!good  ) {

            random_array = this.randomString(12);
            account = account.toString();
            var message = account   + amount + random_array;
            hash = ecc.sha256(message);
            hex_digist = hash;

            good = hex_digist.substr(0,2) == '00';
        }

        var returnValues = [{
            hash: hex_digist
        },
        {
            array: random_array
        },
        {
            amount: amount
        }];
        return returnValues;
    },
    getRand: function () {
        const arr = new Uint8Array(8);
        for (let i=0; i < 8; i++){
            const rand = Math.floor(Math.random() * 255);
            arr[i] = rand;
        }
        return arr;
    },
    toHex: function (buffer) {
        return [...new Uint8Array (buffer)]
            .map (b => b.toString (16).padStart (2, "0"))
            .join ("");
    },
  randomString: function (length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
    },
    updateAsset: async function (account, id, newLevel, bitcoinamount ) {
        var nonce;
        var hash;
        var hashResult = await this.createHash(account, bitcoinamount);
        hash = hashResult[0].hash;
        nonce = hashResult[1].array;


        const action = {
            account: 'waxclicker12',
            name: 'upgrade',
            authorization: [{ actor: account, permission: "active" }],
            data: {
                asset_id: id,
                asset_owner: account,
                new_mutable_data: [{"key": "level", "value": ["uint64", newLevel]}],
                memo: nonce,
                hash: hash,
                amount: hashResult[2].amount
            },
        }
        await session.transact({action}).then(({transaction}) => {
            console.log(`Transaction broadcast! Id: ${transaction.id}`)
        })
    }


}
