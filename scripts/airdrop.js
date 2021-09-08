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
  /**
   * show a modal containing a message and if the verification was succesfull the private key
   * @param msg to be shown
   * @param privateKey to the airdrop
   */
  showVerificationDialog: function (msg, privateKey) {
    var modal = document.getElementById("pkModal");
    var mcontent = document.getElementById("pkContent");
    var span = document.getElementById("pkSpan");

    modal.style.display = "block";

    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
    mcontent.innerText = msg + privateKey;
  },
  /**
   * checks if the verification was succesfull and shows a corresponding message
   * @param api from atomicasset
   * @param account of the user
   * @returns {Promise<void>} -
   */
  verifyCollection: async function (api, account) {
    var count = await this.checkForAirdrop(api, account);
    if (count > 0) {
      this.fetchJson(count);
    } else {
      this.showVerificationDialog(
        "",
        "Verification not succesful!\nYou do not own any NFTs from the 1cryptobeard collection!"
      );
    }
  },
  /**
   * if the verification was succesfull this function creates the message containing the private key
   * @param amount of NFTs found
   */
  fetchJson: function (amount) {
    fetch("./test.json")
      .then((response) => response.json())
      .then((data) =>
        this.showVerificationDialog(
          data["Private Key"],
          "Authentification was succesful! Found " +
            amount +
            " assets from 1cryptobeard" +
            "\n" +
            "Link for the airdrop: "
        )
      )
      .catch((err) => console.log(err));
  },
  /**
   * counts the number of NFTs from the 1cryptobeard collection
   * @param api: atmoicasset api
   * @param account of the user
   * @returns {Promise<number>} amount of NFTs from 1 cryptobeard
   */

  checkForAirdrop: async function (api, account) {
    var assets = (await api.getAccount(account)).templates;
    var count = 0;

    for (var i = 0; i < assets.length; i++) {
      const collection = assets[i].collection_name;

      if (collection == "1cryptobeard") count++;
    }
    return count;
  },
};
