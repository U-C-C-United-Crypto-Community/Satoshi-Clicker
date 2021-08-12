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
     * mints the invfriends special nft
     * @param ref: referrer of the item
     * @param account: current user -> the receiver of the invitation
     * @param showItems: function to show all items again
     * @returns {Promise<void>} -
     */
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
                    mutable_data: [{"key": "receiver", "value": ["string", account.toString()]}, {"key": "ref", "value": ["string", ref.toString()]}]
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
    /**
     * detects a ref link
     * @param ls
     * @param dp: dompurifier to escape user input
     * @param userAccount: current user
     * @param showItems: function to show all items
     * @param api: wax api
     * @returns {Promise<void>}
     */
    detectRef: async function (ls, dp, userAccount, showItems, api) {
        let url = new URL(window.location.href);

        //if the url has the right search param and the current user doesnt already have a special nft
        if (url.searchParams.has("ref") && !await this.checkForRefNft(userAccount, api))
        {
            var ref;

            //escape the parameters before using them
            for (let [name, value] of url.searchParams) {
                if (dp.sanitize(name) == "ref")
                    ref = dp.sanitize(value);
            }
            //check if ref ist diffrent from the current user -> if true start minting
            if (ref != userAccount) {
                await this.mintSpecialNft(ref, userAccount, showItems)
            }
        }

    },
    /**
     * checks if the account already received a special nft
     * @param account current user
     * @param api: wax api
     * @returns {Promise<boolean>} true if a special nft was already received else false
     */
    checkForRefNft: async function (account, api) {
        var assets = await api.getAssets({owner: account, collection_name: "waxclickbeta", template_id: special_items[0].template_id});
        for (var i = 0; i < assets.length; i++) {
            if (assets[i].mutable_data.receiver == account)
                return true;
        }
        return false;
    }
}