#include <satoshiclicker.hpp>
/** 
 * Calls the atomicassets mintasset action, as this contract is authorized to mint NFTs.
 * 
 * @required_auth: new_asset_owner account 
*/
ACTION satoshiclicker::mintasset(name collection_name, name schema_name,
                                 int32_t template_id, name new_asset_owner, ATTRIBUTE_MAP mutable_data, string amount, string memo, string hash)
{
    require_auth(new_asset_owner);

    // check is required to avoid string length overflow
    check(memo.length() == 12 && amount.length() < 150 && name{new_asset_owner}.to_string().length() < 15, "Invalid memo!");

    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    check(schema_name != "invfriends"_n, "Invalid call!");

    auto playerItr = players.find(new_asset_owner.value);
    check(!(playerItr->banned) && (playerItr->paid), "No access!");

    validate(new_asset_owner, memo, hash, amount);

    ATTRIBUTE_MAP immutable_data;

    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, new_asset_owner, immutable_data, mutable_data, NULL))
        .send();
    updatebtc(new_asset_owner, amount);
}

/**
 * Mints the special NFT for the referee and the receiver.
 * 
 * @required_auth: the receiver account  
*/
ACTION satoshiclicker::mintrefasset(name collection_name, name schema_name, int32_t template_id, name ref, name receiver, ATTRIBUTE_MAP mutable_data)
{
    require_auth(receiver);
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");

    auto receiverItr = players.find(receiver.value);
    auto refItr = players.find(ref.value);

    check(!(refItr->banned) && !(receiverItr->banned) && refItr->paid && receiverItr->paid, "No access!");
    check(schema_name == "invfriends"_n, "Wrong schema!");
    check(!(receiverItr->received), "Already received NFT!");

    ATTRIBUTE_MAP immutable_data;
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, ref, immutable_data, mutable_data, NULL))
        .send();
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, receiver, immutable_data, mutable_data, NULL))
        .send();
    players.modify(receiverItr, get_self(), [&](auto &p)
                   { p.received = true; });
}

/**
 * Upgrades an asset with new_mutable_data.
 * 
 * @required_auth: the asset_owner account
*/
ACTION satoshiclicker::upgrade(name asset_owner, uint64_t asset_id, ATTRIBUTE_MAP new_mutable_data, string amount, string memo, string hash)
{
    require_auth(asset_owner);

    // check is required to avoid string length overflow
    check(memo.length() == 12 && amount.length() < 150 && name{asset_owner}.to_string().length() < 15, "Invalid memo!");
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");

    auto playerItr = players.find(asset_owner.value);
    check(!(playerItr->banned) && (playerItr->paid), "No access!");
    validate(asset_owner, memo, hash, amount);

    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "setassetdata"_n, std::make_tuple(get_self(), asset_owner, asset_id, new_mutable_data))
        .send();
    updatebtc(asset_owner, amount);
}
/**
 * Bans an account.
 * 
 * @required_auth: the contract itself
*/
ACTION satoshiclicker::ban(name user)
{
    require_auth(get_self());
    // check if the user already exists
    auto playerItr = players.find(user.value);
    players.modify(playerItr, get_self(), [&](auto &p)
                   { p.banned = true; });
}

/**
 * Unbans an account.
 * 
 * @required_auth: the contract itself 
*/
ACTION satoshiclicker::unban(name user)
{
    require_auth(get_self());
    require_auth(get_self());
    // check if the user already exists
    auto playerItr = players.find(user.value);
    players.modify(playerItr, get_self(), [&](auto &p)
                   { p.banned = false; });
}

/**
 * Freezes the smart contract so no action are available.
 * 
 * @required_auth: the contract itself
*/
ACTION satoshiclicker::freeze()
{
    require_auth(get_self());
    setFreezeFlag(1);
}

/**
 * Unfreezes the smart contract.
 * 
 * @required_auth: the contract itself
*/
ACTION satoshiclicker::unfreeze()
{
    require_auth(get_self());
    setFreezeFlag(0);
}

/**
* Initialzies the player and puts him into the table.
* @require_auth: the player account
*/
ACTION satoshiclicker::login(name player)
{
    require_auth(player);
    check(players.find(player.value) == players.end(), "Already registered!");

    players.emplace(player, [&](auto &p)
                    {
                        p.user = player;
                        p.btc = "0";
                        p.banned = false;
                        p.received = false;
                        p.paid = false;
                    });
}

/**
* Checks wether a player is valid or not.
* Helper function for frontend
*/
ACTION satoshiclicker::checkplayer(name player)
{
    auto playerItr = players.find(player.value);
    check(playerItr != players.end(), "Not registered!");
    check(playerItr->paid, "No payment received!");
}
/**
* Listener for WAX transfers. Buys RAM with the sent WAX.
* Smart contract will never have WAX as it will be used to instantaneously buy RAM
*/
[[eosio::on_notify("eosio.token::transfer")]] void satoshiclicker::on_token_transfer(name from, name to, asset quantity, string memo)
{
    if (to == get_self() && quantity.symbol.raw() == symbol{"WAX", 8}.raw()) //Smart Contract only listens to WAX transfers
    {
        check(quantity.amount >= 1, "Need to pay at least 1 WAX.");
        auto playerItr = players.find(from.value);
        check(playerItr != players.end(), "Not registered!");
        players.modify(playerItr, get_self(), [&](auto &p)
                       { p.paid = true; });

        symbol TOKEN_SYMBOL = symbol{"WAX", 8};
        auto itr = accounts.find(TOKEN_SYMBOL.code().raw());

        check(itr != accounts.end(), "The token doesn't exist in the token contract, or the account doesn't own any of these tokens.");

        auto balance = itr->balance;
        check(balance.amount > 0, "Insufficient amount!");
        action(permission_level{get_self(), "active"_n}, "eosio"_n, "buyram"_n, std::make_tuple(get_self(), get_self(), balance)).send();
    }
}

/**
 * Updates the amount of btc for the user.
*/
void satoshiclicker::updatebtc(name user, string btc)
{
    auto playerItr = players.find(user.value);
    players.modify(playerItr, get_self(), [&](auto &p)
                   { p.btc = btc; });
}

/**
 * Validates if the given arguments hash into the same hash send by the caller.
*/
void satoshiclicker::validate(name owner, string memo, string hash, string btc)
{
    const string &value = (name{owner}.to_string() + btc + memo);
    checksum256 log = sha256(value.c_str(), value.length());
    string result;
    const char *hex_chars = "0123456789abcdef";
    const auto bytes = log.extract_as_byte_array();
    // Iterate hash and build result
    for (uint32_t i = 0; i < bytes.size(); ++i)
    {
        (result += hex_chars[(bytes.at(i) >> 4)]) += hex_chars[(bytes.at(i) & 0x0f)];
    }

    auto playerItr = players.find(owner.value);
    string oldbtc = playerItr->btc;

    check(result == hash && hash[0] == '0' && hash[1] == '0' && oldbtc != btc, "Invalid memo! Produced hash: " + result + ", Passed hash: " + hash);
}
