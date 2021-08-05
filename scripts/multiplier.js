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
    specialTemplates: [],
    calculateMultiplier: async function (account, api) {
        var multiplier = 0.0;
        var freibierMulti = 0.0;
        await this.getSpecialTemplates(api);

        for (var i = 0; i < special_items.length; i++) {
            var itemAmount = 0;
            var asset = await this.findSpecialNft(special_items[i].template_id, account, api);
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
    findSpecialNft: async function (id, account, api) {
        var assets = (await api.getAccount(account)).templates;

        const asset = assets.find((val) => {
            return val.template_id === id;
        });
        return asset;
    },
    getSpecialTemplates: async function(api) {
        for (let i = 0; i < special_items.length; i++) {
            const id = special_items[i].template_id;
            const name = special_items[i].name;
            const data = (await api.getTemplate("waxbtcclick1", id)).immutable_data;

            const result = { name, id, data };
            this.specialTemplates.push(result);
        }
    }
}