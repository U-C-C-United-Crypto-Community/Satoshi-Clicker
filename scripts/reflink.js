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

module.exports = {
  mintSpecialNft: async function (ref, account, showItems) {
    try {
      const action = {
        account: "waxclicker12",
        name: "mintrefasset",
        authorization: [{ actor: account, permission: "active" }],
        data: {
          collection_name: TEST_COLLECTION, //"waxbtcclickr",
          schema_name: "invfriends",
          template_id: special_items[0].template_id,
          ref: ref,
          receiver: account,
        },
      };

      await session.transact({ action }).then(({ transaction }) => {
        console.log(`Transaction broadcast! Id: ${transaction.id}`);
      });
    } catch (e) {
      console.log(e);
      showItems("block");
    }
  },
  detectRef: async function (ls, dp, userAccount, showItems) {
    var receivedRef = false;
    const keys = ls.getAllKeys();

    if (keys.length == 0 || !keys.includes("ref")) ls.set("ref", false);
    else {
      receivedRef = ls.get("ref");
    }

    let url = new URL(window.location.href);

    if (url.searchParams.has("ref") && !receivedRef) {
      var ref;

      for (let [name, value] of url.searchParams) {
        if (dp.sanitize(name) == "ref") ref = dp.sanitize(value);
      }

      if (ref != userAccount) {
        await this.mintSpecialNft(ref, userAccount, showItems);
        ls.set("ref", true);
      } else {
      }
    }
  },
};
