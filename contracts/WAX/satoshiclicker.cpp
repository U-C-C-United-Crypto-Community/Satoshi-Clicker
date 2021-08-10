#include <satoshiclicker.hpp>

ACTION satoshiclicker::mintasset(name collection_name, name schema_name,
                                 int32_t template_id, name new_asset_owner, ATTRIBUTE_MAP mutable_data, string amount, string memo, string hash)
{
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    validate(new_asset_owner, memo, hash, amount);
    require_auth(new_asset_owner);
    check(schema_name != "invfriend"_n, "Invalid call!");
    check(black_list.find(new_asset_owner.value) == black_list.end(),
          "User is banned!");
    ATTRIBUTE_MAP immutable_data;
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, new_asset_owner, immutable_data, mutable_data, NULL))
        .send();
    updatebtc(new_asset_owner, amount);
}

ACTION satoshiclicker::mintrefasset(name collection_name, name schema_name, int32_t template_id, name ref, name receiver)
{
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    require_auth(receiver);
    check(black_list.find(ref.value) == black_list.end() && black_list.find(receiver.value) == black_list.end(), "User is banned!");
    check(schema_name == "invfriend"_n && ref_list.find(receiver.value) == ref_list.end(),
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

ACTION satoshiclicker::upgrade(name asset_owner, uint64_t asset_id, ATTRIBUTE_MAP new_mutable_data, string amount, string memo, string hash)
{
    check(getFreezeFlag().frozen == 0, "Contract is frozen!");
    validate(asset_owner, memo, hash, amount);
    require_auth(asset_owner);
    check(black_list.find(asset_owner.value) == black_list.end(), "User is banned!");
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "setassetdata"_n, std::make_tuple(get_self(), asset_owner, asset_id, new_mutable_data))
        .send();
    updatebtc(asset_owner, amount);
}

ACTION satoshiclicker::ban(name user)
{
    require_auth(get_self());
    // check if the user already exists
    check(black_list.find(user.value) == black_list.end(), "User is already banned!");
    black_list.emplace(get_self(), [&](auto &u)
                       { u.user = user; });
}

ACTION satoshiclicker::unban(name user)
{
    require_auth(get_self());
    auto itr = black_list.find(user.value);
    check(itr != black_list.end(), "User is not banned!");
    black_list.erase(itr);
}

ACTION satoshiclicker::freeze()
{
    require_auth(_self);
    setFreezeFlag(1);
}

ACTION satoshiclicker::unfreeze()
{
    require_auth(_self);
    setFreezeFlag(0);
}

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
