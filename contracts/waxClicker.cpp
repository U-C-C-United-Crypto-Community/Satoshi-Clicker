#include <waxClicker.hpp>
#include <atomicassets.hpp>

ACTION waxClicker::mintasset(name collection_name, name schema_name,
                             int32_t template_id, name new_asset_owner)
{
    atomicassets::mintasset(get_self(), collection_name, schema_name, template_id, new_asset_owner, NULL, NULL, NULL);
}

ACTION waxClicker::setassetdata(name asset_owner, uint64_t asset_id, ATTRIBUTE_MAP new_mutable_data)
{
    atomicassets::setassetdata(get_self(), asset_owner, asset_id, new_mutable_data);
}
