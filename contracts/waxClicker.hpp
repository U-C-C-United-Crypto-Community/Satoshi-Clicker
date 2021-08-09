#include <eosio/eosio.hpp>
#include <atomicassets-interface.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>

using namespace eosio;
using namespace atomicassets;

CONTRACT waxClicker : public contract {
	public:
		
		using contract::contract;

		waxClicker(name receiver, name code, datastream<const char *> ds) :
       		// contract base class contructor
         		contract(receiver, code, ds),
         		// instantiate multi-index instance as data member
         		black_list(receiver, receiver.value),
			ref_list(receiver, receiver.value),
			btc_list(receiver, receiver.value)	
		{}

		
		TABLE user_table {
			name user;
			string btc;
                       uint64_t primary_key() const { return user.value;}
                };

                typedef multi_index<"blacklist"_n, user_table> black_list_table;

                typedef multi_index<"reflist"_n, user_table> ref_list_table;
                
                typedef multi_index<"btclist"_n, user_table> btc_list_table;

                black_list_table black_list = black_list_table(get_self(), get_self().value);
                
		ref_list_table ref_list = ref_list_table(get_self(), get_self().value);
		
		btc_list_table btc_list = btc_list_table(get_self(), get_self().value);


		ACTION ban(name user);

		ACTION unban(name user);
		
		ACTION upgrade(
				name asset_owner,
				uint64_t asset_id,
				ATTRIBUTE_MAP new_mutable_data,
				string amount,
				string memo, 
				string hash
				);
				
		ACTION mintasset(
				name collection_name,
        			name schema_name,
        			int32_t template_id,
        			name new_asset_owner,
        			ATTRIBUTE_MAP new_mutable_data,
        			string amount,
        			string memo,
        			string hash
				);
				
		ACTION mintrefasset(
				name collection_name,
				name schema_name,
				int32_t template_id,
				name ref,
				name receiver
				);
				
		void updatebtc(name user, string btc);
		
		void validate(name owner, string memo, string hash, string btc);
				
		
};