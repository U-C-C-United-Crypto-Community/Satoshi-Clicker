module.exports = {
    mintSpecialNft: async function (ref) {
        const action = {
            account: 'waxclicker12',
            name: 'mintasset',
            authorization: [{actor: wax.userAccount, permission: "active"}],
            data: {
                authorized_minter: "waxclicker12",
                collection_name: TEST_COLLECTION, //"waxbtcclickr",
                schema_name: "invfriend",
                template_id: special_items[0].template_id,
                new_asset_owner: wax.userAccount,
                mutable_data: {
                    referrer: ref,
                    receiver: wax.userAccount,
                },
            },
        }
        await session.transact({action}).then(({transaction}) => {
            console.log(`Transaction broadcast! Id: ${transaction.id}`)
        })
        await this.mintNftForRef(ref);
    },
    mintNftForRef: async function (ref) {
        const action = {
            account: 'waxclicker12',
            name: 'mintasset',
            authorization: [{actor: wax.userAccount, permission: "active"}],
            data: {
                authorized_minter: "waxclicker12",
                collection_name: TEST_COLLECTION, //"waxbtcclickr",
                schema_name: "invfriend",
                template_id: special_items[0].template_id,
                new_asset_owner: ref,
                mutable_data: {
                    referrer: ref,
                    receiver: wax.userAccount,
                },
            },
        }
        await session.transact({action}).then(({transaction}) => {
            console.log(`Transaction broadcast! Id: ${transaction.id}`)
        })
    },
    detectRef: async function (ls, dp, userAccount) {
        var receivedRef = false;
        const keys = ls.getAllKeys();

        if (keys.length == 0 || !keys.includes("ref"))
            ls.set("ref", false);
        else {
            receivedRef = ls.get("ref");
        }

        let url = new URL(window.location.href);

        if (url.searchParams.has("ref") && !receivedRef)
        {
            var ref;

            for (let [name, value] of url.searchParams) {

                if (dp.sanitize(name) == "ref")
                    ref = dp.sanitize(value);
            }
            console.log(ref);

            if (ref != userAccount) {
                console.log("Reflink detected");
                await this.mintSpecialNft(ref)
                ls.set("ref", true);
            } else {
                console.log("You cant refer yourself!");
            }
        }
        else {
            console.log("No reflink detected or you already received a ref");
        }
    }
}