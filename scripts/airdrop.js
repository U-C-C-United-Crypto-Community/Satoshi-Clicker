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
    verifyCollection: async function (api, account) {
        var count = await this.checkForAirdrop(api, account);
        if (count > 0) {
            this.fetchJson(count);
        }
        else {
            this.showVerificationDialog("", "Verification not succesfull");
        }
    },
    fetchJson: function (amount) {
        fetch('./test.json').then(response => response.json())
            .then(data => this.showVerificationDialog(data["Private Key"], "Authentification was succesfull! Found "
                + amount + " assets from 1cryptobeard" + "\n" + "Link for the airdrop: "))
            .catch(err => console.log(err));
    },
    checkForAirdrop: async function (api, account) {
        var assets = (await api.getAccount(account)).templates;
        var count = 0;

        for (var i = 0; i < assets.length; i++) {
            const collection = assets[i].collection_name;

            if (collection == "1cryptobeard")
                count++;
        }
        return count;
    }
}