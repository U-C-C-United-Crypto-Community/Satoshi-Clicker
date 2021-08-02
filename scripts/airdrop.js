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