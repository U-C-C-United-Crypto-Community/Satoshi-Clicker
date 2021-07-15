#include <eosio/eosio.hpp>

using namespace eosio;

CONTRACT waxClicker : public contract
{
public:
    using contract::contract;

    ACTION setassetdata(
        name asset_owner,
        uint64_t asset_id,
        ATTRIBUTE_MAP new_mutable_data);

    ACTION mintasset(
        name collection_name,
        name schema_name,
        int32_t template_id,
        name new_asset_owner);
};