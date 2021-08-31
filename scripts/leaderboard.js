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
     * function which does everything necessary to show the leaderboard
     * @param api: wax api
     * @param templates: current templates of all items
     * @param items: list containing all items
     * @param calculateMultiplier: function to calculate the multiplier of an account
     * @param roundNumber: function to round a number
     * @param findAssetID: function for finding an asset
     * @returns {Promise<void>} -
     */
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
    /**
     * calculates the leader board
     * @param api: wax api
     * @param templates: templates of the current items
     * @param items: list of the current items
     * @param calculateMultiplier: function to calculate the multiplier for an account
     * @param roundNumber: function to round a number
     * @param findAssetID: function for finding an asset
     * @returns {Promise<void>} -
     */
    createLeaderboard: async function (api, templates, items, calculateMultiplier, roundNumber, findAssetID) {
        document.getElementById("lbLoading").style.display = "inline-block";
        document.getElementById("refreshSpan").style.display = "none";

        var scores = new Map();

        //iterate over all items
        for (var j = 0; j < items.length; j++) {

            var bits_per_sec = 0;

            //fetch all accounts which own a version of the current item
            var accounts = await api.getAccounts({ collection_name: "betawaxclick", schema_name: "equipments", template_id: items[j].template_id, });
            if (accounts.length == 0)
                continue;

            //get the template of the current item
            const template = templates.find((val) => val.name === items[j].name).data;
            bits_per_sec = template.rate;

            await this.fillScores(accounts, scores, bits_per_sec, items[j].template_id, findAssetID);

            //wait a second because of rate limiting
            await this.sleep(1000);
        }
        //multiply the values in the map with the account multiplier
        for (let [key, value] of scores) {
            var multiplier = await calculateMultiplier.calculateMultiplier(key, api);
            var newValue = value * (1 + multiplier);
            scores.set(key, newValue);
        }
        //sort the map descending
        scores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
        this.fillLeaderboard(scores, roundNumber);
    },
    /**
     * fills the scores map with values
     * @param accounts which own a NFT of the current item
     * @param scores: the map containing all the scores
     * @param bits_per_sec of the current item
     * @param templateId of the current item
     * @param findAssetID function for getting the highest level of the current item per account
     * @returns {Promise<void>} -
     */
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
    /**
     * function which handels the displaying of the leaderboard
     * @param scores: map with all scores
     * @param roundNumber: function to round the score numbers
     */
    fillLeaderboard: function (scores, roundNumber) {
        var counter = 1;

        //iterate over the sorted map
        for (let [key, value] of scores) {
            var currentText = document.getElementById("lb" + counter);
            var valueString = roundNumber(value)

            currentText.innerText = counter + ". " + key + " - " + valueString + value > 0.1 ? " B/SEC" : "Satoshi/SEC";
            counter++;
        }
        //Finished loading -> we can now show the button to refresh
        document.getElementById("lbLoading").style.display = "none";
        document.getElementById("refreshSpan").style.display = "inline-block";
    },
    /**
     * sleep function for rate limiting
     * @param ms:  amount of ms to sleep 1000ms = 1s
     * @returns {Promise<unknown>}
     */

    sleep: function (ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}