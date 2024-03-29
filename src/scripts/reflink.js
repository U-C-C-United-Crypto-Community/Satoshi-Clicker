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
import { api, dp } from "./app";
import { wax } from "./wax";
import { COLLECTION, SPECIAL_ITEMS } from "./constants";

module.exports = {
  /**
   * mints the invfriends special nft
   * @param ref referrer of the item
   * @param account current user -> the receiver of the invitation
   * @param showItems function to show all items again
   * @returns {Promise<void>} -
   */
  mintSpecialNft: async function (ref, account, showItems) {
    try {
      const action = {
        account: CONTRACT_ADDRESS,
        name: "mintrefasset",
        authorization: [{ actor: account, permission: "active" }],
        data: {
          collection_name: COLLECTION,
          schema_name: "invfriends",
          template_id: SPECIAL_ITEMS[0].template_id,
          ref: ref,
          receiver: account,
          mutable_data: [
            { key: "receiver", value: ["string", account.toString()] },
            { key: "ref", value: ["string", ref.toString()] },
          ],
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
      } else {
        alert("Error!");
      }
      showItems("block");
      return false;
    }
  },
  /**
   * detects a ref link
   * @param dp: dompurifier to escape user input
   * @param userAccount: current user
   * @param showItems: function to show all items
   * @param api: wax api
   * @returns {Promise<void>}
   */
  detectRef: async function (showItems) {
    let url = new URL(window.location.href);
    let userAccount = wax.userAccount;
    let hasRef = await this.checkForRefNft(userAccount);
    //if the url has the right search param and the current user doesnt already have a special nft
    if (url.searchParams.has("ref") && !hasRef) {
      let ref;

      //escape the parameters before using them
      for (let [name, value] of url.searchParams) {
        if (dp.sanitize(name) == "ref") ref = dp.sanitize(value);
      }
      //check if ref ist diffrent from the current user -> if true start minting
      if (ref != userAccount) {
        return await this.mintSpecialNft(ref, userAccount, showItems);
      }
    }
    return hasRef;
  },
  /**
   * checks if the account already received a special nft
   * @param account current user
   * @returns {Promise<boolean>} true if a special nft was already received else false
   */
  checkForRefNft: async function (account) {
    var assets = await api.getAssets({
      owner: account,
      collection_name: COLLECTION,
      template_id: SPECIAL_ITEMS[0].template_id,
    });
    for (var i = 0; i < assets.length; i++) {
      if (assets[i].mutable_data.receiver == account) return true;
    }
    return false;
  },
};
