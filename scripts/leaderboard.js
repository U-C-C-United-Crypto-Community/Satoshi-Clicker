module.exports = {
    showLeaderBoard: async function (api, templates, items, calculateMultiplier, roundNumber) {
        var close = document.getElementById("closeLbSpan");
        var modal = document.getElementById("leaderboardModal");
        modal.style.display = "block";
        close.style.display = "inline-block";
        await this.createLeaderboard(api, templates, items, calculateMultiplier, roundNumber);

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
            this.showLeaderBoard(api, templates, items, calculateMultiplier, roundNumber);
        }
    },
    createLeaderboard: async function (api, templates, items, calculateMultiplier, roundNumber) {
        document.getElementById("lbLoading").style.display = "inline-block";
        document.getElementById("refreshSpan").style.display = "none";

        var scores = new Map();

        //iterate over all items
        for (var j = 0; j < items.length; j++) {

            var bits_per_sec = 0;

            //fetch all accounts which own a version of the current item
            var accounts = await api.getAccounts({ collection_name: "waxbtcclick1", schema_name: "equipments", template_id: items[j].template_id, });


            //get the template of the current item
            const template = templates.find((val) => val.name === items[j].name).data;
            bits_per_sec = template.rate;

            this.fillScores(accounts, scores, bits_per_sec);

            //wait a second because of rate limiting
            await this.sleep(1000);
        }
        //sort the map descending
        for (let [key, value] of scores) {
            scores.set(key, value * (1 + await calculateMultiplier.calculateMultiplier(key, api)));
        }
        scores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
        this.fillLeaderboard(scores, roundNumber);
    },
    fillScores: function (accounts, scores, bits_per_sec) {
        for (var i = 0; i < accounts.length; i++) {
            var bitcoinrate = 0;

            //if the account already exists get the current score
            if (scores.has(accounts[i].account)) {
                bitcoinrate = scores.get(accounts[i].account)
            }

            //set and save the new bitcoinrate
            bitcoinrate = bitcoinrate + accounts[i].assets * bits_per_sec;

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