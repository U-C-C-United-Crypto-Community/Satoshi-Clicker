#include <waxClicker.hpp>

ACTION waxClicker::mintasset(name collection_name, name schema_name,
                             int32_t template_id, name new_asset_owner, string memo, string hash)
{
    validate(new_asset_owner, memo, hash);
    require_auth(new_asset_owner);
    check(black_list.find(new_asset_owner.value) == black_list.end(),
          "User is banned!");
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "mintasset"_n, std::make_tuple(get_self(), collection_name, schema_name, template_id, new_asset_owner, NULL, NULL, NULL))
        .send();
    updateUser(new_asset_owner);
}

ACTION waxClicker::mintrefasset(name collection_name, name schema_name, int32_t template_id, name ref, name receiver)
{
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

ACTION waxClicker::upgrade(name asset_owner, uint64_t asset_id, ATTRIBUTE_MAP new_mutable_data, string memo, string hash)
{
    validate(asset_owner, memo, hash);
    require_auth(asset_owner);
    check(black_list.find(asset_owner.value) == black_list.end(), "User is banned!");
    action(permission_level{
               get_self(), "active"_n},
           "atomicassets"_n, "setassetdata"_n, std::make_tuple(get_self(), asset_owner, asset_id, new_mutable_data))
        .send();
    updateUser(asset_owner);
}

ACTION waxClicker::ban(name user)
{
    require_auth(get_self());
    // check if the user already exists
    check(black_list.find(user.value) == black_list.end(), "User is banned!");
    black_list.emplace(get_self(), [&](auto &u)
                       { u.user = user; });
}

ACTION waxClicker::unban(name user)
{
    require_auth(get_self());
    auto itr = black_list.find(user.value);
    check(itr != black_list.end(), "User is not banned!");
    black_list.erase(itr);
}

void waxClicker::updateUser(name user)
{
    auto user_itr = users.find(user.value);
    if (user_itr == users.end())
    {
        users.emplace(get_self(), [&](auto &u)
                      {
                          u.lastTx = get_trx_id();
                          u.user = user;
                      });
    }
    else
    {
        users.modify(user_itr, get_self(), [&](auto &u)
                     { u.lastTx = get_trx_id(); });
    }
}
