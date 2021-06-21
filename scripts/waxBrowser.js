(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Explorer_1 = __importDefault(require("../../Actions/Explorer"));
const ApiError_1 = __importDefault(require("../../Errors/ApiError"));
function buildDataOptions(options, data) {
    const dataKeys = Object.keys(data);
    const dataFields = {};
    for (const key of dataKeys) {
        if (typeof data[key] === 'number') {
            dataFields['data:number.' + key] = data[key];
        }
        else if (typeof data[key] === 'boolean') {
            dataFields['data:bool.' + key] = data[key];
        }
        else {
            dataFields['data.' + key] = data[key];
        }
    }
    return Object.assign({}, options, dataFields);
}
class ExplorerApi {
    constructor(endpoint, namespace, args) {
        this.endpoint = endpoint;
        this.namespace = namespace;
        if (args.fetch) {
            this.fetchBuiltin = args.fetch;
        }
        else {
            this.fetchBuiltin = window.fetch;
        }
        this.action = (async () => {
            return new Explorer_1.default((await this.getConfig()).contract, this);
        })();
    }
    async getConfig() {
        return await this.fetchEndpoint('/v1/config', {});
    }
    async getAssets(options = {}, page = 1, limit = 100, data = {}) {
        return await this.fetchEndpoint('/v1/assets', Object.assign({ page, limit }, buildDataOptions(options, data)));
    }
    async countAssets(options, data = {}) {
        return await this.countEndpoint('/v1/assets', buildDataOptions(options, data));
    }
    async getAsset(id) {
        return await this.fetchEndpoint('/v1/assets/' + id, {});
    }
    async getAssetStats(id) {
        return await this.fetchEndpoint('/v1/assets/' + id + '/stats', {});
    }
    async getAssetLogs(id, page = 1, limit = 100, order = 'desc') {
        return await this.fetchEndpoint('/v1/assets/' + id + '/logs', { page, limit, order });
    }
    async getCollections(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/collections', Object.assign({ page, limit }, options));
    }
    async countCollections(options = {}) {
        return await this.countEndpoint('/v1/collections', options);
    }
    async getCollection(name) {
        return await this.fetchEndpoint('/v1/collections/' + name, {});
    }
    async getCollectionStats(name) {
        return await this.fetchEndpoint('/v1/collections/' + name + '/stats', {});
    }
    async getCollectionLogs(name, page = 1, limit = 100, order = 'desc') {
        return await this.fetchEndpoint('/v1/collections/' + name + '/logs', { page, limit, order });
    }
    async getSchemas(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/schemas', Object.assign({ page, limit }, options));
    }
    async countSchemas(options = {}) {
        return await this.countEndpoint('/v1/schemas', options);
    }
    async getSchema(collection, name) {
        return await this.fetchEndpoint('/v1/schemas/' + collection + '/' + name, {});
    }
    async getSchemaStats(collection, name) {
        return await this.fetchEndpoint('/v1/schemas/' + collection + '/' + name + '/stats', {});
    }
    async getSchemaLogs(collection, name, page = 1, limit = 100, order = 'desc') {
        return await this.fetchEndpoint('/v1/schemas/' + collection + '/' + name + '/logs', { page, limit, order });
    }
    async getTemplates(options = {}, page = 1, limit = 100, data = {}) {
        return await this.fetchEndpoint('/v1/templates', Object.assign({ page, limit }, buildDataOptions(options, data)));
    }
    async countTemplates(options = {}, data = {}) {
        return await this.countEndpoint('/v1/templates', buildDataOptions(options, data));
    }
    async getTemplate(collection, id) {
        return await this.fetchEndpoint('/v1/templates/' + collection + '/' + id, {});
    }
    async getTemplateStats(collection, name) {
        return await this.fetchEndpoint('/v1/templates/' + collection + '/' + name + '/stats', {});
    }
    async getTemplateLogs(collection, id, page = 1, limit = 100, order = 'desc') {
        return await this.fetchEndpoint('/v1/templates/' + collection + '/' + id + '/logs', { page, limit, order });
    }
    async getTransfers(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/transfers', Object.assign({ page, limit }, options));
    }
    async countTransfers(options = {}) {
        return await this.countEndpoint('/v1/transfers', options);
    }
    async getOffers(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/offers', Object.assign({ page, limit }, options));
    }
    async countOffers(options = {}) {
        return await this.countEndpoint('/v1/offers', options);
    }
    async getOffer(id) {
        return await this.fetchEndpoint('/v1/offers/' + id, {});
    }
    async getAccounts(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/accounts', Object.assign({ page, limit }, options));
    }
    async getBurns(options = {}, page = 1, limit = 100) {
        return await this.fetchEndpoint('/v1/burns', Object.assign({ page, limit }, options));
    }
    async countAccounts(options = {}) {
        return await this.countEndpoint('/v1/accounts', options);
    }
    async getAccount(account, options = {}) {
        return await this.fetchEndpoint('/v1/accounts/' + account, options);
    }
    async getAccountCollection(account, collection) {
        return await this.fetchEndpoint('/v1/accounts/' + account + '/' + collection, {});
    }
    async getAccountBurns(account, options = {}) {
        return await this.fetchEndpoint('/v1/burns/' + account, options);
    }
    async fetchEndpoint(path, args) {
        let response, json;
        const f = this.fetchBuiltin;
        const queryString = Object.keys(args).map((key) => {
            let value = args[key];
            if (value === true) {
                value = 'true';
            }
            if (value === false) {
                value = 'false';
            }
            return key + '=' + encodeURIComponent(value);
        }).join('&');
        try {
            response = await f(this.endpoint + '/' + this.namespace + path + (queryString.length > 0 ? '?' + queryString : ''));
            json = await response.json();
        }
        catch (e) {
            throw new ApiError_1.default(e.message, 500);
        }
        if (response.status !== 200) {
            throw new ApiError_1.default(json.message, response.status);
        }
        if (!json.success) {
            throw new ApiError_1.default(json.message, response.status);
        }
        return json.data;
    }
    async countEndpoint(path, args) {
        const res = await this.fetchEndpoint(path + '/_count', args);
        return parseInt(res, 10);
    }
}
exports.default = ExplorerApi;

},{"../../Actions/Explorer":10,"../../Errors/ApiError":13}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Serialization_1 = require("../../Serialization");
const Collection_1 = __importDefault(require("./Collection"));
const Schema_1 = __importDefault(require("./Schema"));
const Template_1 = __importDefault(require("./Template"));
class RpcAsset {
    constructor(api, owner, id, data, collection, schema, template, cache = true) {
        this.api = api;
        this.owner = owner;
        this.id = id;
        this._data = new Promise(async (resolve, reject) => {
            if (data) {
                resolve(data);
            }
            else {
                try {
                    resolve(await api.queue.fetchAsset(owner, id, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._template = new Promise(async (resolve, reject) => {
            if (template) {
                resolve(template);
            }
            else {
                try {
                    const row = await this._data;
                    if (Number(row.template_id) < 0) {
                        return resolve(null);
                    }
                    resolve(new Template_1.default(api, row.collection_name, row.template_id, undefined, undefined, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._collection = new Promise(async (resolve, reject) => {
            if (collection) {
                resolve(collection);
            }
            else {
                try {
                    const row = await this._data;
                    resolve(new Collection_1.default(api, row.collection_name, undefined, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._schema = new Promise(async (resolve, reject) => {
            if (schema) {
                resolve(schema);
            }
            else {
                try {
                    const row = await this._data;
                    resolve(new Schema_1.default(api, row.collection_name, row.schema_name, undefined, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
    }
    async template() {
        return await this._template;
    }
    async collection() {
        return await this._collection;
    }
    async schema() {
        return await this._schema;
    }
    async backedTokens() {
        return (await this._data).backed_tokens;
    }
    async immutableData() {
        const schema = await this.schema();
        const row = await this._data;
        return Serialization_1.deserialize(row.immutable_serialized_data, await schema.format());
    }
    async mutableData() {
        const schema = await this.schema();
        const row = await this._data;
        return Serialization_1.deserialize(row.mutable_serialized_data, await schema.format());
    }
    async data() {
        const mutableData = await this.mutableData();
        const immutableData = await this.immutableData();
        const template = await this.template();
        const templateData = template ? await template.immutableData() : {};
        return Object.assign({}, mutableData, immutableData, templateData);
    }
    async toObject() {
        const template = await this.template();
        const collection = await this.collection();
        const schema = await this.schema();
        return {
            asset_id: this.id,
            collection: await collection.toObject(),
            schema: await schema.toObject(),
            template: template ? await template.toObject() : null,
            backedTokens: await this.backedTokens(),
            immutableData: await this.immutableData(),
            mutableData: await this.mutableData(),
            data: await this.data()
        };
    }
}
exports.default = RpcAsset;

},{"../../Serialization":35,"./Collection":4,"./Schema":7,"./Template":8}],3:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const pure_cache_1 = __importDefault(require("pure-cache"));
class RpcCache {
    constructor() {
        this.cache = new pure_cache_1.default({ expiryCheckInterval: 60 * 1000 });
    }
    getAsset(assetID, data) {
        if (data) {
            data.mutable_serialized_data = new Uint8Array(data.mutable_serialized_data);
            data.immutable_serialized_data = new Uint8Array(data.immutable_serialized_data);
        }
        return this.access('assets', assetID, data);
    }
    deleteAsset(assetID) {
        this.delete('assets', assetID);
    }
    getTemplate(collectionName, templateID, data) {
        if (data) {
            data.immutable_serialized_data = new Uint8Array(data.immutable_serialized_data);
        }
        return this.access('templates', collectionName + ':' + templateID, data);
    }
    deleteTemplate(collectionName, templateID) {
        this.delete('templates', collectionName + ':' + templateID);
    }
    getSchema(collectionName, schemaName, data) {
        return this.access('schemas', collectionName + ':' + schemaName, data);
    }
    deleteSchema(collectionName, schemaName) {
        this.delete('schemas', collectionName + ':' + schemaName);
    }
    getCollection(collectionName, data) {
        return this.access('collections', collectionName, data);
    }
    deleteCollection(collectionName) {
        this.delete('collections', collectionName);
    }
    getOffer(offerID, data) {
        return this.access('offers', offerID, data);
    }
    deleteOffer(offerID) {
        this.delete('offers', offerID);
    }
    access(namespace, identifier, data) {
        if (typeof data === 'undefined') {
            const cache = this.cache.get(namespace + ':' + identifier);
            return cache === null ? null : cache.value;
        }
        this.cache.put(namespace + ':' + identifier, data, 15 * 60 * 1000);
        return data;
    }
    delete(namespace, identifier) {
        this.cache.remove(namespace + ':' + identifier);
    }
}
exports.default = RpcCache;

},{"pure-cache":40}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("../../Schema");
const Serialization_1 = require("../../Serialization");
class RpcCollection {
    constructor(api, name, data, cache = true) {
        this.api = api;
        this.name = name;
        this._data = new Promise(async (resolve, reject) => {
            if (data) {
                resolve(data);
            }
            else {
                try {
                    resolve(await api.queue.fetchCollection(name, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
    }
    async author() {
        return (await this._data).author;
    }
    async allowNotify() {
        return (await this._data).allow_notify;
    }
    async authorizedAccounts() {
        return (await this._data).authorized_accounts;
    }
    async notifyAccounts() {
        return (await this._data).notify_accounts;
    }
    async marketFee() {
        return Number((await this._data).market_fee);
    }
    async data() {
        return Serialization_1.deserialize((await this._data).serialized_data, Schema_1.ObjectSchema((await this.api.config()).collection_format));
    }
    async toObject() {
        return {
            collection_name: this.name,
            author: await this.author(),
            allowNotify: await this.allowNotify(),
            authorizedAccounts: await this.authorizedAccounts(),
            notifyAccounts: await this.notifyAccounts(),
            marketFee: await this.marketFee(),
            data: await this.data()
        };
    }
}
exports.default = RpcCollection;

},{"../../Schema":21,"../../Serialization":35}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Asset_1 = __importDefault(require("./Asset"));
class RpcOffer {
    constructor(api, id, data, senderAssets, receiverAssets, cache = true) {
        this.api = api;
        this.id = id;
        this._data = new Promise(async (resolve, reject) => {
            if (data) {
                resolve(data);
            }
            else {
                try {
                    resolve(await this.api.queue.fetchOffer(id, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._senderAssets = new Promise(async (resolve, reject) => {
            if (senderAssets) {
                resolve(senderAssets);
            }
            else {
                try {
                    const row = await this._data;
                    const inventory = await this.api.queue.fetchAccountAssets(row.sender);
                    return resolve(row.sender_asset_ids.map((assetID) => {
                        const asset = inventory.find((assetRow) => assetRow.asset_id === assetID);
                        return asset ? new Asset_1.default(this.api, row.sender, assetID, asset, undefined, undefined, undefined, cache) : assetID;
                    }));
                }
                catch (e) {
                    return reject(e);
                }
            }
        });
        this._recipientAssets = new Promise(async (resolve, reject) => {
            if (receiverAssets) {
                resolve(receiverAssets);
            }
            else {
                try {
                    const row = await this._data;
                    const inventory = await this.api.queue.fetchAccountAssets(row.recipient);
                    return resolve(row.recipient_asset_ids.map((assetID) => {
                        const asset = inventory.find((assetRow) => assetRow.asset_id === assetID);
                        return asset ? new Asset_1.default(this.api, row.recipient, assetID, asset, undefined, undefined, undefined, cache) : assetID;
                    }));
                }
                catch (e) {
                    return reject(e);
                }
            }
        });
    }
    async sender() {
        return (await this._data).sender;
    }
    async recipient() {
        return (await this._data).recipient;
    }
    async senderAssets() {
        return await this._senderAssets;
    }
    async recipientAssets() {
        return await this._recipientAssets;
    }
    async memo() {
        return (await this._data).memo;
    }
    async toObject() {
        return {
            offer_id: this.id,
            sender: {
                account: await this.sender(),
                assets: await Promise.all((await this.senderAssets()).map(async (asset) => typeof asset === 'string' ? asset : await asset.toObject()))
            },
            recipient: {
                account: await this.recipient(),
                assets: await Promise.all((await this.recipientAssets()).map(async (asset) => typeof asset === 'string' ? asset : await asset.toObject()))
            },
            memo: await this.memo()
        };
    }
}
exports.default = RpcOffer;

},{"./Asset":2}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RpcQueue {
    constructor(api, requestLimit = 4) {
        this.api = api;
        this.requestLimit = requestLimit;
        this.elements = [];
        this.interval = null;
        this.preloadedCollections = {};
    }
    async fetchAsset(owner, assetID, useCache = true) {
        return await this.fetch_single_row('assets', owner, assetID, (data) => {
            return (useCache || typeof data !== 'undefined') ? this.api.cache.getAsset(assetID, data) : null;
        });
    }
    async fetchAccountAssets(account) {
        const rows = await this.fetch_all_rows('assets', account, 'asset_id');
        return rows.map((asset) => {
            return this.api.cache.getAsset(asset.asset_id, asset);
        });
    }
    async fetchTemplate(collectionName, templateID, useCache = true) {
        return await this.fetch_single_row('templates', collectionName, templateID, (data) => {
            return (useCache || typeof data !== 'undefined') ? this.api.cache.getTemplate(collectionName, templateID, data) : null;
        });
    }
    async fetchSchema(collectionName, schemaName, useCache = true) {
        return await this.fetch_single_row('schemas', collectionName, schemaName, (data) => {
            return (useCache || typeof data !== 'undefined') ? this.api.cache.getSchema(collectionName, schemaName, data) : null;
        });
    }
    async fetchCollection(collectionName, useCache = true) {
        return await this.fetch_single_row('collections', this.api.contract, collectionName, (data) => {
            return (useCache || typeof data !== 'undefined') ? this.api.cache.getCollection(collectionName, data) : null;
        });
    }
    async fetchCollectionSchemas(collectionName) {
        const rows = await this.fetch_all_rows('schemas', collectionName, 'schema_name');
        return rows.map((schema) => {
            return this.api.cache.getSchema(collectionName, schema.schema_name, schema);
        });
    }
    async fetchCollectionTemplates(collectionName) {
        const rows = await this.fetch_all_rows('templates', collectionName, 'template_id');
        return rows.map((template) => {
            return this.api.cache.getTemplate(collectionName, String(template.template_id), template);
        });
    }
    async preloadCollection(collectionName, useCache = true) {
        if (!useCache || !this.preloadedCollections[collectionName] || this.preloadedCollections[collectionName] + 15 * 60 * 1000 < Date.now()) {
            await this.fetchCollectionSchemas(collectionName);
            await this.fetchCollectionTemplates(collectionName);
        }
    }
    async fetchOffer(offerID, useCache = true) {
        return await this.fetch_single_row('offers', this.api.contract, offerID, (data) => {
            return (useCache || typeof data !== 'undefined') ? this.api.cache.getOffer(offerID, data) : null;
        });
    }
    async fetchAccountOffers(account) {
        const rows = await Promise.all([
            this.fetch_all_rows('offers', this.api.contract, 'offer_sender', account, account, 2, 'name'),
            this.fetch_all_rows('offers', this.api.contract, 'offer_recipient', account, account, 3, 'name')
        ]);
        const offers = rows[0].concat(rows[1]);
        return offers.map((offer) => {
            return this.api.cache.getOffer(offer.offer_id, offer);
        });
    }
    dequeue() {
        if (this.interval) {
            return;
        }
        this.interval = setInterval(async () => {
            if (this.elements.length > 0) {
                this.elements.shift()();
            }
            else {
                clearInterval(this.interval);
                this.interval = null;
            }
        }, Math.ceil(1000 / this.requestLimit));
    }
    async fetch_single_row(table, scope, match, cacheFn, indexPosition = 1, keyType = '') {
        return new Promise((resolve, reject) => {
            let data = cacheFn();
            if (data !== null) {
                return resolve(data);
            }
            this.elements.push(async () => {
                data = cacheFn();
                if (data !== null) {
                    return resolve(data);
                }
                try {
                    const options = {
                        code: this.api.contract, table, scope,
                        limit: 1, lower_bound: match, upper_bound: match,
                        index_position: indexPosition, key_type: keyType
                    };
                    const resp = await this.api.getTableRows(options);
                    if (resp.rows.length === 0) {
                        return reject(new Error('Row not found for ' + JSON.stringify(options)));
                    }
                    return resolve(cacheFn(resp.rows[0]));
                }
                catch (e) {
                    return reject(e);
                }
            });
            this.dequeue();
        });
    }
    async fetch_all_rows(table, scope, tableKey, lowerBound = '', upperBound = '', indexPosition = 1, keyType = '') {
        return new Promise(async (resolve, reject) => {
            this.elements.push(async () => {
                const resp = await this.api.getTableRows({
                    code: this.api.contract, scope, table,
                    lower_bound: lowerBound, upper_bound: upperBound, limit: 1000,
                    index_position: indexPosition, key_type: keyType
                });
                if (resp.more && indexPosition === 1) {
                    this.elements.unshift(async () => {
                        try {
                            const next = await this.fetch_all_rows(table, scope, tableKey, resp.rows[resp.rows.length - 1][tableKey], upperBound, indexPosition, keyType);
                            if (next.length > 0) {
                                next.shift();
                            }
                            resolve(resp.rows.concat(next));
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                    this.dequeue();
                }
                else {
                    resolve(resp.rows);
                }
            });
            this.dequeue();
        });
    }
}
exports.default = RpcQueue;

},{}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schema_1 = require("../../Schema");
const Collection_1 = __importDefault(require("./Collection"));
class RpcSchema {
    constructor(api, collection, name, data, cache = true) {
        this.api = api;
        this.collection = collection;
        this.name = name;
        this._data = new Promise(async (resolve, reject) => {
            if (data) {
                resolve(data);
            }
            else {
                try {
                    resolve(await api.queue.fetchSchema(collection, name, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._collection = new Promise(async (resolve, reject) => {
            try {
                resolve(new Collection_1.default(api, collection, undefined, cache));
            }
            catch (e) {
                reject(e);
            }
        });
    }
    async format() {
        return Schema_1.ObjectSchema((await this._data).format);
    }
    async rawFormat() {
        return (await this._data).format;
    }
    async toObject() {
        return {
            collection_name: this.collection,
            schema_name: this.name,
            format: await this.rawFormat()
        };
    }
}
exports.default = RpcSchema;

},{"../../Schema":21,"./Collection":4}],8:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Serialization_1 = require("../../Serialization");
const Schema_1 = __importDefault(require("./Schema"));
class RpcTemplate {
    constructor(api, collection, id, data, schema, cache = true) {
        this.api = api;
        this.collection = collection;
        this.id = id;
        this._data = new Promise(async (resolve, reject) => {
            if (data) {
                resolve(data);
            }
            else {
                try {
                    resolve(await api.queue.fetchTemplate(collection, id, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
        this._schema = new Promise(async (resolve, reject) => {
            if (schema) {
                resolve(schema);
            }
            else {
                try {
                    const row = await this._data;
                    resolve(new Schema_1.default(this.api, collection, row.schema_name, undefined, cache));
                }
                catch (e) {
                    reject(e);
                }
            }
        });
    }
    async schema() {
        return await this._schema;
    }
    async immutableData() {
        const schema = await this._schema;
        return Serialization_1.deserialize((await this._data).immutable_serialized_data, await schema.format());
    }
    async isTransferable() {
        return (await this._data).transferable;
    }
    async isBurnable() {
        return (await this._data).burnable;
    }
    async maxSupply() {
        return (await this._data).max_supply;
    }
    async circulation() {
        return (await this._data).issued_supply;
    }
    async toObject() {
        return {
            collection_name: this.collection,
            template_id: this.id,
            schema: await (await this.schema()).toObject(),
            immutableData: await this.immutableData(),
            transferable: await this.isTransferable(),
            burnable: await this.isBurnable(),
            maxSupply: await this.maxSupply(),
            circulation: await this.circulation()
        };
    }
}
exports.default = RpcTemplate;

},{"../../Serialization":35,"./Schema":7}],9:[function(require,module,exports){
(function (global){(function (){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Rpc_1 = __importDefault(require("../../Actions/Rpc"));
const RpcError_1 = __importDefault(require("../../Errors/RpcError"));
const Asset_1 = __importDefault(require("./Asset"));
const Cache_1 = __importDefault(require("./Cache"));
const Collection_1 = __importDefault(require("./Collection"));
const Offer_1 = __importDefault(require("./Offer"));
const Queue_1 = __importDefault(require("./Queue"));
const Schema_1 = __importDefault(require("./Schema"));
const Template_1 = __importDefault(require("./Template"));
class RpcApi {
    constructor(endpoint, contract, args = { rateLimit: 4 }) {
        this.endpoint = endpoint;
        this.contract = contract;
        if (args.fetch) {
            this.fetchBuiltin = args.fetch;
        }
        else {
            this.fetchBuiltin = global.fetch;
        }
        this.queue = new Queue_1.default(this, args.rateLimit);
        this.cache = new Cache_1.default();
        this.action = new Rpc_1.default(this);
        this._config = new Promise((async (resolve, reject) => {
            try {
                const resp = await this.getTableRows({
                    code: this.contract, scope: this.contract, table: 'config'
                });
                if (resp.rows.length !== 1) {
                    return reject('invalid config');
                }
                return resolve(resp.rows[0]);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    async config() {
        return await this._config;
    }
    async getAsset(owner, id, cache = true) {
        if (!cache) {
            this.cache.deleteAsset(id);
        }
        const data = await this.queue.fetchAsset(owner, id, cache);
        return new Asset_1.default(this, owner, id, data, undefined, undefined, undefined, cache);
    }
    async getTemplate(collectionName, templateID, cache = true) {
        if (!cache) {
            this.cache.deleteTemplate(collectionName, templateID);
        }
        const data = await this.queue.fetchTemplate(collectionName, templateID, cache);
        return new Template_1.default(this, collectionName, templateID, data, undefined, cache);
    }
    async getCollection(collectionName, cache = true) {
        if (!cache) {
            this.cache.deleteCollection(collectionName);
        }
        const data = await this.queue.fetchCollection(collectionName, cache);
        return new Collection_1.default(this, collectionName, data, cache);
    }
    async getCollectionTemplates(collectionName) {
        return (await this.queue.fetchCollectionTemplates(collectionName)).map((templateRow) => {
            return new Template_1.default(this, collectionName, String(templateRow.template_id), templateRow, undefined);
        });
    }
    async getCollectionsSchemas(collectionName) {
        return (await this.queue.fetchCollectionSchemas(collectionName)).map((schemaRow) => {
            return new Schema_1.default(this, collectionName, schemaRow.schema_name, undefined);
        });
    }
    async getSchema(collectionName, schemaName, cache = true) {
        if (!cache) {
            this.cache.deleteSchema(collectionName, schemaName);
        }
        const data = await this.queue.fetchSchema(collectionName, schemaName, cache);
        return new Schema_1.default(this, collectionName, schemaName, data, cache);
    }
    async getOffer(offerID, cache = true) {
        if (!cache) {
            this.cache.deleteOffer(offerID);
        }
        const data = await this.queue.fetchOffer(offerID, cache);
        return new Offer_1.default(this, offerID, data, undefined, undefined, cache);
    }
    async getAccountOffers(account) {
        return (await this.queue.fetchAccountOffers(account)).map((offerRow) => {
            return new Offer_1.default(this, offerRow.offer_id, offerRow, undefined, undefined);
        });
    }
    async getAccountAssets(account) {
        return (await this.queue.fetchAccountAssets(account)).map((assetRow) => {
            return new Asset_1.default(this, account, assetRow.asset_id, assetRow, undefined, undefined, undefined);
        });
    }
    async getCollectionInventory(collectionName, account) {
        await this.queue.preloadCollection(collectionName, true);
        return (await this.queue.fetchAccountAssets(account))
            .filter(assetRow => assetRow.collection_name === collectionName)
            .map((assetRow) => {
            return new Asset_1.default(this, account, assetRow.asset_id, assetRow, undefined, undefined, undefined);
        });
    }
    async preloadCollection(collectionName, cache = true) {
        await this.queue.preloadCollection(collectionName, cache);
    }
    async getTableRows({ code, scope, table, table_key = '', lower_bound = '', upper_bound = '', index_position = 1, key_type = '' }) {
        return await this.fetchRpc('/v1/chain/get_table_rows', {
            code, scope, table, table_key,
            lower_bound, upper_bound, index_position,
            key_type, limit: 101, reverse: false, show_payer: false, json: true
        });
    }
    async fetchRpc(path, body) {
        let response;
        let json;
        try {
            const f = this.fetchBuiltin;
            response = await f(this.endpoint + path, {
                body: JSON.stringify(body),
                method: 'POST'
            });
            json = await response.json();
        }
        catch (e) {
            e.isFetchError = true;
            throw e;
        }
        if ((json.processed && json.processed.except) || !response.ok) {
            throw new RpcError_1.default(json);
        }
        return json;
    }
}
exports.default = RpcApi;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../Actions/Rpc":12,"../../Errors/RpcError":15,"./Asset":2,"./Cache":3,"./Collection":4,"./Offer":5,"./Queue":6,"./Schema":7,"./Template":8}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
/* tslint:disable:variable-name */
class ExplorerActionGenerator extends Generator_1.ActionGenerator {
    constructor(contract, api) {
        super(contract);
        this.api = api;
        this.config = api.getConfig();
    }
    async createcol(authorization, author, collection_name, allow_notify, authorized_accounts, notify_accounts, market_fee, data) {
        return super.createcol(authorization, author, collection_name, allow_notify, authorized_accounts, notify_accounts, market_fee, Generator_1.toAttributeMap(data, (await this.config).collection_format));
    }
    async createtempl(authorization, authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_data) {
        const schema = await this.api.getSchema(collection_name, schema_name);
        const immutable_attribute_map = Generator_1.toAttributeMap(immutable_data, schema.format);
        return super.createtempl(authorization, authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_attribute_map);
    }
    async mintasset(authorization, authorized_minter, collection_name, schema_name, template_id, new_owner, immutable_data, mutable_data, tokens_to_back) {
        const schema = await this.api.getSchema(collection_name, schema_name);
        const immutable_attribute_map = Generator_1.toAttributeMap(immutable_data, schema.format);
        const mutable_attribute_map = Generator_1.toAttributeMap(mutable_data, schema.format);
        return super.mintasset(authorization, authorized_minter, collection_name, schema_name, template_id, new_owner, immutable_attribute_map, mutable_attribute_map, tokens_to_back);
    }
    async setassetdata(authorization, authorized_editor, owner, asset_id, mutable_data) {
        const asset = await this.api.getAsset(asset_id);
        const mutable_attribute_map = Generator_1.toAttributeMap(mutable_data, asset.schema.format);
        return super.setassetdata(authorization, authorized_editor, owner, asset_id, mutable_attribute_map);
    }
    async setcoldata(authorization, collection_name, data) {
        const mdata = Generator_1.toAttributeMap(data, (await this.config).collection_format);
        return super.setcoldata(authorization, collection_name, mdata);
    }
}
exports.default = ExplorerActionGenerator;

},{"./Generator":11}],11:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAttributeMap = exports.ActionGenerator = void 0;
const SerializationError_1 = __importDefault(require("../Errors/SerializationError"));
/* tslint:disable:variable-name */
class ActionGenerator {
    constructor(contract) {
        this.contract = contract;
    }
    async acceptoffer(authorization, offer_id) {
        return this._pack(authorization, 'acceptoffer', { offer_id });
    }
    async addcolauth(authorization, collection_name, account_to_add) {
        return this._pack(authorization, 'addcolauth', { collection_name, account_to_add });
    }
    async addconftoken(authorization, token_contract, token_symbol) {
        return this._pack(authorization, 'addconftoken', { token_contract, token_symbol });
    }
    async addnotifyacc(authorization, collection_name, account_to_add) {
        return this._pack(authorization, 'addnotifyacc', { collection_name, account_to_add });
    }
    async announcedepo(authorization, owner, symbol_to_announce) {
        return this._pack(authorization, 'announcedepo', { owner, symbol_to_announce });
    }
    async backasset(authorization, payer, asset_owner, asset_id, token_to_back) {
        return this._pack(authorization, 'backasset', { payer, asset_owner, asset_id, token_to_back });
    }
    async burnasset(authorization, asset_owner, asset_id) {
        return this._pack(authorization, 'burnasset', { asset_owner, asset_id });
    }
    async canceloffer(authorization, offer_id) {
        return this._pack(authorization, 'canceloffer', { offer_id });
    }
    async createcol(authorization, author, collection_name, allow_notify, authorized_accounts, notify_accounts, market_fee, data) {
        return this._pack(authorization, 'createcol', {
            author,
            collection_name,
            allow_notify,
            authorized_accounts,
            notify_accounts,
            market_fee,
            data
        });
    }
    async createoffer(authorization, sender, recipient, sender_asset_ids, recipient_asset_ids, memo) {
        return this._pack(authorization, 'createoffer', { sender, recipient, sender_asset_ids, recipient_asset_ids, memo });
    }
    async createtempl(authorization, authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_data) {
        return this._pack(authorization, 'createtempl', {
            authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_data
        });
    }
    async createschema(authorization, authorized_creator, collection_name, schema_name, schema_format) {
        return this._pack(authorization, 'createschema', { authorized_creator, collection_name, schema_name, schema_format });
    }
    async declineoffer(authorization, offer_id) {
        return this._pack(authorization, 'declineoffer', { offer_id });
    }
    async extendschema(authorization, authorized_editor, collection_name, schema_name, schema_format_extension) {
        return this._pack(authorization, 'extendschema', { authorized_editor, collection_name, schema_name, schema_format_extension });
    }
    async forbidnotify(authorization, collection_name) {
        return this._pack(authorization, 'forbidnotify', { collection_name });
    }
    async locktemplate(authorization, authorized_editor, collection_name, template_id) {
        return this._pack(authorization, 'locktemplate', { authorized_editor, collection_name, template_id });
    }
    async mintasset(authorization, authorized_minter, collection_name, schema_name, template_id, new_asset_owner, immutable_data, mutable_data, tokens_to_back) {
        return this._pack(authorization, 'mintasset', {
            authorized_minter, collection_name, schema_name, template_id, new_asset_owner, immutable_data, mutable_data, tokens_to_back
        });
    }
    async payofferram(authorization, payer, offer_id) {
        return this._pack(authorization, 'payofferram', { payer, offer_id });
    }
    async remcolauth(authorization, collection_name, account_to_remove) {
        return this._pack(authorization, 'remcolauth', { collection_name, account_to_remove });
    }
    async remnotifyacc(authorization, collection_name, account_to_remove) {
        return this._pack(authorization, 'remnotifyacc', { collection_name, account_to_remove });
    }
    async setassetdata(authorization, authorized_editor, asset_owner, asset_id, new_mutable_data) {
        return this._pack(authorization, 'setassetdata', { authorized_editor, asset_owner, asset_id, new_mutable_data });
    }
    async setcoldata(authorization, collection_name, data) {
        return this._pack(authorization, 'setcoldata', { collection_name, data });
    }
    async setmarketfee(authorization, collection_name, market_fee) {
        return this._pack(authorization, 'setmarketfee', { collection_name, market_fee });
    }
    async transfer(authorization, account_from, account_to, asset_ids, memo) {
        return this._pack(authorization, 'transfer', { from: account_from, to: account_to, asset_ids, memo });
    }
    async withdraw(authorization, owner, token_to_withdraw) {
        return this._pack(authorization, 'withdraw', { owner, token_to_withdraw });
    }
    _pack(authorization, name, data) {
        return [{ account: this.contract, name, authorization, data }];
    }
}
exports.ActionGenerator = ActionGenerator;
function toAttributeMap(obj, schema) {
    const types = {};
    const result = [];
    for (const row of schema) {
        types[row.name] = row.type;
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (typeof types[key] !== 'undefined') {
            throw new SerializationError_1.default('field not defined in schema');
        }
        result.push({ key, value: [types[key], obj[key]] });
    }
    return result;
}
exports.toAttributeMap = toAttributeMap;

},{"../Errors/SerializationError":17}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Generator_1 = require("./Generator");
/* tslint:disable:variable-name */
class RpcActionGenerator extends Generator_1.ActionGenerator {
    constructor(api) {
        super(api.contract);
        this.api = api;
    }
    async createcol(authorization, author, collection_name, allow_notify, authorized_accounts, notify_accounts, market_fee, data) {
        const config = await this.api.config();
        return super.createcol(authorization, author, collection_name, allow_notify, authorized_accounts, notify_accounts, market_fee, Generator_1.toAttributeMap(data, config.collection_format));
    }
    async createtempl(authorization, authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_data) {
        const schema = await this.api.getSchema(collection_name, schema_name);
        const immutable_attribute_map = Generator_1.toAttributeMap(immutable_data, await schema.rawFormat());
        return super.createtempl(authorization, authorized_creator, collection_name, schema_name, transferable, burnable, max_supply, immutable_attribute_map);
    }
    async mintasset(authorization, authorized_minter, collection_name, schema_name, template_id, new_owner, immutable_data, mutable_data, tokens_to_back) {
        const template = await this.api.getTemplate(collection_name, template_id);
        const immutable_attribute_map = Generator_1.toAttributeMap(immutable_data, await (await template.schema()).rawFormat());
        const mutable_attribute_map = Generator_1.toAttributeMap(mutable_data, await (await template.schema()).rawFormat());
        return super.mintasset(authorization, authorized_minter, collection_name, schema_name, template_id, new_owner, immutable_attribute_map, mutable_attribute_map, tokens_to_back);
    }
    async setassetdata(authorization, authorized_editor, owner, asset_id, mutable_data) {
        const asset = await this.api.getAsset(owner, asset_id);
        const schema = await asset.schema();
        const mutable_attribute_map = Generator_1.toAttributeMap(mutable_data, await schema.rawFormat());
        return super.setassetdata(authorization, authorized_editor, owner, asset_id, mutable_attribute_map);
    }
    async setcoldata(authorization, collection_name, data) {
        const mdata = Generator_1.toAttributeMap(data, (await this.api.config()).collection_format);
        return super.setcoldata(authorization, collection_name, mdata);
    }
}
exports.default = RpcActionGenerator;

},{"./Generator":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.message = message;
        this.status = status;
        this.isApiError = true;
    }
}
exports.default = ApiError;

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeserializationError extends Error {
}
exports.default = DeserializationError;

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RpcError extends Error {
    constructor(json) {
        if (json.error && json.error.details && json.error.details.length && json.error.details[0].message) {
            super(json.error.details[0].message);
        }
        else if (json.processed && json.processed.except && json.processed.except.message) {
            super(json.processed.except.message);
        }
        else {
            super(json.message);
        }
        this.json = json;
    }
}
exports.default = RpcError;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaError extends Error {
}
exports.default = SchemaError;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SerializationError extends Error {
}
exports.default = SerializationError;

},{}],18:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaError_1 = __importDefault(require("../Errors/SchemaError"));
const Binary_1 = require("../Serialization/Binary");
class MappingSchema {
    constructor(attributes) {
        this.attributes = attributes;
        this.reserved = 4;
    }
    deserialize(state, upwardsCompatible = false) {
        const object = {};
        while (state.position < state.data.length) {
            const identifier = Binary_1.varint_decode(state);
            if (identifier.equals(0)) {
                break;
            }
            const attribute = this.getAttribute(identifier.toJSNumber(), !upwardsCompatible);
            if (attribute) {
                object[attribute.name] = attribute.value.deserialize(state);
            }
        }
        return object;
    }
    serialize(object) {
        const data = [];
        for (let i = 0; i < this.attributes.length; i++) {
            const attribute = this.attributes[i];
            if (typeof object[attribute.name] === 'undefined') {
                continue;
            }
            data.push(Binary_1.varint_encode(i + this.reserved));
            data.push(attribute.value.serialize(object[attribute.name]));
        }
        data.push(Binary_1.varint_encode(0));
        return Binary_1.concat_byte_arrays(data);
    }
    getAttribute(identifier, throwError = true) {
        const attributeID = identifier - this.reserved;
        if (attributeID >= this.attributes.length) {
            if (throwError) {
                throw new SchemaError_1.default('attribute does not exists');
            }
            return;
        }
        return this.attributes[Number(attributeID)];
    }
}
exports.default = MappingSchema;

},{"../Errors/SchemaError":16,"../Serialization/Binary":22}],19:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SchemaError_1 = __importDefault(require("../Errors/SchemaError"));
const __1 = require("..");
class ValueSchema {
    constructor(type) {
        if (typeof __1.ParserTypes[type] === 'undefined') {
            throw new SchemaError_1.default(`attribute type '${type}' not defined`);
        }
        this.parser = __1.ParserTypes[type];
    }
    deserialize(state) {
        return this.parser.deserialize(state);
    }
    serialize(value) {
        return this.parser.serialize(value);
    }
}
exports.default = ValueSchema;

},{"..":36,"../Errors/SchemaError":16}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Binary_1 = require("../Serialization/Binary");
class VectorSchema {
    constructor(element) {
        this.element = element;
    }
    deserialize(state) {
        const length = Binary_1.varint_decode(state).toJSNumber();
        const array = [];
        for (let i = 0; i < length; i++) {
            array.push(this.element.deserialize(state));
        }
        return array;
    }
    serialize(array) {
        const data = [Binary_1.varint_encode(array.length)];
        for (const element of array) {
            data.push(this.element.serialize(element));
        }
        return Binary_1.concat_byte_arrays(data);
    }
}
exports.default = VectorSchema;

},{"../Serialization/Binary":22}],21:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectSchema = void 0;
const SchemaError_1 = __importDefault(require("../Errors/SchemaError"));
const MappingSchema_1 = __importDefault(require("./MappingSchema"));
const ValueSchema_1 = __importDefault(require("./ValueSchema"));
const VectorSchema_1 = __importDefault(require("./VectorSchema"));
function buildObjectSchema(objectID, lookup) {
    const attributes = [];
    let fields = lookup[objectID];
    if (typeof fields === 'undefined') {
        fields = [];
    }
    delete lookup[objectID];
    for (const field of fields) {
        attributes.push({ name: field.name, value: buildValueSchema(field.type, lookup) });
    }
    return new MappingSchema_1.default(attributes);
}
function buildValueSchema(type, lookup) {
    if (type.endsWith('[]')) {
        return new VectorSchema_1.default(buildValueSchema(type.substring(0, type.length - 2), lookup));
    }
    // not supported by the contract currently
    if (type.startsWith('object{') && type.endsWith('}')) {
        const objectID = parseInt(type.substring(7, type.length - 1), 10);
        if (isNaN(objectID)) {
            throw new SchemaError_1.default(`invalid type '${type}'`);
        }
        return buildObjectSchema(objectID, lookup);
    }
    return new ValueSchema_1.default(type);
}
function ObjectSchema(schema) {
    const objectLookup = {};
    for (const schemaObject of schema) {
        const objectID = typeof schemaObject.parent === 'undefined' ? 0 : schemaObject.parent;
        if (typeof objectLookup[objectID] === 'undefined') {
            objectLookup[objectID] = [];
        }
        objectLookup[objectID].push(schemaObject);
    }
    return buildObjectSchema(0, objectLookup);
}
exports.ObjectSchema = ObjectSchema;

},{"../Errors/SchemaError":16,"./MappingSchema":18,"./ValueSchema":19,"./VectorSchema":20}],22:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.byte_vector_to_int = exports.int_to_byte_vector = exports.concat_byte_arrays = exports.hex_encode = exports.hex_decode = exports.base58_encode = exports.base58_decode = exports.zigzag_decode = exports.zigzag_encode = exports.integer_unsign = exports.integer_sign = exports.varint_decode = exports.varint_encode = void 0;
const big_integer_1 = __importDefault(require("big-integer"));
const DeserializationError_1 = __importDefault(require("../Errors/DeserializationError"));
const SerializationError_1 = __importDefault(require("../Errors/SerializationError"));
const Base_1 = __importDefault(require("./Coders/Base"));
function varint_encode(input) {
    const bytes = [];
    let n = big_integer_1.default(input);
    if (n.lesser(0)) {
        throw new SerializationError_1.default('cant pack negative integer');
    }
    while (true) {
        const byte = n.and(0x7F);
        n = n.shiftRight(7);
        if (n.equals(0)) {
            bytes.push(byte.toJSNumber());
            break;
        }
        bytes.push(byte.toJSNumber() + 128);
    }
    return new Uint8Array(bytes);
}
exports.varint_encode = varint_encode;
function varint_decode(state) {
    let result = big_integer_1.default(0);
    for (let i = 0; true; i++) {
        if (state.position >= state.data.length) {
            throw new DeserializationError_1.default('failed to unpack integer');
        }
        const byte = big_integer_1.default(state.data[state.position]);
        state.position += 1;
        if (byte.lesser(128)) {
            result = result.plus(byte.shiftLeft(7 * i));
            break;
        }
        result = result.plus(byte.and(0x7F).shiftLeft(7 * i));
    }
    return result;
}
exports.varint_decode = varint_decode;
function integer_sign(input, size) {
    const n = big_integer_1.default(input);
    if (n.greaterOrEquals(big_integer_1.default(2).pow(8 * size - 1))) {
        throw new Error('cannot sign integer: too big');
    }
    if (n.greaterOrEquals(0)) {
        return n;
    }
    return n.negate().xor(big_integer_1.default(2).pow(8 * size).minus(1)).plus(1);
}
exports.integer_sign = integer_sign;
function integer_unsign(input, size) {
    const n = big_integer_1.default(input);
    if (n.greater(big_integer_1.default(2).pow(8 * size))) {
        throw new Error('cannot unsign integer: too big');
    }
    if (n.greater(big_integer_1.default(2).pow(8 * size - 1))) {
        return n.minus(1).xor(big_integer_1.default(2).pow(8 * size).minus(1)).negate();
    }
    return n;
}
exports.integer_unsign = integer_unsign;
function zigzag_encode(input) {
    const n = big_integer_1.default(input);
    if (n.lesser(0)) {
        return n.plus(1).multiply(-2).plus(1);
    }
    return n.multiply(2);
}
exports.zigzag_encode = zigzag_encode;
function zigzag_decode(input) {
    const n = big_integer_1.default(input);
    if (n.mod(2).equals(0)) {
        return n.divmod(2).quotient;
    }
    return n.divmod(2).quotient.multiply(-1).minus(1);
}
exports.zigzag_decode = zigzag_decode;
const bs58 = new Base_1.default('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');
function base58_decode(data) {
    return bs58.decode(data);
}
exports.base58_decode = base58_decode;
function base58_encode(data) {
    return bs58.encode(data);
}
exports.base58_encode = base58_encode;
function hex_decode(hex) {
    const bytes = hex.match(/.{1,2}/g);
    if (!bytes) {
        return new Uint8Array(0);
    }
    return new Uint8Array(bytes.map((byte) => parseInt(byte, 16)));
}
exports.hex_decode = hex_decode;
function hex_encode(bytes) {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
exports.hex_encode = hex_encode;
function concat_byte_arrays(arr) {
    // concat all bytearrays into one array
    const data = new Uint8Array(arr.reduce((acc, val) => acc + val.length, 0));
    let offset = 0;
    for (const bytes of arr) {
        data.set(bytes, offset);
        offset += bytes.length;
    }
    return data;
}
exports.concat_byte_arrays = concat_byte_arrays;
function int_to_byte_vector(n) {
    const bytes = [];
    let num = big_integer_1.default(n);
    while (num.notEquals(0)) {
        bytes.push(num.and(0xFF).toJSNumber());
        num = num.shiftRight(8);
    }
    return new Uint8Array(bytes);
}
exports.int_to_byte_vector = int_to_byte_vector;
function byte_vector_to_int(bytes) {
    let num = big_integer_1.default(0);
    for (let i = 0; i < bytes.length; i++) {
        num = num.plus(big_integer_1.default(bytes[i]).shiftLeft(8 * i));
    }
    return num.toJSNumber();
}
exports.byte_vector_to_int = byte_vector_to_int;

},{"../Errors/DeserializationError":14,"../Errors/SerializationError":17,"./Coders/Base":23,"big-integer":38}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* based on npm base-x module (removed buffer, added class structure) */
class BaseCoder {
    constructor(ALPHABET) {
        this.ALPHABET = ALPHABET;
        if (ALPHABET.length >= 255) {
            throw new TypeError('Alphabet too long');
        }
        this.BASE_MAP = new Uint8Array(256);
        for (let j = 0; j < this.BASE_MAP.length; j++) {
            this.BASE_MAP[j] = 255;
        }
        for (let i = 0; i < ALPHABET.length; i++) {
            const x = ALPHABET.charAt(i);
            const xc = x.charCodeAt(0);
            if (this.BASE_MAP[xc] !== 255) {
                throw new TypeError(x + ' is ambiguous');
            }
            this.BASE_MAP[xc] = i;
        }
        this.BASE = ALPHABET.length;
        this.LEADER = ALPHABET.charAt(0);
        this.FACTOR = Math.log(this.BASE) / Math.log(256); // log(BASE) / log(256), rounded up
        this.iFACTOR = Math.log(256) / Math.log(this.BASE); // log(256) / log(BASE), rounded up
    }
    encode(source) {
        if (source.length === 0) {
            return '';
        }
        // Skip & count leading zeroes.
        let zeroes = 0;
        let length = 0;
        let pbegin = 0;
        const pend = source.length;
        while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
        }
        // Allocate enough space in big-endian base58 representation.
        const size = ((pend - pbegin) * this.iFACTOR + 1) >>> 0;
        const b58 = new Uint8Array(size);
        // Process the bytes.
        while (pbegin !== pend) {
            let carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
            let i = 0;
            for (let it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
                carry += (256 * b58[it1]) >>> 0;
                b58[it1] = (carry % this.BASE) >>> 0;
                carry = (carry / this.BASE) >>> 0;
            }
            if (carry !== 0) {
                throw new Error('Non-zero carry');
            }
            length = i;
            pbegin++;
        }
        // Skip leading zeroes in base58 result.
        let it2 = size - length;
        while (it2 !== size && b58[it2] === 0) {
            it2++;
        }
        // Translate the result into a string.
        let str = this.LEADER.repeat(zeroes);
        for (; it2 < size; ++it2) {
            str += this.ALPHABET.charAt(b58[it2]);
        }
        return str;
    }
    decode(source) {
        const buffer = this.decodeUnsafe(source);
        if (buffer) {
            return buffer;
        }
        throw new Error('Non-base' + this.BASE + ' character');
    }
    decodeUnsafe(source) {
        if (source.length === 0) {
            return new Uint8Array(0);
        }
        let psz = 0;
        // Skip leading spaces.
        if (source[psz] === ' ') {
            return new Uint8Array(0);
        }
        // Skip and count leading '1's.
        let zeroes = 0;
        let length = 0;
        while (source[psz] === this.LEADER) {
            zeroes++;
            psz++;
        }
        // Allocate enough space in big-endian base256 representation.
        const size = (((source.length - psz) * this.FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
        const b256 = new Uint8Array(size);
        // Process the characters.
        while (source[psz]) {
            // Decode character
            let carry = this.BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
            if (carry === 255) {
                return new Uint8Array(0);
            }
            let i = 0;
            for (let it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
                carry += (this.BASE * b256[it3]) >>> 0;
                b256[it3] = (carry % 256) >>> 0;
                carry = (carry / 256) >>> 0;
            }
            if (carry !== 0) {
                throw new Error('Non-zero carry');
            }
            length = i;
            psz++;
        }
        // Skip trailing spaces.
        if (source[psz] === ' ') {
            return new Uint8Array(0);
        }
        // Skip leading zeroes in b256.
        let it4 = size - length;
        while (it4 !== size && b256[it4] === 0) {
            it4++;
        }
        const vch = new Uint8Array(zeroes + (size - it4));
        vch.fill(0x00, 0, zeroes);
        let j = zeroes;
        while (it4 !== size) {
            vch[j++] = b256[it4++];
        }
        return vch;
    }
}
exports.default = BaseCoder;

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare = void 0;
class SerializationState {
    constructor(data, position = 0) {
        this.data = data;
        this.position = position;
    }
}
exports.default = SerializationState;
function prepare(data) {
    return new SerializationState(data, 0);
}
exports.prepare = prepare;

},{}],25:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FixedParser_1 = __importDefault(require("./FixedParser"));
class BooleanParser extends FixedParser_1.default {
    constructor() {
        super(1);
    }
    deserialize(state) {
        const data = super.deserialize(state);
        return data[0] === 1 ? 1 : 0;
    }
    serialize(data) {
        return super.serialize(new Uint8Array([data ? 1 : 0]));
    }
}
exports.default = BooleanParser;

},{"./FixedParser":28}],26:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ByteParser = void 0;
const VariableParser_1 = __importDefault(require("./VariableParser"));
class ByteParser extends VariableParser_1.default {
    deserialize(state) {
        return super.deserialize(state);
    }
    serialize(data) {
        return super.serialize(data);
    }
}
exports.ByteParser = ByteParser;

},{"./VariableParser":33}],27:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_integer_1 = __importDefault(require("big-integer"));
const FixedParser_1 = __importDefault(require("./FixedParser"));
class FixedIntegerParser extends FixedParser_1.default {
    deserialize(state) {
        const data = super.deserialize(state).reverse();
        let n = big_integer_1.default(0);
        for (const byte of data) {
            n = n.shiftLeft(8);
            n = n.plus(byte);
        }
        if (this.size <= 6) {
            return n.toJSNumber();
        }
        return n.toString();
    }
    serialize(data) {
        let n = big_integer_1.default(data);
        const buffer = [];
        for (let i = 0; i < this.size; i++) {
            buffer.push(n.and(0xFF).toJSNumber());
            n = n.shiftRight(8);
        }
        return super.serialize(new Uint8Array(buffer));
    }
}
exports.default = FixedIntegerParser;

},{"./FixedParser":28,"big-integer":38}],28:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DeserializationError_1 = __importDefault(require("../../Errors/DeserializationError"));
const SerializationError_1 = __importDefault(require("../../Errors/SerializationError"));
class FixedParser {
    constructor(size) {
        this.size = size;
    }
    deserialize(state) {
        state.position += this.size;
        const data = state.data.slice(state.position - this.size, state.position);
        if (data.length !== this.size) {
            throw new DeserializationError_1.default('FixedParser: read past end');
        }
        return data;
    }
    serialize(data) {
        if (data.length !== this.size) {
            throw new SerializationError_1.default(`input data does not conform fixed size`);
        }
        return data;
    }
}
exports.default = FixedParser;

},{"../../Errors/DeserializationError":14,"../../Errors/SerializationError":17}],29:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FixedParser_1 = __importDefault(require("./FixedParser"));
// tslint:disable-next-line:no-var-requires
const fp = require('../../../lib/float');
class FloatingParser extends FixedParser_1.default {
    constructor(isDouble) {
        super(isDouble ? 8 : 4);
        this.isDouble = isDouble;
    }
    deserialize(state) {
        if (this.isDouble) {
            return fp.readDoubleLE(super.deserialize(state));
        }
        return fp.readFloatLE(super.deserialize(state));
    }
    serialize(data) {
        // tslint:disable-next-line:prefer-const
        let bytes = [];
        if (this.isDouble) {
            fp.writeDoubleLE(bytes, data);
            return super.serialize(new Uint8Array(bytes));
        }
        fp.writeFloatLE(bytes, data);
        return super.serialize(new Uint8Array(bytes));
    }
}
exports.default = FloatingParser;

},{"../../../lib/float":37,"./FixedParser":28}],30:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Binary_1 = require("../Binary");
const VariableParser_1 = __importDefault(require("./VariableParser"));
class IPFSParser extends VariableParser_1.default {
    deserialize(state) {
        return Binary_1.base58_encode(super.deserialize(state));
    }
    serialize(data) {
        return super.serialize(Binary_1.base58_decode(data));
    }
}
exports.default = IPFSParser;

},{"../Binary":22,"./VariableParser":33}],31:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VariableParser_1 = __importDefault(require("./VariableParser"));
class StringParser extends VariableParser_1.default {
    deserialize(state) {
        return new TextDecoder().decode(super.deserialize(state));
    }
    serialize(data) {
        return super.serialize(new TextEncoder().encode(data));
    }
}
exports.default = StringParser;

},{"./VariableParser":33}],32:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_integer_1 = __importDefault(require("big-integer"));
const DeserializationError_1 = __importDefault(require("../../Errors/DeserializationError"));
const SerializationError_1 = __importDefault(require("../../Errors/SerializationError"));
const Binary_1 = require("../Binary");
class VariableIntegerParser {
    constructor(size, unsigned) {
        this.size = size;
        this.unsigned = unsigned;
    }
    deserialize(state) {
        let n = Binary_1.varint_decode(state);
        if (!this.unsigned) {
            n = Binary_1.zigzag_decode(n);
        }
        if (n.greaterOrEquals(big_integer_1.default(2).pow(this.size * 8 - (this.unsigned ? 0 : 1)))) {
            throw new DeserializationError_1.default('number \'' + n.toString() + '\' too large for given type');
        }
        if (this.size <= 6) {
            return n.toJSNumber();
        }
        return n.toString();
    }
    serialize(data) {
        let n = big_integer_1.default(data);
        if (n.greaterOrEquals(big_integer_1.default(2).pow(this.size * 8 - (this.unsigned ? 0 : 1)))) {
            throw new SerializationError_1.default('number \'' + n.toString() + '\' too large for given type');
        }
        if (!this.unsigned) {
            n = Binary_1.zigzag_encode(n);
        }
        return Binary_1.varint_encode(n);
    }
}
exports.default = VariableIntegerParser;

},{"../../Errors/DeserializationError":14,"../../Errors/SerializationError":17,"../Binary":22,"big-integer":38}],33:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DeserializationError_1 = __importDefault(require("../../Errors/DeserializationError"));
const Binary_1 = require("../Binary");
class VariableParser {
    deserialize(state) {
        const length = Binary_1.varint_decode(state).toJSNumber();
        state.position += length;
        const data = state.data.slice(state.position - length, state.position);
        if (data.length !== length) {
            throw new DeserializationError_1.default(`VariableParser: read past end`);
        }
        return data;
    }
    serialize(data) {
        return Binary_1.concat_byte_arrays([Binary_1.varint_encode(data.length), data]);
    }
}
exports.default = VariableParser;

},{"../../Errors/DeserializationError":14,"../Binary":22}],34:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserTypes = void 0;
const BooleanParser_1 = __importDefault(require("./TypeParser/BooleanParser"));
const ByteParser_1 = require("./TypeParser/ByteParser");
const FixedIntegerParser_1 = __importDefault(require("./TypeParser/FixedIntegerParser"));
const FloatingParser_1 = __importDefault(require("./TypeParser/FloatingParser"));
const IPFSParser_1 = __importDefault(require("./TypeParser/IPFSParser"));
const StringParser_1 = __importDefault(require("./TypeParser/StringParser"));
const VariableIntegerParser_1 = __importDefault(require("./TypeParser/VariableIntegerParser"));
// tslint:disable:object-literal-sort-keys
exports.ParserTypes = {
    int8: new VariableIntegerParser_1.default(1, false),
    int16: new VariableIntegerParser_1.default(2, false),
    int32: new VariableIntegerParser_1.default(4, false),
    int64: new VariableIntegerParser_1.default(8, false),
    uint8: new VariableIntegerParser_1.default(1, true),
    uint16: new VariableIntegerParser_1.default(2, true),
    uint32: new VariableIntegerParser_1.default(4, true),
    uint64: new VariableIntegerParser_1.default(8, true),
    fixed8: new FixedIntegerParser_1.default(1),
    fixed16: new FixedIntegerParser_1.default(2),
    fixed32: new FixedIntegerParser_1.default(4),
    fixed64: new FixedIntegerParser_1.default(8),
    bool: new BooleanParser_1.default(),
    bytes: new ByteParser_1.ByteParser(),
    string: new StringParser_1.default(),
    image: new StringParser_1.default(),
    ipfs: new IPFSParser_1.default(),
    float: new FloatingParser_1.default(false),
    double: new FloatingParser_1.default(true)
};

},{"./TypeParser/BooleanParser":25,"./TypeParser/ByteParser":26,"./TypeParser/FixedIntegerParser":27,"./TypeParser/FloatingParser":29,"./TypeParser/IPFSParser":30,"./TypeParser/StringParser":31,"./TypeParser/VariableIntegerParser":32}],35:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = exports.serialize = void 0;
const MappingSchema_1 = __importDefault(require("../Schema/MappingSchema"));
const Binary_1 = require("./Binary");
const State_1 = __importDefault(require("./State"));
function serialize(object, schema) {
    const data = schema.serialize(object);
    // remove terminating 0 byte because it is unnecessary
    if (schema instanceof MappingSchema_1.default) {
        return data.slice(0, data.length - 1);
    }
    return data;
}
exports.serialize = serialize;
function deserialize(data, schema) {
    if (schema instanceof MappingSchema_1.default) {
        data = Binary_1.concat_byte_arrays([data, Binary_1.varint_encode(0)]);
    }
    const state = new State_1.default(data, 0);
    return schema.deserialize(state);
}
exports.deserialize = deserialize;

},{"../Schema/MappingSchema":18,"./Binary":22,"./State":24}],36:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionGenerator = exports.ExplorerActionGenerator = exports.RpcActionGenerator = exports.ParserTypes = exports.serialize = exports.deserialize = exports.ObjectSchema = exports.ExplorerApi = exports.RpcApi = void 0;
const Explorer_1 = __importDefault(require("./Actions/Explorer"));
exports.ExplorerActionGenerator = Explorer_1.default;
const Generator_1 = require("./Actions/Generator");
Object.defineProperty(exports, "ActionGenerator", { enumerable: true, get: function () { return Generator_1.ActionGenerator; } });
const Rpc_1 = __importDefault(require("./Actions/Rpc"));
exports.RpcActionGenerator = Rpc_1.default;
const Explorer_2 = __importDefault(require("./API/Explorer"));
exports.ExplorerApi = Explorer_2.default;
const Rpc_2 = __importDefault(require("./API/Rpc"));
exports.RpcApi = Rpc_2.default;
const Schema_1 = require("./Schema");
Object.defineProperty(exports, "ObjectSchema", { enumerable: true, get: function () { return Schema_1.ObjectSchema; } });
const Serialization_1 = require("./Serialization");
Object.defineProperty(exports, "deserialize", { enumerable: true, get: function () { return Serialization_1.deserialize; } });
Object.defineProperty(exports, "serialize", { enumerable: true, get: function () { return Serialization_1.serialize; } });
const Types_1 = require("./Serialization/Types");
Object.defineProperty(exports, "ParserTypes", { enumerable: true, get: function () { return Types_1.ParserTypes; } });

},{"./API/Explorer":1,"./API/Rpc":9,"./Actions/Explorer":10,"./Actions/Generator":11,"./Actions/Rpc":12,"./Schema":21,"./Serialization":35,"./Serialization/Types":34}],37:[function(require,module,exports){
/**
 * pure javascript functions to read and write 32-bit and 64-bit IEEE 754 floating-point
 *
 * Copyright (C) 2017-2019 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */
// removed buffer

'use strict';

var isBigeCpu = false;
var readFloat32Array, writeFloat32Array, readFloat32ArrayRev, writeFloat32ArrayRev;
var readFloat64Array, writeFloat64Array, readFloat64ArrayRev, writeFloat64ArrayRev;


// test FloatArray existence with && to not throw off code coverage
(typeof Float32Array === 'function') && (function(){
    var _fp32 = new Float32Array(1);
    var _b32 = new Uint8Array(_fp32.buffer);

    _fp32[0] = -1;
    isBigeCpu = _b32[3] === 0;

    readFloat32Array = function readFloat32Array( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 4 > buf.length) return 0;
        _b32[0] = buf[pos++]; _b32[1] = buf[pos++]; _b32[2] = buf[pos++];_b32[3] = buf[pos];
        //_b32[0] = buf[pos+0]; _b32[1] = buf[pos+1]; _b32[2] = buf[pos+2]; _b32[3] = buf[pos+3];
        return _fp32[0];
    }

    readFloat32ArrayRev = function readFloat32ArrayRev( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 4 > buf.length) return 0;
        _b32[3] = buf[pos++]; _b32[2] = buf[pos++]; _b32[1] = buf[pos++]; _b32[0] = buf[pos];
        //_b32[3] = buf[pos+0]; _b32[2] = buf[pos+1]; _b32[1] = buf[pos+2]; _b32[0] = buf[pos+3];
        return _fp32[0];
    }

    writeFloat32Array = function writeFloat32Array( buf, v, pos ) {
        pos = pos || 0;
        _fp32[0] = v;
        buf[pos++] = _b32[0]; buf[pos++] = _b32[1]; buf[pos++] = _b32[2]; buf[pos] = _b32[3];
        //buf[pos+0] = _b32[0]; buf[pos+1] = _b32[1]; buf[pos+2] = _b32[2]; buf[pos+3] = _b32[3];
    }

    writeFloat32ArrayRev = function writeFloat32ArrayRev( buf, v, pos ) {
        pos = pos || 0;
        _fp32[0] = v;
        buf[pos++] = _b32[3]; buf[pos++] = _b32[2]; buf[pos++] = _b32[1]; buf[pos] = _b32[0];
        //buf[pos+0] = _b32[3]; buf[pos+1] = _b32[2]; buf[pos+2] = _b32[1]; buf[pos+3] = _b32[0];
    }
})();

(typeof Float64Array === 'function') && (function(){
    var _fp64 = new Float64Array(1);
    var _b64 = new Uint8Array(_fp64.buffer);

    readFloat64Array = function readFloat64Array( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 8 > buf.length) return 0;
        //_b64[0] = buf[pos++]; _b64[1] = buf[pos++]; _b64[2] = buf[pos++]; _b64[3] = buf[pos++];
        //_b64[4] = buf[pos++]; _b64[5] = buf[pos++]; _b64[6] = buf[pos++]; _b64[7] = buf[pos];
        _b64[0] = buf[pos+0]; _b64[1] = buf[pos+1]; _b64[2] = buf[pos+2]; _b64[3] = buf[pos+3];
        _b64[4] = buf[pos+4]; _b64[5] = buf[pos+5]; _b64[6] = buf[pos+6]; _b64[7] = buf[pos+7];
        return _fp64[0];
    }

    readFloat64ArrayRev = function readFloat64ArrayRev( buf, pos ) {
        pos = pos || 0;
        if (pos < 0 || pos + 8 > buf.length) return 0;
        //_b64[7] = buf[pos++]; _b64[6] = buf[pos++]; _b64[5] = buf[pos++]; _b64[4] = buf[pos++];
        //_b64[3] = buf[pos++]; _b64[2] = buf[pos++]; _b64[1] = buf[pos++]; _b64[0] = buf[pos];
        _b64[7] = buf[pos+0]; _b64[6] = buf[pos+1]; _b64[5] = buf[pos+2]; _b64[4] = buf[pos+3];
        _b64[3] = buf[pos+4]; _b64[2] = buf[pos+5]; _b64[1] = buf[pos+6]; _b64[0] = buf[pos+7];
        return _fp64[0];
    }

    writeFloat64Array = function writeFloat64Array( buf, v, pos ) {
        pos = pos || 0;
        _fp64[0] = v;
        buf[pos + 0] = _b64[0]; buf[pos + 1] = _b64[1]; buf[pos + 2] = _b64[2]; buf[pos + 3] = _b64[3];
        buf[pos + 4] = _b64[4]; buf[pos + 5] = _b64[5]; buf[pos + 6] = _b64[6]; buf[pos + 7] = _b64[7];
    }

    writeFloat64ArrayRev = function writeFloat64ArrayRev( buf, v, pos ) {
        pos = pos || 0;
        _fp64[0] = v;
        buf[pos + 0] = _b64[7]; buf[pos + 1] = _b64[6]; buf[pos + 2] = _b64[5]; buf[pos + 3] = _b64[4];
        buf[pos + 4] = _b64[3]; buf[pos + 5] = _b64[2]; buf[pos + 6] = _b64[1]; buf[pos + 7] = _b64[0];
    }
})();


// arithmetic operations preserve NaN, but logical ops (, >>, etc) convert them to zero
// Assemble the word to generate NaN if any reads are undefined (outside the bounds of the array).
function readWord( buf, offs, dirn ) {
    var a = buf[offs++], b = buf[offs++], c = buf[offs++], d = buf[offs];
    return (dirn === 'bige')
        ? (((((a * 256) + b) * 256) + c) * 256) + d
        : (((((d * 256) + c) * 256) + b) * 256) + a;
}

function writeWord( buf, v, offs, dirn ) {
    var a = (v >>> 24) & 0xff, b = (v >> 16) & 0xff, c = (v >> 8) & 0xff, d = (v) & 0xff;
    (dirn === 'bige')
        ? (buf[offs++] = a, buf[offs++] = b, buf[offs++] = c, buf[offs] = d)
        : (buf[offs++] = d, buf[offs++] = c, buf[offs++] = b, buf[offs] = a)
}

// write the two-word value [hi,lo] where hi holds the 32 msb bits and lo the 32 lsb bits
function writeDoubleWord( buf, hi, lo, offs, dirn ) {
    if (dirn === 'bige') {
        writeWord(buf, hi, offs, dirn);
        writeWord(buf, lo, offs + 4, dirn);
    }
    else {
        writeWord(buf, lo, offs, dirn);
        writeWord(buf, hi, offs + 4, dirn);
    }
}

// given an exponent n, return 2**n
// n is always an integer, faster to shift when possible
// Note that nodejs Math.pow() is faster than a lookup table (may be caching)
var _2eXp = new Array(); for (var i=0; i<1200; i++) _2eXp[i] = Math.pow(2, i);
var _2eXn = new Array(); for (var i=0; i<1200; i++) _2eXn[i] = Math.pow(2, -i);
function pow2( exp ) {
    return (exp >= 0) ? _2eXp[exp] : _2eXn[-exp];
    //return (exp >= 0) ? (exp <  31 ? (1 << exp) :        Math.pow(2, exp))
    //                  : (exp > -31 ? (1 / (1 << -exp)) : Math.pow(2, exp));
}


// getFloat() from qbson, https://github.com/andrasq/node-qbson:
/*
 * extract the 64-bit little-endian ieee 754 floating-point value
 *   see http://en.wikipedia.org/wiki/Double-precision_floating-point_format
 *   1 bit sign + 11 bits exponent + (1 implicit mantissa 1 bit) + 52 mantissa bits
 */
var _rshift32 = (1 / 0x100000000);      // >> 32 for floats
var _rshift20 = (1 / 0x100000);         // >> 20 for floats
var _lshift32 = (1 * 0x100000000);      // << 32
var _rshift52 = (1 * _rshift32 * _rshift20);    // >> 52
var _rshift1023 = pow2(-1023);          // 2^-1023
function readDouble( buf, offset, dirn ) {
    var w0 = readWord(buf, offset, dirn);
    var w1 = readWord(buf, offset + 4, dirn);
    var highWord, lowWord;
    (dirn === 'bige') ? (highWord = w0, lowWord = w1) : (highWord = w1, lowWord = w0);

    var mantissa = (highWord & 0x000FFFFF) * _lshift32 + lowWord;
    var exponent = (highWord & 0x7FF00000) >>> 20;
    var sign = (highWord >> 31) || 1;   // -1, 1, or 1 if NaN

    var value;
    if (exponent === 0x000) {
        // zero if !mantissa, else subnormal (non-normalized reduced precision small value)
        // recover negative zero -0.0 as distinct from 0.0
        // subnormals do not have an implied leading 1 bit and are positioned 1 bit to the left
        value = mantissa ? (mantissa * pow2(-52 + 1 -1023)) : 0.0;
    }
    else if (exponent < 0x7ff) {
        // normalized value with an implied leading 1 bit and 1023 biased exponent
        // test for NaN with (mantissa >= 0), and return 0 if NaN ie read from outside buffer bounds
        value = (mantissa >= 0) ? (1 + mantissa * _rshift52) * pow2(exponent - 1023) : 0.0;
    }
    else {
        // Infinity if zero mantissa (+/- per sign), NaN if nonzero mantissa
        value = mantissa ? NaN : Infinity;
    }

    return sign * value;
}

//
// Note: node-v9 prefers +28% (sign * value), node v6 doesnt care, node v8 likes +16% (-value : value)
//
// float32: 1 sign + 8 exponent + 24 mantissa (23 stored, 1 implied)
// see https://en.wikipedia.org/wiki/Single-precision_floating-point_format
//
// Exponent     Mantissa == 0   Mantissa > 0    Value
// 00           +0, -0          denormalized    2^(  1-127) * (0. + (mantissa / 2^23))
// 00.. FE                      normalized      2^(exp-127) * (1. + (mantissa / 2^23))
// FF           +/-Infinity     NaN             -
//
var _rshift23 = Math.pow(2, -23);      // >> 23 for floats
var _rshift127 = Math.pow(2, -127);    // 2^-127
function readFloat( buf, offset, dirn ) {
    var word = readWord(buf, offset, dirn);
    var mantissa = (word & 0x007FFFFF);
    var exponent = (word & 0x7F800000) >>> 23;
    var sign = (word >> 31) || 1;       // -1, 1, or 1 if NaN

    var value;
    if (exponent === 0x000) {
        value = mantissa ? mantissa * _rshift23 * 2 * _rshift127 : 0.0;
    }
    else if (exponent < 0xff) {
        value = (1 + mantissa * _rshift23) * pow2(exponent - 127) // * _rshift127;
    }
    else {
        value = mantissa ? NaN : Infinity;
    }

    return sign * value;
    //return (word >>> 31) ? -value : value;
}

// given a positive value v, normalize it to between 1 and less than 2 with a binary exponent
// The exponent is the number of bit places it was shifted, positive if v was >= 2.
// The special values 0, -0, NaN, +Infinity and -Infinity are not handled here.
// Looping is faster than (Math.log(v) / Math.LN2) in node-v6, v8, and v9.
// This function can account for half the time taken to write a double.
var _parts = { exp: 0, mant: 0 };
function normalize( v ) {
    var exp = 0;

    if (v >= 2) {
        exp = countDoublings(1, v);
        v *= pow2(-exp);
        // if doubled to exactly v/2, adjust up to v
        if (v >= 2) { v /= 2; exp += 1 }
    }
    else if (v < 1) {
        exp = countDoublings(v, 2);
        // avoid using pow2 exponents > 1023, they overflow to Infinity
        if (exp <= 1023) v *= pow2(exp);
        else { v *= pow2(exp - 100); v *= pow2(100); }
        exp = -exp;
    }

    // TODO: pass in num bits, and normalize straight to mantissa / denorm

    _parts.exp = exp;
    _parts.mant = v;
    return _parts;
}

// count how many doublings of a are needed for it be close to b.
// Returns a shift count that grows (a) to at least (b/2) but less than (b).
// Doubling 1 toward v ensures that (v >> n) >= 1 < 2,
// and doubling from v toward 2 ensures that (v << n) >= 1 < 2.
var _2e192 = Math.pow(2, 192);
function countDoublings( a, b ) {
    var n = 0;

    while (a * _2e192 < b) { a *= _2e192; n += 192 }
    while (a * 0x10000000000000000 < b) { a *= 0x10000000000000000; n += 64 }
    while (a * 0x10000 < b) { a *= 0x10000; n += 16 }
    while (a * 0x40 < b) { a *= 0x40; n += 6 }
    while (a * 2 < b) { a *= 2; n += 1 }

    return n;
}

// round the fraction in v and scale up to scale = 2^n bits
// https://blog.angularindepth.com/how-to-round-binary-fractions-625c8fa3a1af
// Rounding can cause the scaled value to exceed 2^n.
function roundMantissa( v, scale ) {
    v *= scale;
    // round to nearest, but round a 0.5 tie to even (0.5 to 0.0 and 1.5 to 2.0)
    // round all numbers with a fraction other than 1/2, and round up odd numbers with
    return ((v - Math.floor(v) !== 0.5) || (v & 1)) ? v + 0.5 : v;
}

// float32: 1 sign + 8 exponent + (1 implied mantissa 1 bit) + 23 stored mantissa bits
// NaN types: quiet Nan = x.ff.8xxx, signaling NaN = x.ff.0xx1 (msb zero, at least one other bit set)
// JavaScript built-in NaN is the non-signaling 7fc00000, but arithmetic can yield a negative NaN ffc00000.
function writeFloat( buf, v, offset, dirn ) {
    var norm, word, sign = 0;
    if (v < 0) { sign = 0x80000000; v = -v; }

    if (! (v && v < Infinity)) {
        if (v === 0) {                  // -0, +0
            word = (1/v < 0) ? 0x80000000 : 0x00000000;
        }
        else if (v === Infinity) {      // -Infinity, +Infinity
            word = sign | 0x7F800000;
        }
        else {                          // NaN - positive, non-signaling
            word = 0x7FC00000;
        }
        writeWord(buf, word, offset, dirn);
    }
    else {
        norm = normalize(v);            // separate exponent and mantissa
        norm.exp += 127;                // bias exponent

        if (norm.exp <= 0) {            // denormalized number
            if (norm.exp <= -25) {      // too small, underflow to zero.  -24 might round up though.
                norm.mant = 0;
                norm.exp = 0;
            } else {                    // denormalize
                norm.mant = roundMantissa(norm.mant, pow2(22 + norm.exp));
                norm.exp = 0;           // rounding can carry out and re-normalize the number
                if (norm.mant >= 0x800000) { norm.mant -= 0x800000; norm.exp += 1 }
            }
        } else {
            norm.mant = roundMantissa(norm.mant - 1, 0x800000);
            // if rounding overflowed into the hidden 1s place, hide it and adjust the exponent
            if (norm.mant >= 0x800000) { norm.mant -= 0x800000; norm.exp += 1 }
            if (norm.exp > 254) {       // overflow to Infinity
                norm.mant = 0;
                norm.exp = 255;
            }
        }

        word = sign | (norm.exp << 23) | norm.mant;
        writeWord(buf, word, offset, dirn);
    }
}

// double64: 1 bit sign + 11 bits exponent + (1 implied mantissa 1 bit) + 52 stored mantissa bits
// Writing doubles is simpler than floats, because the internal javascript 64-bit floats
// are identical to the stored representation, and thus will not overflow or underflow.
var doubleArray = [0, 0, 0, 0, 0, 0, 0, 0];
var doubleBuf = new Uint8Array(8);
var _2e52 = Math.pow(2, 52);
function writeDouble( buf, v, offset, dirn ) {
    var norm, highWord, lowWord, sign = 0;
    if (v < 0) { sign = 0x80000000; v = -v; }

    if (! (v && v < Infinity)) {
        if (v === 0) {                  // -0, +0
            highWord = (1/v < 0) ? 0x80000000 : 0;
            lowWord = 0;
        }
        else if (v === Infinity) {      // -Infinity, +Infinity
            highWord = (sign + 0x7FF00000);
            lowWord = 0;
        }
        else {                          // NaN - positive, non-signaling
            highWord = 0x7FF80000;
            lowWord = 0;
        }
        writeDoubleWord(buf, highWord, lowWord, offset, dirn);
    }
    else {
        norm = normalize(v);            // separate exponent and mantissa
        norm.exp += 1023;               // bias exponent

        if (norm.exp <= 0) {            // denormalized
            // JavaScript numbers can not hold values small enough to underflow
            // and no need to round, all bits will be written
            norm.mant *= pow2(51 + norm.exp);
            norm.exp = 0;
        }
        else {
            // no need to round, all bits will be written
            norm.mant = (norm.mant - 1) * _2e52;
        }

        highWord = sign | (norm.exp << 20) | (norm.mant / 0x100000000);
        lowWord = norm.mant >>> 0;
        writeDoubleWord(buf, highWord, lowWord, offset, dirn);
    }
}


;(function install() {
    var exports = typeof module === 'object' && module.exports || this;

    exports.readWord = readWord;
    exports.writeWord = writeWord;
    exports.writeDoubleWord = writeDoubleWord;

    exports.readFloat = readFloat;
    exports.writeFloat = writeFloat;
    exports.readDouble = readDouble;
    exports.writeDouble = writeDouble;

    // expose the implementation to the tests
    exports._useFloatArray = function( yesno ) {
        exports._usingFloatArray = yesno;
        if (yesno) {
            // software conversion is faster for float32 than Float32Array
            // Only read via Float32Array if yesno == 'full'.
            if (yesno == 'full') exports.readFloatLE = isBigeCpu ? readFloat32ArrayRev : readFloat32Array;
            exports.writeFloatLE = isBigeCpu ? writeFloat32ArrayRev : writeFloat32Array;
            if (yesno == 'full') exports.readFloatBE = isBigeCpu ? readFloat32Array : readFloat32ArrayRev;
            exports.writeFloatBE = isBigeCpu ? writeFloat32Array : writeFloat32ArrayRev;

            exports.readDoubleLE = isBigeCpu ? readFloat64ArrayRev : readFloat64Array;
            exports.writeDoubleLE = isBigeCpu ? writeFloat64ArrayRev : writeFloat64Array;
            exports.readDoubleBE = isBigeCpu ? readFloat64Array : readFloat64ArrayRev;
            exports.writeDoubleBE = isBigeCpu ? writeFloat64Array : writeFloat64ArrayRev;
        }
        else {
            exports._usingFloatArray = '';
            exports.readFloatLE = function readFloatLE( buf, offset ) { return exports.readFloat(buf, offset || 0, 'le'); }
            exports.writeFloatLE = function writeFloatLE( buf, v, offset ) { exports.writeFloat(buf, v, offset || 0, 'le'); };
            exports.readFloatBE = function readFloatBE( buf, offset ) { return exports.readFloat(buf, offset || 0, 'bige'); }
            exports.writeFloatBE = function writeFloatBE( buf, v, offset ) { exports.writeFloat(buf, v, offset || 0, 'bige'); }

            exports.readDoubleLE = function readDoubleLE( buf, offset ) { return exports.readDouble(buf, offset || 0, 'le'); }
            exports.writeDoubleLE = function writeDoubleLE( buf, v, offset ) { exports.writeDouble(buf, v, offset || 0, 'le'); }
            exports.readDoubleBE = function readDoubleBE( buf, offset ) { return exports.readDouble(buf, offset || 0, 'bige'); }
            exports.writeDoubleBE = function writeDoubleLE( buf, v, offset ) { exports.writeDouble(buf, v, offset || 0, 'bige'); }
        }
    }

    // expose the cpu endianism to the tests
    exports._getBigeCpu = function() { return isBigeCpu };
    exports._setBigeCpu = function(yesno) { isBigeCpu = yesno };

    // by default export the software conversion functions, then
    // if available, convert by casting a FloatArray to a byte array
    exports._useFloatArray(false);
    exports._useFloatArray(readFloat32Array && readFloat64Array && 'fastest');

    // accelerate access
    install.prototype = exports;

}).call(this);

},{}],38:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    var supportsNativeBigInt = typeof BigInt === "function";

    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    NativeBigInt.prototype.add = function (v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    }
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    NativeBigInt.prototype.subtract = function (v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    }
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function () {
        return new NativeBigInt(-this.value);
    }

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function () {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    }


    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    NativeBigInt.prototype.multiply = function (v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    }
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    NativeBigInt.prototype.square = function (v) {
        return new NativeBigInt(this.value * this.value);
    }

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    NativeBigInt.prototype.pow = function (v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    }

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function (v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    }

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    NativeBigInt.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    }
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    }

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function () {
        return this.value === BigInt(0);
    }

    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    function millerRabinTest(n, a) {
        var nPrev = n.prev(),
            b = nPrev,
            r = 0,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }

    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function (strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function () {
        return new NativeBigInt(this.value + BigInt(1));
    }

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function () {
        return new NativeBigInt(this.value - BigInt(1));
    }

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    BigInteger.prototype.shiftLeft = function (v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I :
                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
                    v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    BigInteger.prototype.bitLength = function () {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    }
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < top) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }

    var parseBase = function (text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return { value: [0], isNegative: false };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(n.toJSNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
    }

    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
            return stringify(x, alphabet);
        }).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    NativeBigInt.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };

    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    }

    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += (new Array(exp + 1)).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if (typeof define === "function" && define.amd) {
    define( function () {
        return bigInt;
    });
}

},{}],39:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).PureCache=t()}(this,(function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function i(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e){return e=e||Object.create(null),{on:function(t,i){(e[t]||(e[t]=[])).push(i)},off:function(t,i){e[t]&&e[t].splice(e[t].indexOf(i)>>>0,1)},emit:function(t,i){(e[t]||[]).slice().map((function(e){e(i)})),(e["*"]||[]).slice().map((function(e){e(t,i)}))}}}var s="expiry",o="add",a="get",u="remove",c="clear",h=function(e){if(e)throw new Error("Cannot use disposed instance.")},d={expiryCheckInterval:100},f=function(){function t(){var i=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e(this,t),n(this,"expire",(function(){h(i.disposed);for(var e=Date.now(),t=e;t>=i.lastExpiredTime;t-=1){var n=i.queue[t];n&&(delete i.queue[t],n.forEach((function(e){var t=e.key;return(0,e.onExpire)(t)})))}i.lastExpiredTime=e})),this.config=Object.assign({},d,r),this.queue={},this.disposed=!1,this.lastExpiredTime=Date.now()-1;var s=this.config.expiryCheckInterval;this.timer=setInterval(this.expire,s)}return i(t,[{key:"add",value:function(e,t,i){return h(this.disposed),this.queue[e]||(this.queue[e]=[]),this.queue[e].push({key:t,onExpire:i}),!0}},{key:"remove",value:function(e,t){h(this.disposed);var i=this.queue[e];if(i){var n=i.filter((function(e){return e.key!==t}));return n.length?this.queue[e]=n:delete this.queue[e],!0}return!1}},{key:"dispose",value:function(){return h(this.disposed),clearInterval(this.timer),this.timer=null,this.queue={},this.disposed=!0,!0}}]),t}(),l={defaultCacheExpiryIn:6e4,expiryCheckInterval:100};return function(){function t(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:f;e(this,t),this.config=Object.assign({},l,i);var s=r(),o=s.on,a=s.off,u=s.emit,c=[o,a,u];this.on=c[0],this.off=c[1],this.emit=c[2],this.cacheStore={},this.disposed=!1;var h=this.config.expiryCheckInterval;this.cacheExpirer=new n({expiryCheckInterval:h})}return i(t,[{key:"put",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.config.defaultCacheExpiryIn;h(this.disposed),this.cacheStore[t]&&this.remove(t);var r=Date.now(),a=n?r+n:null,u={value:i,addedAt:r,expiryAt:a};if(this.cacheStore[t]=u,a){var c=function(){e.remove(t),e.emit(s,{key:t,data:e.cacheStore[t]})};this.cacheExpirer.add(a,t,c)}return this.emit(o,{key:t,data:u}),u}},{key:"get",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";h(this.disposed);var t=this.cacheStore[e];return t?(this.emit(a,{key:e,data:t}),t):null}},{key:"remove",value:function(e){h(this.disposed);var t=this.cacheStore[e];if(t){delete this.cacheStore[e];var i=t.expiryAt;return this.cacheExpirer.remove(i,e),this.emit(u,{key:e,data:t}),!0}return!1}},{key:"dispose",value:function(){var e=this;return h(this.disposed),Object.keys(this.cacheStore).forEach((function(t){return e.remove(t)})),this.emit(c,{}),this.cacheExpirer.dispose(),this.disposed=!0,!0}}]),t}()}));


},{}],41:[function(require,module,exports){
const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const api = new ExplorerApi(
  "https://test.wax.api.atomicassets.io",
  "atomicassets",
  { fetch }
);
console.log(api);
const wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);
var bitcoins = 0;
var bitcoinRate = 0;

// Every item in the game
// TODO: items should be part of the Game variable
var items = [
  {
    name: "item_oldCalculator",
    price: "0.0000001",
  },
  {
    name: "item_oldCpu",
    price: "0.00000125",
  },
  {
    name: "item_oldComputerFromGrandpa",
    price: "0.00003",
  },
  {
    name: "item_rapsberrypy",
    price: "0.00005",
  },
  {
    name: "item_smartphone",
    price: "0.0005",
  },
  {
    name: "item_middleClassPC",
    price: "0.0015",
  },
  {
    name: "item_cheapServer",
    price: "0.004",
  },
  {
    name: "item_gamingPC",
    price: "0.015",
  },
  {
    name: "item_cheapMiner",
    price: "0.05",
  },
  {
    name: "item_highEndUltraPC",
    price: "0.15",
  },
  {
    name: "item_bigMiner",
    price: "1.5",
  },
  {
    name: "item_miningFarm",
    price: "250",
  },
  {
    name: "item_nasaPC",
    price: "5000",
  },
  {
    name: "item_quantumRig",
    price: "245000",
  },
  {
    name: "item_miningFarmSpace",
    price: "2000000",
  },
  {
    name: "item_miningFarmMoon",
    price: "75500000",
  },
  {
    name: "item_bitcoinTimeMachine",
    price: "975000000",
  },
  {
    name: "item_blackHolePoweredMiner",
    price: "750000000000",
  },
];

// Rate is null (at the beginning)
var bSec = null;

// If there is no bitcoins Item in the localStorage, create one.
// If there is one, do the other thing.
if (localStorage.getItem("bitcoins") === null) {
  // Bitcoins are 0
  bitcoins = 0;

  // Set the localStorage Item for the first time
  localStorage.setItem("bitcoins", "0");

  // Write the current amount of Bitcoins on the page
  $(".bitcoinAmount").text(bitcoins.toFixed(8));
} else {
  // Get the amount of Bitcoins and parse them to a float number
  bitcoins = parseFloat(localStorage.getItem("bitcoins"));

  $(".bitcoinAmount").text("loading...");
  $(".satoshiAmount").text("loading...");

  let satoshis = bitcoins * 100000000;
}

/**
 *
 *  <-- Setting up the game´s functions -->
 *
 */

// Game variable which will contain any needed major function or needed variables for the game.
var Game = {};

// Every constant variable is saved here
Game.GameConst = {
  priceMultiplier: 1.15,
  VERSION: "1.4.0",
};

Game.units = [
  "Million",
  "Billion",
  "Trillion",
  "Quadrillion",
  "Quintillion",
  "Sextillion",
  "Septillion",
  "Octillion",
  "Nonillion",
  "Decillion",
  "Undecillion",
  "Duodecillion",
  "Tredecillion",
  "Quattuordecillion",
  "Quindecillion",
  "Sexdecillion",
  "Septdecillion",
  "Octodecillion",
  "Novemdecillion",
  "Vigintillion",
  "Unvigintillion",
  "Duovigintillion",
  "Trevigintillion",
  "Quattuorvigintillion",
  "Quinvigintillion",
  "Sexvigintillion",
  "Septvigintillion",
  "Octovigintillion",
  "Novemvigintillion",
  "Trigintillion",
];

/**
 * Calculating every price for the items when the game was started (and if there are any items).
 *
 * @param element {HTMLElement} - The HTML element of the item on the game page
 * @param price {Number} - The price of the item, got from the items Object
 * @param itemAmount {Number} - The current amount of the item, saved in the localStorage
 */

Game.setPriceAtGameBeginning = function (element, price, itemAmount) {
  // Calculation of the price
  var multiplier = Game.GameConst.priceMultiplier;

  // Calculate the new price -> price * multiplier^itemAmount
  var calculation = (
    parseFloat(price) * Math.pow(multiplier, parseInt(itemAmount))
  ).toFixed(8);

  // Showing the actual price
  element.children()[2].textContent = calculation + " Bitcoins";

  // Set the data-price attribute with the new price
  element.attr("data-price", calculation.toString());
};

/**
 * Function to increase the amount of the item (in the localStorage) with the specific identifier.
 *
 * @param id - The identifier of the item (the id from the list element)
 */
Game.itemAction = function (id) {
  var item = id;
  var itemAmount = 0;

  if (localStorage.getItem(item) === null) {
    localStorage.setItem(item, "1");
  } else {
    itemAmount = parseInt(localStorage.getItem(item));

    localStorage.setItem(item, "" + (itemAmount + 1) + "");
  }
};

/**
 * Calculating the Bitcoins per Second - rate when the page was opened.
 *
 */
Game.setBitcoinPerSecondRateAtBeginning = function () {
  for (var i = 0; i < items.length; i++) {
    if (localStorage.getItem(items[i].name) === null) {
      localStorage.setItem(items[i].name, "0");
    } else {
      // HTML element on the game page
      var $element = $("#" + items[i].name);

      // Amnount of the item
      var itemAmount = localStorage.getItem(items[i].name);

      // Writing the amount on the page at the item´s element
      $element.children()[0].textContent = itemAmount;

      // Only calculate the new price if there is more than 0 items.
      // If there are not enough items, it will just continue, and if there are,
      // it will execute the function and continue after it as well.
      if (itemAmount > 0) {
        Game.setPriceAtGameBeginning(
          $element,
          parseFloat(items[i].price),
          parseInt(itemAmount)
        );
      }

      // Getting the data-bits-per-sec attribute, needed for calculating the bitcoin/sec rate
      var bits_per_sec = $element.attr("data-bits-per-sec");
      itemAmount = parseInt(itemAmount);

      // The rate before
      var before = bitcoinRate;

      // Calculating the rate
      bitcoinRate = bitcoinRate + itemAmount * bits_per_sec;

      // Logging the calculation in the console
      // console.log("i = " + i + " | B/sec before: " + before.toFixed(8) +
      //   " - Calculation made: " + before.toFixed(8) + " + (" + itemAmount + " * " + bits_per_sec + ") = " +  bitcoinRate.toFixed(8) +
      //   " | New B/sec at " + bitcoinRate.toFixed(8))
    }
  }
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function (rate) {
  // Logging the new Bitcoin per second rate
  // console.log("setNewBitcoinRate -> New rate: " + (bitcoinRate + rate).toFixed(8) )

  // Showing the new rate on the page
  // Rounding at specific values
  if (bitcoinRate + rate >= 1000000) {
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0).optimizeNumber());
  } else if (bitcoinRate + rate >= 1000) {
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(0));
  } else if (bitcoinRate + rate >= 1) {
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(2));
  } else {
    $(".bSecRateNumber").text((bitcoinRate + rate).toFixed(8));
  }

  // Returning the new rate
  return (bitcoinRate = bitcoinRate + rate);
};

/**
 * This function will check if there is any change in the localStorage,
 * especially looking at the item amount. So it will actually calculate every price again and
 * again. (This function should be recoded)
 *
 * TODO: Find a better way for setting the price after an item was bought.
 */
Game.setNewPrice = function () {
  // for-loop for getting the price multiplier and to calculate the new price
  for (var i = 0; i < items.length; i++) {
    if (localStorage.getItem(items[i].name) === null) {
      localStorage.setItem(items[i].name, "0");
    } else {
      var $element = $("#" + items[i].name);
      var itemAmount = localStorage.getItem(items[i].name);

      $element.children()[0].textContent = itemAmount;

      // Only calculate if there is more than 0 items
      if (itemAmount > 0) {
        // Calculation of the price
        var multiplier = Game.GameConst.priceMultiplier;
        var calculation = (
          parseFloat(items[i].price) *
          Math.pow(multiplier, parseInt(itemAmount))
        ).toFixed(8);

        // Showing the actual price
        $element.children()[2].textContent = calculation + " Bitcoins";

        // Set the data-price attribute with the new price
        $element.attr("data-price", calculation.toString());
      }
    }
  }
  // End of the for-loop
};

/**
 * The function which adds new generated Bitcoins to the current Bitcoin amount.
 *
 * @param rate - The Bitcoin per second rate; Needed for adding the generated Bitcoins every second
 */
Game.bSecFunction = function (rate) {
  bitcoins = bitcoins + rate;

  // Show both values on the page
  // Rounding the bitcoin number at specific set values
  if (bitcoins > 1000000) {
    let bitcoinUnitNumber = bitcoins.optimizeNumber();

    $(".bitcoinAmount").text(bitcoinUnitNumber);
  } else if (bitcoins >= 1000) {
    $(".bitcoinAmount").text(bitcoins.toFixed(0));
  } else if (bitcoins >= 1) {
    $(".bitcoinAmount").text(bitcoins.toFixed(2));
  } else {
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  }

  // Rounding the satoshis amount at a specific value and optimize it for displaying on the screen.
  var satoshis = bitcoins * 100000000;

  if (satoshis < 1000000) {
    $(".satoshiAmount").text(Math.round(satoshis));
  } else {
    let satoshiUnitNumber = satoshis.optimizeNumber();
    $(".satoshiAmount").text(satoshiUnitNumber);
  }

  // Save bitcoin amount in the storage
  localStorage.setItem("bitcoins", "" + bitcoins + "");

  // console.log("bSec -> B/sec at " + rate.toFixed(8))
};

/**
 * Stops the B/sec interval.
 */
Game.stopBsec = function () {
  clearInterval(bSec);
};

/**
 * Function for optimizing the number with an unit for displaying it on the screen.
 *
 * @returns {string} An optimized number as a string with its unit
 */
Game.optimizeNumber = function () {
  if (this >= 1e6) {
    let number = parseFloat(this);
    let unit =
      Math.floor(
        parseFloat(
          number.toExponential(0).toString().replace("+", "").slice(2)
        ) / 3
      ) * 3;

    // let test = this.toExponential(0).toString().replace("+", "").slice(2)
    // console.log(test)

    var num = (this / ("1e" + unit)).toFixed(2);

    var unitname = Game.units[Math.floor(unit / 3) - 1];

    return num + " " + unitname;
  }

  return this.toLocaleString();
};

Number.prototype.optimizeNumber = Game.optimizeNumber;
String.prototype.optimizeNumber = Game.optimizeNumber;

/**
 * Resets the game
 */
Game.resetGame = function () {
  Game.stopBsec();
  localStorage.setItem("bitcoins", "0");
  localStorage.clear();
  location.reload();
};

// --------------------------------------------------- //

/**
 * <-- Now doing everything -->
 */

// Calculates the Bitcoin/sec rate with the amount of every item multiplied with their given Bitcoins/second rate.
Game.setBitcoinPerSecondRateAtBeginning();

// Stating the interval with the calculated Bitcoin/second rate.
bSec = setInterval(function () {
  Game.bSecFunction(bitcoinRate);
}, 1000);

// Doing everything here when the game is ready to be used.
$(document).ready(function () {
  // Write the version into the .version span element
  $(".version").text("Version " + Game.GameConst.VERSION);

  // Write the bitcoin per second rate into the .bSecRateNumber span element
  if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0));
  } else if (bitcoinRate >= 1) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(2));
  } else {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(8));
  }

  // If clicked on the big Bitcoin
  $(".bitcoin").click(function () {
    // Add 1^-8 Bitcoins (equal to 1 satoshi)
    bitcoins = bitcoins + 0.00000001;

    // Show the new number on the page
    if (bitcoins > 1000000) {
      let bitcoinUnitNumber = bitcoins.optimizeNumber();
      $(".bitcoinAmount").text(bitcoinUnitNumber);
    } else if (bitcoins >= 1000) {
      $(".bitcoinAmount").text(bitcoins.toFixed(0));
    } else if (bitcoins >= 1) {
      $(".bitcoinAmount").text(bitcoins.toFixed(2));
    } else {
      $(".bitcoinAmount").text(bitcoins.toFixed(8));
    }

    if (bitcoins * 100000000 < 1000000) {
      $(".satoshiAmount").text(Math.round(bitcoins * 100000000));
    } else {
      let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber();
      $(".satoshiAmount").text(satoshiUnitNumber);
    }

    // Save the new amount of Bitcoins in the localStorage storage
    localStorage.setItem("bitcoins", "" + bitcoins + "");
  });

  // If any item from the list was clicked...
  $(".purchaseItem").click(function () {
    const result = wax.api
      .transact(
        {
          actions: [
            {
              account: "eosio.token",
              name: "transfer",
              authorization: [
                {
                  actor: wax.userAccount,
                  permission: "active",
                },
              ],
              data: {
                from: wax.userAccount,
                to: "eosio",
                quantity: "0.00000001 WAX",
                memo: "",
              },
            },
          ],
        },
        {
          blocksBehind: 3,
          expireSeconds: 1200,
        }
      )
      .then(console.log);
    // Get following attributes and children elements

    // id of the item
    var id = $(this).attr("id");

    // The price attribute as a float number
    var price = parseFloat($(this).attr("data-price"));

    // The b/sec attribute from the item as a float number
    var bitcoinsPerSecond = parseFloat($(this).attr("data-bits-per-sec"));

    // The element which shows how many of the item is existing
    var amountDisplay = $(this).children()[0];
    var amountDisplayAmount = parseInt(localStorage.getItem(id));

    // If you have enough Bitcoins, it´ll buy one item
    if (parseFloat(bitcoins.toFixed(8)) >= price) {
      // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
      bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

      // Save the new amount of Bitcoins in the localStorage storage
      localStorage.setItem("bitcoins", "" + bitcoins + "");

      // Changing amount number on the right of the item
      amountDisplayAmount = amountDisplayAmount + 1;
      amountDisplay.textContent = amountDisplayAmount.toString();

      // Changing the Bitcoins amount
      // Rounding the Bitcoin number at specific values
      if (bitcoins > 1e6) {
        let bitcoinUnitNumber = bitcoins.optimizeNumber();
        $(".bitcoinAmount").text(bitcoinUnitNumber);
      } else if (bitcoins >= 1000) {
        $(".bitcoinAmount").text(bitcoins.toFixed(0));
      } else if (bitcoins >= 1) {
        $(".bitcoinAmount").text(bitcoins.toFixed(2));
      } else {
        $(".bitcoinAmount").text(bitcoins.toFixed(8));
      }

      // Calculation the Satoshi amount
      if (bitcoins * 100000000 < 1e6) {
        $(".satoshiAmount").text(Math.round(bitcoins * 100000000));
      } else {
        let satoshiUnitNumber = (bitcoins * 100000000).optimizeNumber();
        $(".satoshiAmount").text(satoshiUnitNumber);
      }

      // Increasing the amount of the specific item
      Game.itemAction(id);

      // Stops the interval
      Game.stopBsec();

      // Setting a new price and show it
      Game.setNewPrice();

      // Saving the new calculated Bitcoin/second rate in a variable
      var newRate = Game.setNewBitcoinRate(bitcoinsPerSecond);

      // Restarting the interval with the new rate
      bSec = setInterval(function () {
        Game.bSecFunction(newRate);
      }, 1000);
    }
  });

  //
  // If the reset button was pressed, do following thing
  $(".resetButton").click(function () {
    Game.resetGame();
  });
});

//normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    console.log(wax.userAccount)
    userAccount = await wax.login();
  } catch (e) {
    console.log(e);
  }
}
login();

},{"atomicassets":36,"node-fetch":39}]},{},[41]);
