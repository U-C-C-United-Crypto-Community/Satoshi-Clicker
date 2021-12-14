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
import { wax } from "./wax";
import { dp } from "./app";
import $ from "jquery";
import { CONTRACT_ADDRESS } from "./constants";

module.exports = {
  /**
   * Shows a dialog during which the user inputs how much wax he wants to donate.
   * @returns {Promise<void>}
   */

  showDialog: async function () {
    var modal = document.getElementById("myModal");
    var span = document.getElementById("closeSpan");
    var content = document.getElementById("content");
    var input = document.getElementById("quantity");

    $("#closeDonate").on("click", () => {
      modal.style.display = "none";
    });

    content.innerText = "How much WAX do you wanna donate RAM?";

    modal.style.display = "block";
    var donationModule = this;

    span.onclick = async function () {
      modal.style.display = "none";

      //Get user input
      let value = input.value;
      if (value !== "") value = parseFloat(value);

      //Do transaction with the value
      if (typeof value != "number") alert("Please input a number");
      else {
        donationModule.sendDonation(value);
      }
    };

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  },
  /**
   * executes the donation transaction
   * @param amount of wax to be donated
   * @returns {Promise<void>} -
   */

  sendDonation: async function (amount) {
    if (wax.userAccount === undefined) {
      await wax.login();
    }

    //convert amount into the right format
    amount = amount.toFixed(8).toString() + " WAX";
    console.log(amount);
    //execute transaction
    const action = {
      account: "eosio",
      name: "buyram",
      authorization: [
        {
          actor: wax.userAccount,
          permission: "active",
        },
      ],
      data: {
        payer: wax.userAccount,
        receiver: CONTRACT_ADDRESS,
        quant: amount,
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
  },
};
