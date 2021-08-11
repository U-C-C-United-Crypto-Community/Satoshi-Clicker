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
    mintSpecialNft: async function (ref, account, showItems) {
        try{
            const action = {
                account: 'waxclicker12',
                name: 'mintrefasset',
                authorization: [{actor: account, permission: "active"}],
                data: {
                    collection_name: TEST_COLLECTION, //"waxbtcclickr",
                    schema_name: "invfriends",
                    template_id: special_items[0].template_id,
                    ref: ref,
                    receiver: account,
                    mutable_data: [{"key": "receiver", "value": ["string", account.toString()]}]
                },
            }

            await session.transact({action}).then(({transaction}) => {
                console.log(`Transaction broadcast! Id: ${transaction.id}`)
            })
        }
        catch (e) {
            console.log(e);
            showItems("block");
        }
    },
    detectRef: async function (ls, dp, userAccount, showItems, api) {
        let url = new URL(window.location.href);

        if (url.searchParams.has("ref") && !await this.checkForRefNft(userAccount, api))
        {
            var ref;

            for (let [name, value] of url.searchParams) {
                if (dp.sanitize(name) == "ref")
                    ref = dp.sanitize(value);
            }
            if (ref != userAccount) {
                await this.mintSpecialNft(ref, userAccount, showItems)
            }
        }

    },
    checkForRefNft: async function (account, api) {
        var assets = await api.getAssets({owner: account, collection_name: "waxclickbeta", template_id: special_items[0].template_id});
        for (var i = 0; i < assets.length; i++) {
            if (assets[i].mutable_data.receiver == account)
                return true;
        }
        return false;
    }
}