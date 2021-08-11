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

    // check(collection_name == "satoshiclick"_n, "Wrong collection!")
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    check(schema_name != "invfriend"_n, "Invalid call!");
    check(black_list.find(new_asset_owner.value) == black_list.end(), "User is banned!");

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
 * Receiver will be stored as he is only allowed to receive a special NFT once. 
 * 
 * @required_auth: the receiver account  
*/
ACTION satoshiclicker::mintrefasset(name collection_name, name schema_name, int32_t template_id, name ref, name receiver)
{
    require_auth(receiver);
    // check(collection_name == "satoshiclick"_n, "Wrong collection!")
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    check(black_list.find(ref.value) == black_list.end() && black_list.find(receiver.value) == black_list.end(), "User is banned!");
    check(schema_name == "invfriends"_n && ref_list.find(receiver.value) == ref_list.end(),
          "Receiver already has another friend :(");

    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, ref, NULL, NULL, NULL))
        .send();
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, receiver, NULL, NULL, NULL))
        .send();

    ref_list.emplace(get_self(), [&](auto &u)
                     { u.user = receiver; });
}

/**
 * Upgrades an asset with new_mutable_data.
 * 
 * @required_auth: the asset_owner account
*/
ACTION satoshiclicker::upgrade(name asset_owner, uint64_t asset_id, ATTRIBUTE_MAP new_mutable_data, string amount, string memo, string hash)
{
    require_auth(asset_owner);

    // check(collection_name == "satoshiclick"_n, "Wrong collection!")

    // check is required to avoid string length overflow
    check(memo.length() == 12 && amount.length() < 150 && name{asset_owner}.to_string().length() < 15, "Invalid memo!");
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    check(black_list.find(asset_owner.value) == black_list.end(), "User is banned!");
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
    check(black_list.find(user.value) == black_list.end(), "User is already banned!");
    black_list.emplace(get_self(), [&](auto &u)
                       { u.user = user; });
}

/**
 * Unbans an account.
 * 
 * @required_auth: the contract itself 
*/
ACTION satoshiclicker::unban(name user)
{
    require_auth(get_self());
    auto itr = black_list.find(user.value);
    check(itr != black_list.end(), "User is not banned!");
    black_list.erase(itr);
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
 * Updates the amount of btc for the user.
*/
void satoshiclicker::updatebtc(name user, string btc)
{
    auto itr = btc_list.find(user.value);
    if (itr == btc_list.end())
    {
        btc_list.emplace(get_self(), [&](auto &u)
                         {
                             u.user = user;
                             u.btc = btc;
                         });
    }
    else
    {
        btc_list.modify(itr, get_self(), [&](auto &u)
                        { u.btc = btc; });
    }
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
    string oldbtc;
    auto itr = btc_list.find(owner.value);
    if (itr != btc_list.end())
    {
        oldbtc = itr->btc;
    }

    check(result == hash && hash[0] == '0' && hash[1] == '0' && oldbtc != btc, "Invalid memo! Produced hash: " + result + ", Passed hash: " + hash);
}
