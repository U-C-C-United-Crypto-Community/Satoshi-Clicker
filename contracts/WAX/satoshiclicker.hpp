#include <eosio/eosio.hpp>
#include <atomicassets-interface.hpp>
#include <eosio/crypto.hpp>
#include <eosio/transaction.hpp>

using namespace eosio;
using namespace atomicassets;

CONTRACT satoshiclicker : public contract
{
public:
	using contract::contract;

	satoshiclicker(name receiver, name code, datastream<const char *> ds) : // contract base class contructor
																			contract(receiver, code, ds),
																			// instantiate multi-index instance as data member
																			players(receiver, receiver.value),
																			_frozen(receiver, receiver.value)
	{
	}

	struct accounts
	{
		eosio::asset balance;
		uint64_t primary_key() const { return balance.symbol.code().raw(); }
	};

	typedef eosio::multi_index<"accounts"_n, accounts> accounts_table;

	accounts_table accounts = accounts_table("eosio.token"_n, get_self().value);

	struct st_frozen
	{
		uint64_t frozen;
	};

	typedef singleton<"freeze"_n, st_frozen> tb_frozen;

	tb_frozen _frozen = tb_frozen(get_self(), get_self().value);

	TABLE user_table
	{
		name user;
		string btc;
		bool banned;
		bool received;
		bool paid;
		uint64_t primary_key() const { return user.value; }
	};

	typedef multi_index<"playerlist"_n, user_table> player_list_table;

	player_list_table players = player_list_table(get_self(), get_self().value);

	ACTION ban(name user);

	ACTION unban(name user);

	ACTION upgrade(
		name asset_owner,
		uint64_t asset_id,
		ATTRIBUTE_MAP new_mutable_data,
		string amount,
		string memo,
		string hash);

	ACTION mintasset(
		name collection_name,
		name schema_name,
		int32_t template_id,
		name new_asset_owner,
		ATTRIBUTE_MAP mutable_data,
		string amount,
		string memo,
		string hash);

	ACTION mintrefasset(
		name collection_name,
		name schema_name,
		int32_t template_id,
		name ref,
		name receiver,
		ATTRIBUTE_MAP mutable_data);

	ACTION freeze();

	ACTION unfreeze();

	ACTION login(name player);

	ACTION checkplayer(name player);

	st_frozen getFreezeFlag()
	{
		st_frozen frozen_st{.frozen = 0};
		return _frozen.get_or_create(_self, frozen_st);
	}

	void setFreezeFlag(const uint64_t &pFrozen)
	{
		st_frozen frozen_st = getFreezeFlag();
		frozen_st.frozen = pFrozen;
		_frozen.set(frozen_st, _self);
	}

	void on_token_transfer(name from, name to, asset quantity, string memo);

	void updatebtc(name user, string btc);

	void validate(name owner, string memo, string hash, string btc);
};