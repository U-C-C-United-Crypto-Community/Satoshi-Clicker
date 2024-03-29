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
import regeneratorRuntime from "regenerator-runtime";
import { api } from "./app";
import { SPECIAL_ITEMS, COLLECTION } from "./constants";

module.exports = {
  specialTemplates: [],
  /**
   * function which calculates the special nft multiplier
   * @param account to calculate the multiplier for
   * @param api: wax api
   * @returns {Promise<number>} the multiplier
   */
  calculateMultiplier: async function (account) {
    var multiplier = 0.0;
    var freibierMulti = 0.0;
    //load the templates of the special nfts
    await this.getSpecialTemplates();

    //iterate over all special nfts
    for (var i = 0; i < SPECIAL_ITEMS.length; i++) {
      var itemAmount = 0;
      var asset = await this.findSpecialNft(
        SPECIAL_ITEMS[i].template_id,
        account
      );
      var template = this.specialTemplates.find(
        (val) => val.id === SPECIAL_ITEMS[i].template_id
      ).data;
      var nftMulti = 0;

      //check if the account owns the current special nft
      if (asset !== undefined) {
        itemAmount = asset.assets;
        nftMulti = template.multiplier;

        //if its a freibier special nft make sure to only use the highest tier
        if (template.name.includes("Freibier") && itemAmount > 0) {
          document.getElementById(template.name).style.display = "block";
          document.getElementById(template.name).children[2].textContent =
            "Multiplier: " + nftMulti;
          if (nftMulti > freibierMulti) freibierMulti = nftMulti;
        }
        //if its no freibier nft it must be a friends nft
        else {
          multiplier += nftMulti * itemAmount;
          if (itemAmount > 0) {
            document.getElementById(template.name).style.display = "block";
            document.getElementById(template.name).children[1].textContent =
              "FRIENDS LEVEL: " + itemAmount;
            document.getElementById(template.name).children[3].textContent =
              "Multiplier: " + (nftMulti * itemAmount).toString();
          }
        }
      }
    }
    multiplier += freibierMulti;
    return multiplier;
  },
  /**
   * finds a special nft on an account
   * @param id: template id of the nft to be found
   * @param account: which gets checked for the nft
   * @returns {Promise<*>} the found asset
   */
  findSpecialNft: async function (id, account) {
    var assets = (await api.getAccount(account)).templates;

    const asset = assets.find((val) => {
      return val.template_id === id;
    });
    return asset;
  },
  /**
   * loads all special nft templates
   * @returns {Promise<void>} -
   */
  getSpecialTemplates: async function () {
    for (let i = 0; i < SPECIAL_ITEMS.length; i++) {
      const id = SPECIAL_ITEMS[i].template_id;
      const name = SPECIAL_ITEMS[i].name;
      const data = (await api.getTemplate(COLLECTION, id)).immutable_data;

      const result = { name, id, data };
      this.specialTemplates.push(result);
    }
  },
};
