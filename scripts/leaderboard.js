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
    showLeaderBoard: async function (api, templates, items, calculateMultiplier, roundNumber, findAssetID) {
        var close = document.getElementById("closeLbSpan");
        var modal = document.getElementById("leaderboardModal");
        modal.style.display = "block";
        close.style.display = "inline-block";
        await this.createLeaderboard(api, templates, items, calculateMultiplier, roundNumber, findAssetID);

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        //Close Button
        close.onclick = function () {
            modal.style.display = "none";
        }

        //Refresh Button
        var refresh = document.getElementById("refreshSpan");
        refresh.onclick = function () {
            this.showLeaderBoard(api, templates, items, calculateMultiplier, roundNumber, findAssetID);
        }
    },
    createLeaderboard: async function (api, templates, items, calculateMultiplier, roundNumber, findAssetID) {
        document.getElementById("lbLoading").style.display = "inline-block";
        document.getElementById("refreshSpan").style.display = "none";

        var scores = new Map();

        //iterate over all items
        for (var j = 0; j < items.length; j++) {

            var bits_per_sec = 0;

            //fetch all accounts which own a version of the current item
            var accounts = await api.getAccounts({ collection_name: "waxbetaclick", schema_name: "equipments", template_id: items[j].template_id, });
            if (accounts.length == 0)
                continue;

            //get the template of the current item
            const template = templates.find((val) => val.name === items[j].name).data;
            bits_per_sec = template.rate;

            await this.fillScores(accounts, scores, bits_per_sec, items[j].template_id, findAssetID);

            //wait a second because of rate limiting
            await this.sleep(1000);
        }
        //sort the map descending
        for (let [key, value] of scores) {
            var multiplier = await calculateMultiplier.calculateMultiplier(key, api);
            var newValue = value * (1 + multiplier);
            scores.set(key, newValue);
        }
        scores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
        this.fillLeaderboard(scores, roundNumber);
    },
    fillScores: async function (accounts, scores, bits_per_sec, templateId, findAssetID) {
        for (var i = 0; i < accounts.length; i++) {
            var bitcoinrate = 0;

            //if the account already exists get the current score
            if (scores.has(accounts[i].account)) {
                bitcoinrate = scores.get(accounts[i].account)
            }
            var currentAsset = await findAssetID(templateId, accounts[i].account);
            var level = currentAsset[1].level;

            //set and save the new bitcoinrate
            bitcoinrate = bitcoinrate + level * bits_per_sec;

            scores.set(accounts[i].account, bitcoinrate);
        }
    },
    fillLeaderboard: function (scores, roundNumber) {
        var counter = 1;

        //iterate over the sorted map
        for (let [key, value] of scores) {
            var currentText = document.getElementById("lb" + counter);
            var valueString = roundNumber(value)

            currentText.innerText = counter + ". " + key + " - " + valueString + " B/SEC";
            counter++;
        }
        //Finished loading -> we can now show the button to refresh
        document.getElementById("lbLoading").style.display = "none";
        document.getElementById("refreshSpan").style.display = "inline-block";
    },
    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}