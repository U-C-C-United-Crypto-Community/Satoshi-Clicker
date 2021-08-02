const { ExplorerApi } = require("atomicassets");
const api = new ExplorerApi(ATOMIC_TEST_URL, "atomicassets", {
    fetch,
});

module.exports = {
    specialTemplates: [],
    calculateMultiplier: async function (account) {
        var multiplier = 0.0;
        var freibierMulti = 0.0;
        await this.getSpecialTemplates();

        for (var i = 0; i < special_items.length; i++) {
            var itemAmount = 0;
            var asset = await this.findSpecialNft(special_items[i].template_id, account);
            var template = this.specialTemplates.find((val) => val.id === special_items[i].template_id).data;
            var nftMulti = 0;

            if (asset !== undefined) {

                itemAmount = asset.assets;
                nftMulti = template.multiplier;

                if (template.name.includes("Freibier") && itemAmount > 0)
                {
                    document.getElementById(template.name).style.display = "block";
                    document.getElementById(template.name).children[2].textContent = "Multiplier: " + nftMulti;
                    if (nftMulti > freibierMulti)
                        freibierMulti = nftMulti;
                }
                else {
                    multiplier += nftMulti * itemAmount;
                    if (itemAmount > 0)
                    {
                        document.getElementById(template.name).style.display = "block";
                        document.getElementById(template.name).children[1].textContent = "FRIENDS LEVEL: " + itemAmount;
                        document.getElementById(template.name).children[3].textContent = "Multiplier: " + (nftMulti * itemAmount).toString();

                    }
                }

            }
        }
        multiplier += freibierMulti;
        return multiplier;
    },
    findSpecialNft: async function (account) {
        var assets = (await api.getAccount(account)).templates;

        const asset = assets.find((val) => {
            return val.template_id === id;
        });
        return asset;
    },
    getSpecialTemplates: async function() {
        for (let i = 0; i < special_items.length; i++) {
            const id = special_items[i].template_id;
            const name = special_items[i].name;
            const data = (await api.getTemplate("waxbtcclick1", id)).immutable_data;

            const result = { name, id, data };
            this.specialTemplates.push(result);
        }
    }
}