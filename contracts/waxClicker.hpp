#include <eosio/eosio.hpp>
#include <atomicassets-interface.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>

using namespace eosio;
using namespace atomicassets;

CONTRACT waxClicker : public contract
{
public:
    using contract::contract;

    waxClicker(name receiver, name code, datastream<const char *> ds) : // contract base class contructor
                                                                        contract(receiver, code, ds),
                                                                        // instantiate multi-index instance as data member
                                                                        black_list(receiver, receiver.value),
                                                                        ref_list(receiver, receiver.value),
                                                                        users(receiver, receiver.value)
    {
    }

    TABLE user_table
    {
        name user;
        checksum256 lastTx;
        uint64_t primary_key() const { return user.value; }
    };

    typedef multi_index<"blacklist"_n, user_table> black_list_table;

    typedef multi_index<"reflist"_n, user_table> ref_list_table;

    typedef multi_index<"userlist"_n, user_table> user_list_table;

    black_list_table black_list = black_list_table(get_self(), get_self().value);

    ref_list_table ref_list = ref_list_table(get_self(), get_self().value);

    user_list_table users = user_list_table(get_self(), get_self().value);

    ACTION ban(name user);

    ACTION unban(name user);

    ACTION upgrade(
        name asset_owner,
        uint64_t asset_id,
        ATTRIBUTE_MAP new_mutable_data,
        string memo,
        string hash);

    ACTION mintasset(
        name collection_name,
        name schema_name,
        int32_t template_id,
        name new_asset_owner,
        string memo,
        string hash);

    ACTION mintrefasset(
        name collection_name,
        name schema_name,
        int32_t template_id,
        name ref,
        name receiver);

    void updateUser(name user);

    checksum256 get_trx_id()
    {
        size_t size = transaction_size();
        char buf[size];
        size_t read = read_transaction(buf, size);
        check(size == read, "read_transaction failed");
        return sha256(buf, read);
    }

    void validate(name user, string memo, string hash)
    {
        const string &value = (name{user}.to_string() + memo);
        checksum256 log = sha256(value.c_str(), value.length());
        string result;
        const char *hex_chars = "0123456789abcdef";
        const auto bytes = log.extract_as_byte_array();
        // Iterate hash and build result
        for (uint32_t i = 0; i < bytes.size(); ++i)
        {
            (result += hex_chars[(bytes.at(i) >> 4)]) += hex_chars[(bytes.at(i) & 0x0f)];
        }
        check(result == hash && hash[0] == '0' && hash[1] == '0', "Invalid memo! Produced hash: " + result + ", Passed hash: " + hash);
    }
};