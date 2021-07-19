(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
/**
 * Returns a Promise that resolves to the value of window.ethereum if it is
 * set within the given timeout, or null.
 * The Promise will not reject, but an error will be thrown if invalid options
 * are provided.
 *
 * @param options - Options bag.
 * @param options.mustBeMetaMask - Whether to only look for MetaMask providers.
 * Default: false
 * @param options.silent - Whether to silence console errors. Does not affect
 * thrown errors. Default: false
 * @param options.timeout - Milliseconds to wait for 'ethereum#initialized' to
 * be dispatched. Default: 3000
 * @returns A Promise that resolves with the Provider if it is detected within
 * given timeout, otherwise null.
 */
function detectEthereumProvider({ mustBeMetaMask = false, silent = false, timeout = 3000, } = {}) {
    _validateInputs();
    let handled = false;
    return new Promise((resolve) => {
        if (window.ethereum) {
            handleEthereum();
        }
        else {
            window.addEventListener('ethereum#initialized', handleEthereum, { once: true });
            setTimeout(() => {
                handleEthereum();
            }, timeout);
        }
        function handleEthereum() {
            if (handled) {
                return;
            }
            handled = true;
            window.removeEventListener('ethereum#initialized', handleEthereum);
            const { ethereum } = window;
            if (ethereum && (!mustBeMetaMask || ethereum.isMetaMask)) {
                resolve(ethereum);
            }
            else {
                const message = mustBeMetaMask && ethereum
                    ? 'Non-MetaMask window.ethereum detected.'
                    : 'Unable to detect window.ethereum.';
                !silent && console.error('@metamask/detect-provider:', message);
                resolve(null);
            }
        }
    });
    function _validateInputs() {
        if (typeof mustBeMetaMask !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'mustBeMetaMask' to be a boolean.`);
        }
        if (typeof silent !== 'boolean') {
            throw new Error(`@metamask/detect-provider: Expected option 'silent' to be a boolean.`);
        }
        if (typeof timeout !== 'number') {
            throw new Error(`@metamask/detect-provider: Expected option 'timeout' to be a number.`);
        }
    }
}
module.exports = detectEthereumProvider;

},{}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class WaxEventSource {
    constructor(waxSigningURL = "http://localhost:3000") {
        this.waxSigningURL = waxSigningURL;
        this.timeout = () => {
            return new Promise((resolve, reject) => {
                const wait = setTimeout(() => {
                    clearTimeout(wait);
                    reject(new Error("Timeout"));
                }, 2000);
            });
        };
        this.openEventSource = this.openEventSource.bind(this);
        this.onceEvent = this.onceEvent.bind(this);
    }
    openEventSource(url, message, win) {
        return __awaiter(this, void 0, void 0, function* () {
            const openedWindow = win
                ? win
                : yield window.open(url, "WaxPopup", "height=800,width=600");
            if (!openedWindow) {
                throw new Error("Unable to open a popup window");
            }
            if (typeof message === "undefined") {
                return openedWindow;
            }
            const postTransaction = (event) => __awaiter(this, void 0, void 0, function* () {
                if (event.data.type === "READY") {
                    // @ts-ignore
                    openedWindow.postMessage(message, this.waxSigningURL);
                }
            });
            const eventPromise = this.onceEvent(
            // @ts-ignore
            openedWindow, this.waxSigningURL, postTransaction);
            yield Promise.race([eventPromise, this.timeout()]).catch(err => {
                if (err.message !== "Timeout") {
                    throw err;
                }
                openedWindow.postMessage(message, this.waxSigningURL);
            });
            return openedWindow;
        });
    }
    onceEvent(source, origin, action) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                window.addEventListener("message", function onEvent(event) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Validate expected origin for event
                        if (event.origin !== origin) {
                            return;
                        }
                        // Validate expected source for event
                        if (event.source !== source) {
                            return;
                        }
                        if (typeof event.data !== "object") {
                            return;
                        }
                        try {
                            const result = yield action(event);
                            resolve(result);
                        }
                        catch (e) {
                            reject(e);
                        }
                        window.removeEventListener("message", onEvent, false);
                    });
                }, false);
            });
        });
    }
}
exports.WaxEventSource = WaxEventSource;

},{}],3:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const eosjs_1 = require("eosjs");
const WaxEventSource_1 = require("./WaxEventSource");
class WaxJS {
    constructor(rcpEndpoint, userAccount = null, pubKeys = null, tryAutoLogin = true, apiSigner = null, waxSigningURL = "https://all-access.wax.io", waxAutoSigningURL = "https://api-idm.wax.io/v1/accounts/auto-accept/") {
        this.apiSigner = apiSigner;
        this.waxSigningURL = waxSigningURL;
        this.waxAutoSigningURL = waxAutoSigningURL;
        this.waxEventSource = new WaxEventSource_1.WaxEventSource(waxSigningURL);
        this.rpc = new eosjs_1.JsonRpc(rcpEndpoint);
        if (userAccount && Array.isArray(pubKeys)) {
            // login from constructor
            const data = { userAccount, pubKeys, verified: true };
            this.receiveLogin({ data });
        }
        else {
            // try to auto-login via endpoint
            if (tryAutoLogin) {
                this.loginViaEndpoint();
            }
        }
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userAccount && Array.isArray(this.pubKeys)) {
                return this.userAccount;
            }
            else {
                // login via UI
                return this.loginViaWindow();
            }
        });
    }
    isAutoLoginAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userAccount && Array.isArray(this.pubKeys)) {
                return true;
            }
            else {
                // try to auto-login via endpoint
                try {
                    yield this.loginViaEndpoint();
                    return true;
                }
                catch (e) {
                    return false;
                }
            }
            return false;
        });
    }
    loginViaWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmationWindow = yield this.waxEventSource.openEventSource(this.waxSigningURL + "/cloud-wallet/login/");
            return this.waxEventSource.onceEvent(confirmationWindow, this.waxSigningURL, this.receiveLogin.bind(this));
        });
    }
    loginViaEndpoint() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(this.waxAutoSigningURL + "login", {
                credentials: "include",
                method: "get"
            });
            if (!response.ok) {
                throw new Error(`Login Endpoint Error ${response.status} ${response.statusText}`);
            }
            const data = yield response.json();
            if (data.processed && data.processed.except) {
                throw new Error(data);
            }
            return this.receiveLogin({ data });
        });
    }
    receiveLogin(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { verified, userAccount, pubKeys, whitelistedContracts, autoLogin } = event.data;
            if (!verified) {
                throw new Error("User declined to share their user account");
            }
            if (userAccount == null || pubKeys == null) {
                throw new Error("User does not have a blockchain account");
            }
            localStorage.setItem("autoLogin", autoLogin);
            this.whitelistedContracts = whitelistedContracts || [];
            this.userAccount = userAccount;
            this.pubKeys = pubKeys;
            const signer = {
                getAvailableKeys: () => __awaiter(this, void 0, void 0, function* () {
                    return [
                        ...this.pubKeys,
                        ...((this.apiSigner && (yield this.apiSigner.getAvailableKeys())) ||
                            [])
                    ];
                }),
                sign: (data) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        serializedTransaction: data.serializedTransaction,
                        signatures: [
                            ...(yield this.signing(data.serializedTransaction)),
                            ...((this.apiSigner &&
                                (yield this.apiSigner.sign(data)).signatures) ||
                                [])
                        ]
                    };
                })
            };
            // @ts-ignore
            this.api = new eosjs_1.Api({ rpc: this.rpc, signatureProvider: signer });
            const transact = this.api.transact.bind(this.api);
            const url = this.waxSigningURL + "/cloud-wallet/signing/";
            // We monkeypatch the transact method to overcome timeouts
            // firing the pop-up which some browsers enforce, such as Safari.
            // By pre-creating the pop-up window we will interact with,
            // we ensure that it is not going to be rejected due to a delayed
            // pop up that would otherwise occur post transaction creation
            this.api.transact = (transaction, namedParams) => __awaiter(this, void 0, void 0, function* () {
                if (!(yield this.canAutoSign(transaction))) {
                    this.signingWindow = yield window.open(url, "WaxPopup", "height=800,width=600");
                }
                return yield transact(transaction, namedParams);
            });
            return this.userAccount;
        });
    }
    canAutoSign(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const deserializedTransaction = transaction.actions
                ? transaction
                : yield this.api.deserializeTransactionWithActions(transaction);
            return !deserializedTransaction.actions.find((action) => {
                return !this.isWhitelisted(action);
            });
        });
    }
    isWhitelisted(action) {
        return !!this.whitelistedContracts.find((w) => {
            if (w.contract === action.account) {
                if (action.account === "eosio.token" && action.name === "transfer") {
                    return w.recipients.includes(action.data.to);
                }
                return true;
            }
            return false;
        });
    }
    signing(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.canAutoSign(transaction)) {
                return this.signViaEndpoint(transaction).catch(() => 
                // Attempt to recover by signing via the window method
                this.signViaWindow(undefined, transaction));
            }
            return this.signViaWindow(this.signingWindow, transaction);
        });
    }
    signViaEndpoint(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.waxAutoSigningURL + "signing", {
                    body: JSON.stringify({
                        transaction: Object.values(transaction)
                    }),
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                });
                if (!response.ok) {
                    throw new Error(`Signing Endpoint Error ${response.status} ${response.statusText}`);
                }
                const data = yield response.json();
                if (data.processed && data.processed.except) {
                    throw new Error(data);
                }
                return this.receiveSignatures({ data });
            }
            catch (e) {
                // clear the whitelist to make sure we don't repeatedly attempt blocked actions
                this.whitelistedContracts = [];
                throw e;
            }
        });
    }
    signViaWindow(window, transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const confirmationWindow = yield this.waxEventSource.openEventSource(this.waxSigningURL + "/cloud-wallet/signing/", { type: "TRANSACTION", transaction }, window);
            return this.waxEventSource.onceEvent(confirmationWindow, this.waxSigningURL, this.receiveSignatures.bind(this));
        });
    }
    receiveSignatures(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.data.type === "TX_SIGNED") {
                const { verified, signatures, whitelistedContracts } = event.data;
                if (!verified || signatures == null) {
                    throw new Error("User declined to sign the transaction");
                }
                this.whitelistedContracts = whitelistedContracts || [];
                return signatures;
            }
            else if (event.data.type !== "READY") {
                throw new Error(`Unexpected response received when attempting signing: ${JSON.stringify(event.data, undefined, 2)}`);
            }
            return [];
        });
    }
}
exports.WaxJS = WaxJS;

},{"./WaxEventSource":2,"eosjs":50}],4:[function(require,module,exports){
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

},{"../../Actions/Explorer":13,"../../Errors/ApiError":16}],5:[function(require,module,exports){
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

},{"../../Serialization":38,"./Collection":7,"./Schema":10,"./Template":11}],6:[function(require,module,exports){
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

},{"pure-cache":55}],7:[function(require,module,exports){
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

},{"../../Schema":24,"../../Serialization":38}],8:[function(require,module,exports){
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

},{"./Asset":5}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{"../../Schema":24,"./Collection":7}],11:[function(require,module,exports){
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

},{"../../Serialization":38,"./Schema":10}],12:[function(require,module,exports){
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
},{"../../Actions/Rpc":15,"../../Errors/RpcError":18,"./Asset":5,"./Cache":6,"./Collection":7,"./Offer":8,"./Queue":9,"./Schema":10,"./Template":11}],13:[function(require,module,exports){
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

},{"./Generator":14}],14:[function(require,module,exports){
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

},{"../Errors/SerializationError":20}],15:[function(require,module,exports){
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

},{"./Generator":14}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeserializationError extends Error {
}
exports.default = DeserializationError;

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SchemaError extends Error {
}
exports.default = SchemaError;

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SerializationError extends Error {
}
exports.default = SerializationError;

},{}],21:[function(require,module,exports){
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

},{"../Errors/SchemaError":19,"../Serialization/Binary":25}],22:[function(require,module,exports){
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

},{"..":39,"../Errors/SchemaError":19}],23:[function(require,module,exports){
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

},{"../Serialization/Binary":25}],24:[function(require,module,exports){
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

},{"../Errors/SchemaError":19,"./MappingSchema":21,"./ValueSchema":22,"./VectorSchema":23}],25:[function(require,module,exports){
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

},{"../Errors/DeserializationError":17,"../Errors/SerializationError":20,"./Coders/Base":26,"big-integer":41}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
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

},{"./FixedParser":31}],29:[function(require,module,exports){
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

},{"./VariableParser":36}],30:[function(require,module,exports){
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

},{"./FixedParser":31,"big-integer":41}],31:[function(require,module,exports){
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

},{"../../Errors/DeserializationError":17,"../../Errors/SerializationError":20}],32:[function(require,module,exports){
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

},{"../../../lib/float":40,"./FixedParser":31}],33:[function(require,module,exports){
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

},{"../Binary":25,"./VariableParser":36}],34:[function(require,module,exports){
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

},{"./VariableParser":36}],35:[function(require,module,exports){
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

},{"../../Errors/DeserializationError":17,"../../Errors/SerializationError":20,"../Binary":25,"big-integer":41}],36:[function(require,module,exports){
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

},{"../../Errors/DeserializationError":17,"../Binary":25}],37:[function(require,module,exports){
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

},{"./TypeParser/BooleanParser":28,"./TypeParser/ByteParser":29,"./TypeParser/FixedIntegerParser":30,"./TypeParser/FloatingParser":32,"./TypeParser/IPFSParser":33,"./TypeParser/StringParser":34,"./TypeParser/VariableIntegerParser":35}],38:[function(require,module,exports){
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

},{"../Schema/MappingSchema":21,"./Binary":25,"./State":27}],39:[function(require,module,exports){
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

},{"./API/Explorer":4,"./API/Rpc":12,"./Actions/Explorer":13,"./Actions/Generator":14,"./Actions/Rpc":15,"./Schema":24,"./Serialization":38,"./Serialization/Types":37}],40:[function(require,module,exports){
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

},{}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
/*! @license DOMPurify 2.3.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.3.0/LICENSE */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.DOMPurify = factory());
}(this, function () { 'use strict';

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var hasOwnProperty = Object.hasOwnProperty,
      setPrototypeOf = Object.setPrototypeOf,
      isFrozen = Object.isFrozen,
      getPrototypeOf = Object.getPrototypeOf,
      getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  var freeze = Object.freeze,
      seal = Object.seal,
      create = Object.create; // eslint-disable-line import/no-mutable-exports

  var _ref = typeof Reflect !== 'undefined' && Reflect,
      apply = _ref.apply,
      construct = _ref.construct;

  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }

  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }

  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }

  if (!construct) {
    construct = function construct(Func, args) {
      return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
    };
  }

  var arrayForEach = unapply(Array.prototype.forEach);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);

  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);

  var regExpTest = unapply(RegExp.prototype.test);

  var typeErrorCreate = unconstruct(TypeError);

  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return apply(func, thisArg, args);
    };
  }

  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return construct(func, args);
    };
  }

  /* Add properties to a lookup table */
  function addToSet(set, array) {
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }

    var l = array.length;
    while (l--) {
      var element = array[l];
      if (typeof element === 'string') {
        var lcElement = stringToLowerCase(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }

          element = lcElement;
        }
      }

      set[element] = true;
    }

    return set;
  }

  /* Shallow clone an object */
  function clone(object) {
    var newObject = create(null);

    var property = void 0;
    for (property in object) {
      if (apply(hasOwnProperty, object, [property])) {
        newObject[property] = object[property];
      }
    }

    return newObject;
  }

  /* IE10 doesn't support __lookupGetter__ so lets'
   * simulate it. It also automatically checks
   * if the prop is function or getter and behaves
   * accordingly. */
  function lookupGetter(object, prop) {
    while (object !== null) {
      var desc = getOwnPropertyDescriptor(object, prop);
      if (desc) {
        if (desc.get) {
          return unapply(desc.get);
        }

        if (typeof desc.value === 'function') {
          return unapply(desc.value);
        }
      }

      object = getPrototypeOf(object);
    }

    function fallbackValue(element) {
      console.warn('fallback value for', element);
      return null;
    }

    return fallbackValue;
  }

  var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);

  var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  // List of SVG elements that are disallowed by default.
  // We still need to know them so that we can do namespace
  // checks properly in case one wants to add them to
  // allow-list.
  var svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'fedropshadow', 'feimage', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);

  var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

  // Similarly to SVG, we want to know all MathML elements,
  // even those that we disallow by default.
  var mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);

  var text = freeze(['#text']);

  var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns', 'slot']);

  var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

  var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

  var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {Document} document The document object (to determine policy name suffix)
   * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported).
   */
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
    if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    var suffix = null;
    var ATTR_NAME = 'data-tt-policy-suffix';
    if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
      suffix = document.currentScript.getAttribute(ATTR_NAME);
    }

    var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML: function createHTML(html$$1) {
          return html$$1;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };

  function createDOMPurify() {
    var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

    var DOMPurify = function DOMPurify(root) {
      return createDOMPurify(root);
    };

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '2.3.0';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];

    if (!window || !window.document || window.document.nodeType !== 9) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;

      return DOMPurify;
    }

    var originalDocument = window.document;

    var document = window.document;
    var DocumentFragment = window.DocumentFragment,
        HTMLTemplateElement = window.HTMLTemplateElement,
        Node = window.Node,
        Element = window.Element,
        NodeFilter = window.NodeFilter,
        _window$NamedNodeMap = window.NamedNodeMap,
        NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
        Text = window.Text,
        Comment = window.Comment,
        DOMParser = window.DOMParser,
        trustedTypes = window.trustedTypes;


    var ElementPrototype = Element.prototype;

    var cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
    var getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
    var getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
    var getParentNode = lookupGetter(ElementPrototype, 'parentNode');

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.
    if (typeof HTMLTemplateElement === 'function') {
      var template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }

    var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
    var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML('') : '';

    var _document = document,
        implementation = _document.implementation,
        createNodeIterator = _document.createNodeIterator,
        createDocumentFragment = _document.createDocumentFragment,
        getElementsByTagName = _document.getElementsByTagName;
    var importNode = originalDocument.importNode;


    var documentMode = {};
    try {
      documentMode = clone(document).documentMode ? document.documentMode : {};
    } catch (_) {}

    var hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = typeof getParentNode === 'function' && implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

    var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
        ERB_EXPR$$1 = ERB_EXPR,
        DATA_ATTR$$1 = DATA_ATTR,
        ARIA_ATTR$$1 = ARIA_ATTR,
        IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
        ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
    var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */

    var ALLOWED_TAGS = null;
    var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

    /* Allowed attribute names */
    var ALLOWED_ATTR = null;
    var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    var FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    var FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    var ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    var ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    var ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    var SAFE_FOR_TEMPLATES = false;

    /* Decide if document with <html>... should be returned */
    var WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    var SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    var FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    var RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    var RETURN_DOM_FRAGMENT = false;

    /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
     * `Node` is imported into the current `Document`. If this flag is not enabled the
     * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
     * DOMPurify.
     *
     * This defaults to `true` starting DOMPurify 2.2.0. Note that setting it to `false`
     * might cause XSS from attacks hidden in closed shadowroots in case the browser
     * supports Declarative Shadow: DOM https://web.dev/declarative-shadow-dom/
     */
    var RETURN_DOM_IMPORT = true;

    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */
    var RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks? */
    var SANITIZE_DOM = true;

    /* Keep element content when removing element? */
    var KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    var IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    var USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    var DATA_URI_TAGS = null;
    var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    var URI_SAFE_ATTRIBUTES = null;
    var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

    var MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
    var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
    var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
    /* Document namespace */
    var NAMESPACE = HTML_NAMESPACE;
    var IS_EMPTY_INPUT = false;

    /* Keep a reference to config to pass to hooks */
    var CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    var formElement = document.createElement('form');

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    var _parseConfig = function _parseConfig(cfg) {
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
        cfg = {};
      }

      /* Shield configuration object from prototype pollution */
      cfg = clone(cfg);

      /* Set configuration parameters */
      ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
      URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
      FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
      FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
      USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT !== false; // Default true
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
      NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }

      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html);
          addToSet(ALLOWED_ATTR, html$1);
        }

        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl);
          addToSet(ALLOWED_ATTR, mathMl$1);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }

        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
      }

      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }

        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
      }

      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }

      CONFIG = cfg;
    };

    var MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);

    var HTML_INTEGRATION_POINTS = addToSet({}, ['foreignobject', 'desc', 'title', 'annotation-xml']);

    /* Keep track of all possible SVG and MathML tags
     * so that we can perform the namespace checks
     * correctly. */
    var ALL_SVG_TAGS = addToSet({}, svg);
    addToSet(ALL_SVG_TAGS, svgFilters);
    addToSet(ALL_SVG_TAGS, svgDisallowed);

    var ALL_MATHML_TAGS = addToSet({}, mathMl);
    addToSet(ALL_MATHML_TAGS, mathMlDisallowed);

    /**
     *
     *
     * @param  {Element} element a DOM element whose namespace is being checked
     * @returns {boolean} Return false if the element has a
     *  namespace that a spec-compliant parser would never
     *  return. Return true otherwise.
     */
    var _checkValidNamespace = function _checkValidNamespace(element) {
      var parent = getParentNode(element);

      // In JSDOM, if we're inside shadow DOM, then parentNode
      // can be null. We just simulate parent in this case.
      if (!parent || !parent.tagName) {
        parent = {
          namespaceURI: HTML_NAMESPACE,
          tagName: 'template'
        };
      }

      var tagName = stringToLowerCase(element.tagName);
      var parentTagName = stringToLowerCase(parent.tagName);

      if (element.namespaceURI === SVG_NAMESPACE) {
        // The only way to switch from HTML namespace to SVG
        // is via <svg>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'svg';
        }

        // The only way to switch from MathML to SVG is via
        // svg if parent is either <annotation-xml> or MathML
        // text integration points.
        if (parent.namespaceURI === MATHML_NAMESPACE) {
          return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
        }

        // We only allow elements that are defined in SVG
        // spec. All others are disallowed in SVG namespace.
        return Boolean(ALL_SVG_TAGS[tagName]);
      }

      if (element.namespaceURI === MATHML_NAMESPACE) {
        // The only way to switch from HTML namespace to MathML
        // is via <math>. If it happens via any other tag, then
        // it should be killed.
        if (parent.namespaceURI === HTML_NAMESPACE) {
          return tagName === 'math';
        }

        // The only way to switch from SVG to MathML is via
        // <math> and HTML integration points
        if (parent.namespaceURI === SVG_NAMESPACE) {
          return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
        }

        // We only allow elements that are defined in MathML
        // spec. All others are disallowed in MathML namespace.
        return Boolean(ALL_MATHML_TAGS[tagName]);
      }

      if (element.namespaceURI === HTML_NAMESPACE) {
        // The only way to switch from SVG to HTML is via
        // HTML integration points, and from MathML to HTML
        // is via MathML text integration points
        if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
          return false;
        }

        // Certain elements are allowed in both SVG and HTML
        // namespace. We need to specify them explicitly
        // so that they don't get erronously deleted from
        // HTML namespace.
        var commonSvgAndHTMLElements = addToSet({}, ['title', 'style', 'font', 'a', 'script']);

        // We disallow tags that are specific for MathML
        // or SVG and should never appear in HTML namespace
        return !ALL_MATHML_TAGS[tagName] && (commonSvgAndHTMLElements[tagName] || !ALL_SVG_TAGS[tagName]);
      }

      // The code should never reach this place (this means
      // that the element somehow got namespace that is not
      // HTML, SVG or MathML). Return false just in case.
      return false;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    var _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, { element: node });
      try {
        // eslint-disable-next-line unicorn/prefer-dom-node-remove
        node.parentNode.removeChild(node);
      } catch (_) {
        try {
          node.outerHTML = emptyHTML;
        } catch (_) {
          node.remove();
        }
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    var _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }

      node.removeAttribute(name);

      // We void attribute values for unremovable "is"" attributes
      if (name === 'is' && !ALLOWED_ATTR[name]) {
        if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
          try {
            _forceRemove(node);
          } catch (_) {}
        } else {
          try {
            node.setAttribute(name, '');
          } catch (_) {}
        }
      }
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    var _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      var doc = void 0;
      var leadingWhitespace = void 0;

      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        var matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }

      var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /*
       * Use the DOMParser API by default, fallback later if needs be
       * DOMParser not work for svg when has multiple root element.
       */
      if (NAMESPACE === HTML_NAMESPACE) {
        try {
          doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
        } catch (_) {}
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createDocument(NAMESPACE, 'template', null);
        try {
          doc.documentElement.innerHTML = IS_EMPTY_INPUT ? '' : dirtyPayload;
        } catch (_) {
          // Syntax error if dirtyPayload is invalid xml
        }
      }

      var body = doc.body || doc.documentElement;

      if (dirty && leadingWhitespace) {
        body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      if (NAMESPACE === HTML_NAMESPACE) {
        return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
      }

      return WHOLE_DOCUMENT ? doc.documentElement : body;
    };

    /**
     * _createIterator
     *
     * @param  {Document} root document/fragment to create iterator for
     * @return {Iterator} iterator instance
     */
    var _createIterator = function _createIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, null, false);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    var _isClobbered = function _isClobbered(elm) {
      if (elm instanceof Text || elm instanceof Comment) {
        return false;
      }

      if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string' || typeof elm.insertBefore !== 'function') {
        return true;
      }

      return false;
    };

    /**
     * _isNode
     *
     * @param  {Node} obj object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    var _isNode = function _isNode(object) {
      return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    var _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }

      arrayForEach(hooks[entryPoint], function (hook) {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    var _sanitizeElements = function _sanitizeElements(currentNode) {
      var content = void 0;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Check if tagname contains Unicode */
      if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      var tagName = stringToLowerCase(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName: tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Detect mXSS attempts abusing namespace confusion */
      if (!_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Keep content except for bad-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
          var parentNode = getParentNode(currentNode) || currentNode.parentNode;
          var childNodes = getChildNodes(currentNode) || currentNode.childNodes;

          if (childNodes && parentNode) {
            var childCount = childNodes.length;

            for (var i = childCount - 1; i >= 0; --i) {
              parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
            }
          }
        }

        _forceRemove(currentNode);
        return true;
      }

      /* Check whether element has a valid namespace */
      if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
        /* Get the element's text content */
        content = currentNode.textContent;
        content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
        content = stringReplace(content, ERB_EXPR$$1, ' ');
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);

      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        return false;

        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
        return false;
      }

      return true;
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      var attr = void 0;
      var value = void 0;
      var lcName = void 0;
      var l = void 0;
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);

      var attributes = currentNode.attributes;

      /* Check if we have attributes; if not we might have a text node */

      if (!attributes) {
        return;
      }

      var hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        attr = attributes[l];
        var _attr = attr,
            name = _attr.name,
            namespaceURI = _attr.namespaceURI;

        value = stringTrim(attr.value);
        lcName = stringToLowerCase(name);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;
        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        _removeAttribute(name, currentNode);

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
          value = stringReplace(value, ERB_EXPR$$1, ' ');
        }

        /* Is `value` valid for this attribute? */
        var lcTag = currentNode.nodeName.toLowerCase();
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }

          arrayPop(DOMPurify.removed);
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      var shadowNode = void 0;
      var shadowIterator = _createIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);

      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);

        /* Sanitize tags and elements */
        if (_sanitizeElements(shadowNode)) {
          continue;
        }

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(shadowNode);
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty, cfg) {
      var body = void 0;
      var importedNode = void 0;
      var currentNode = void 0;
      var oldNode = void 0;
      var returnNode = void 0;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      IS_EMPTY_INPUT = !dirty;
      if (IS_EMPTY_INPUT) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        // eslint-disable-next-line no-negated-condition
        if (typeof dirty.toString !== 'function') {
          throw typeErrorCreate('toString is not a function');
        } else {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        }
      }

      /* Check we can run. Otherwise fall back or ignore */
      if (!DOMPurify.isSupported) {
        if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
          if (typeof dirty === 'string') {
            return window.toStaticHTML(dirty);
          }

          if (_isNode(dirty)) {
            return window.toStaticHTML(dirty.outerHTML);
          }
        }

        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }

      if (IN_PLACE) ; else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!---->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : emptyHTML;
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Fix IE's strange behavior with manipulated textNodes #89 */
        if (currentNode.nodeType === 3 && currentNode === oldNode) {
          continue;
        }

        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);

        oldNode = currentNode;
      }

      oldNode = null;

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);

          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-dom-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }

        if (RETURN_DOM_IMPORT) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }

        return returnNode;
      }

      var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
        serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
      }

      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function (cfg) {
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }

      var lcTag = stringToLowerCase(tag);
      var lcName = stringToLowerCase(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }

      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };

    return DOMPurify;
  }

  var purify = createDOMPurify();

  return purify;

}));


},{}],43:[function(require,module,exports){
"use strict";
// copyright defined in eosjs/LICENSE.txt
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
/**
 * @module API
 */
// copyright defined in eosjs/LICENSE.txt
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ser = require("./eosjs-serialize");
var abiAbi = require('../src/abi.abi.json');
var transactionAbi = require('../src/transaction.abi.json');
var Api = /** @class */ (function () {
    /**
     * @param args
     *    * `rpc`: Issues RPC calls
     *    * `authorityProvider`: Get public keys needed to meet authorities in a transaction
     *    * `abiProvider`: Supplies ABIs in raw form (binary)
     *    * `signatureProvider`: Signs transactions
     *    * `chainId`: Identifies chain
     *    * `textEncoder`: `TextEncoder` instance to use. Pass in `null` if running in a browser
     *    * `textDecoder`: `TextDecoder` instance to use. Pass in `null` if running in a browser
     */
    function Api(args) {
        /** Holds information needed to serialize contract actions */
        this.contracts = new Map();
        /** Fetched abis */
        this.cachedAbis = new Map();
        this.rpc = args.rpc;
        this.authorityProvider = args.authorityProvider || args.rpc;
        this.abiProvider = args.abiProvider || args.rpc;
        this.signatureProvider = args.signatureProvider;
        this.chainId = args.chainId;
        this.textEncoder = args.textEncoder;
        this.textDecoder = args.textDecoder;
        this.abiTypes = ser.getTypesFromAbi(ser.createInitialTypes(), abiAbi);
        this.transactionTypes = ser.getTypesFromAbi(ser.createInitialTypes(), transactionAbi);
    }
    /** Decodes an abi as Uint8Array into json. */
    Api.prototype.rawAbiToJson = function (rawAbi) {
        var buffer = new ser.SerialBuffer({
            textEncoder: this.textEncoder,
            textDecoder: this.textDecoder,
            array: rawAbi,
        });
        if (!ser.supportedAbiVersion(buffer.getString())) {
            throw new Error('Unsupported abi version');
        }
        buffer.restartRead();
        return this.abiTypes.get('abi_def').deserialize(buffer);
    };
    /** Get abi in both binary and structured forms. Fetch when needed. */
    Api.prototype.getCachedAbi = function (accountName, reload) {
        if (reload === void 0) { reload = false; }
        return __awaiter(this, void 0, void 0, function () {
            var cachedAbi, rawAbi, abi, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!reload && this.cachedAbis.get(accountName)) {
                            return [2 /*return*/, this.cachedAbis.get(accountName)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.abiProvider.getRawAbi(accountName)];
                    case 2:
                        rawAbi = (_a.sent()).abi;
                        abi = this.rawAbiToJson(rawAbi);
                        cachedAbi = { rawAbi: rawAbi, abi: abi };
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        e_1.message = "fetching abi for " + accountName + ": " + e_1.message;
                        throw e_1;
                    case 4:
                        if (!cachedAbi) {
                            throw new Error("Missing abi for " + accountName);
                        }
                        this.cachedAbis.set(accountName, cachedAbi);
                        return [2 /*return*/, cachedAbi];
                }
            });
        });
    };
    /** Get abi in structured form. Fetch when needed. */
    Api.prototype.getAbi = function (accountName, reload) {
        if (reload === void 0) { reload = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCachedAbi(accountName, reload)];
                    case 1: return [2 /*return*/, (_a.sent()).abi];
                }
            });
        });
    };
    /** Get abis needed by a transaction */
    Api.prototype.getTransactionAbis = function (transaction, reload) {
        if (reload === void 0) { reload = false; }
        return __awaiter(this, void 0, void 0, function () {
            var accounts, uniqueAccounts, actionPromises;
            var _this = this;
            return __generator(this, function (_a) {
                accounts = transaction.actions.map(function (action) { return action.account; });
                uniqueAccounts = new Set(accounts);
                actionPromises = __spread(uniqueAccounts).map(function (account) { return __awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = {
                                    accountName: account
                                };
                                return [4 /*yield*/, this.getCachedAbi(account, reload)];
                            case 1: return [2 /*return*/, (_a.abi = (_b.sent()).rawAbi,
                                    _a)];
                        }
                    });
                }); });
                return [2 /*return*/, Promise.all(actionPromises)];
            });
        });
    };
    /** Get data needed to serialize actions in a contract */
    Api.prototype.getContract = function (accountName, reload) {
        if (reload === void 0) { reload = false; }
        return __awaiter(this, void 0, void 0, function () {
            var e_2, _a, abi, types, actions, _b, _c, _d, name_1, type, result;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!reload && this.contracts.get(accountName)) {
                            return [2 /*return*/, this.contracts.get(accountName)];
                        }
                        return [4 /*yield*/, this.getAbi(accountName, reload)];
                    case 1:
                        abi = _e.sent();
                        types = ser.getTypesFromAbi(ser.createInitialTypes(), abi);
                        actions = new Map();
                        try {
                            for (_b = __values(abi.actions), _c = _b.next(); !_c.done; _c = _b.next()) {
                                _d = _c.value, name_1 = _d.name, type = _d.type;
                                actions.set(name_1, ser.getType(types, type));
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        result = { types: types, actions: actions };
                        this.contracts.set(accountName, result);
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /** Convert `value` to binary form. `type` must be a built-in abi type or in `transaction.abi.json`. */
    Api.prototype.serialize = function (buffer, type, value) {
        this.transactionTypes.get(type).serialize(buffer, value);
    };
    /** Convert data in `buffer` to structured form. `type` must be a built-in abi type or in `transaction.abi.json`. */
    Api.prototype.deserialize = function (buffer, type) {
        return this.transactionTypes.get(type).deserialize(buffer);
    };
    /** Convert a transaction to binary */
    Api.prototype.serializeTransaction = function (transaction) {
        var buffer = new ser.SerialBuffer({ textEncoder: this.textEncoder, textDecoder: this.textDecoder });
        this.serialize(buffer, 'transaction', __assign({ max_net_usage_words: 0, max_cpu_usage_ms: 0, delay_sec: 0, context_free_actions: [], actions: [], transaction_extensions: [] }, transaction));
        return buffer.asUint8Array();
    };
    /** Convert a transaction from binary. Leaves actions in hex. */
    Api.prototype.deserializeTransaction = function (transaction) {
        var buffer = new ser.SerialBuffer({ textEncoder: this.textEncoder, textDecoder: this.textDecoder });
        buffer.pushArray(transaction);
        return this.deserialize(buffer, 'transaction');
    };
    /** Convert actions to hex */
    Api.prototype.serializeActions = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(actions.map(function (_a) {
                            var account = _a.account, name = _a.name, authorization = _a.authorization, data = _a.data;
                            return __awaiter(_this, void 0, void 0, function () {
                                var contract;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.getContract(account)];
                                        case 1:
                                            contract = _b.sent();
                                            return [2 /*return*/, ser.serializeAction(contract, account, name, authorization, data, this.textEncoder, this.textDecoder)];
                                    }
                                });
                            });
                        }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Convert actions from hex */
    Api.prototype.deserializeActions = function (actions) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(actions.map(function (_a) {
                            var account = _a.account, name = _a.name, authorization = _a.authorization, data = _a.data;
                            return __awaiter(_this, void 0, void 0, function () {
                                var contract;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.getContract(account)];
                                        case 1:
                                            contract = _b.sent();
                                            return [2 /*return*/, ser.deserializeAction(contract, account, name, authorization, data, this.textEncoder, this.textDecoder)];
                                    }
                                });
                            });
                        }))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Convert a transaction from binary. Also deserializes actions. */
    Api.prototype.deserializeTransactionWithActions = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var deserializedTransaction, deserializedActions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof transaction === 'string') {
                            transaction = ser.hexToUint8Array(transaction);
                        }
                        deserializedTransaction = this.deserializeTransaction(transaction);
                        return [4 /*yield*/, this.deserializeActions(deserializedTransaction.actions)];
                    case 1:
                        deserializedActions = _a.sent();
                        return [2 /*return*/, __assign({}, deserializedTransaction, { actions: deserializedActions })];
                }
            });
        });
    };
    /**
     * Create and optionally broadcast a transaction.
     *
     * Named Parameters:
     *    * `broadcast`: broadcast this transaction?
     *    * `sign`: sign this transaction?
     *    * If both `blocksBehind` and `expireSeconds` are present,
     *      then fetch the block which is `blocksBehind` behind head block,
     *      use it as a reference for TAPoS, and expire the transaction `expireSeconds` after that block's time.
     * @returns node response if `broadcast`, `{signatures, serializedTransaction}` if `!broadcast`
     */
    Api.prototype.transact = function (transaction, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.broadcast, broadcast = _c === void 0 ? true : _c, _d = _b.sign, sign = _d === void 0 ? true : _d, blocksBehind = _b.blocksBehind, expireSeconds = _b.expireSeconds;
        return __awaiter(this, void 0, void 0, function () {
            var info, refBlock, abis, _e, _f, serializedTransaction, pushTransactionArgs, availableKeys, requiredKeys;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!!this.chainId) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rpc.get_info()];
                    case 1:
                        info = _g.sent();
                        this.chainId = info.chain_id;
                        _g.label = 2;
                    case 2:
                        if (!(typeof blocksBehind === 'number' && expireSeconds)) return [3 /*break*/, 6];
                        if (!!info) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.rpc.get_info()];
                    case 3:
                        info = _g.sent();
                        _g.label = 4;
                    case 4: return [4 /*yield*/, this.rpc.get_block(info.head_block_num - blocksBehind)];
                    case 5:
                        refBlock = _g.sent();
                        transaction = __assign({}, ser.transactionHeader(refBlock, expireSeconds), transaction);
                        _g.label = 6;
                    case 6:
                        if (!this.hasRequiredTaposFields(transaction)) {
                            throw new Error('Required configuration or TAPOS fields are not present');
                        }
                        return [4 /*yield*/, this.getTransactionAbis(transaction)];
                    case 7:
                        abis = _g.sent();
                        _e = [{}, transaction];
                        _f = {};
                        return [4 /*yield*/, this.serializeActions(transaction.actions)];
                    case 8:
                        transaction = __assign.apply(void 0, _e.concat([(_f.actions = _g.sent(), _f)]));
                        serializedTransaction = this.serializeTransaction(transaction);
                        pushTransactionArgs = { serializedTransaction: serializedTransaction, signatures: [] };
                        if (!sign) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.signatureProvider.getAvailableKeys()];
                    case 9:
                        availableKeys = _g.sent();
                        return [4 /*yield*/, this.authorityProvider.getRequiredKeys({ transaction: transaction, availableKeys: availableKeys })];
                    case 10:
                        requiredKeys = _g.sent();
                        return [4 /*yield*/, this.signatureProvider.sign({
                                chainId: this.chainId,
                                requiredKeys: requiredKeys,
                                serializedTransaction: serializedTransaction,
                                abis: abis,
                            })];
                    case 11:
                        pushTransactionArgs = _g.sent();
                        _g.label = 12;
                    case 12:
                        if (broadcast) {
                            return [2 /*return*/, this.pushSignedTransaction(pushTransactionArgs)];
                        }
                        return [2 /*return*/, pushTransactionArgs];
                }
            });
        });
    };
    /** Broadcast a signed transaction */
    Api.prototype.pushSignedTransaction = function (_a) {
        var signatures = _a.signatures, serializedTransaction = _a.serializedTransaction;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                return [2 /*return*/, this.rpc.push_transaction({
                        signatures: signatures,
                        serializedTransaction: serializedTransaction,
                    })];
            });
        });
    };
    // eventually break out into TransactionValidator class
    Api.prototype.hasRequiredTaposFields = function (_a) {
        var expiration = _a.expiration, ref_block_num = _a.ref_block_num, ref_block_prefix = _a.ref_block_prefix, transaction = __rest(_a, ["expiration", "ref_block_num", "ref_block_prefix"]);
        return !!(expiration && ref_block_num && ref_block_prefix);
    };
    return Api;
}()); // Api
exports.Api = Api;

},{"../src/abi.abi.json":52,"../src/transaction.abi.json":53,"./eosjs-serialize":49}],45:[function(require,module,exports){
(function (global){(function (){
"use strict";
/**
 * @module JSON-RPC
 */
// copyright defined in eosjs/LICENSE.txt
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eosjs_numeric_1 = require("./eosjs-numeric");
var eosjs_rpcerror_1 = require("./eosjs-rpcerror");
function arrayToHex(data) {
    var e_1, _a;
    var result = '';
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var x = data_1_1.value;
            result += ('00' + x.toString(16)).slice(-2);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}
/** Make RPC calls */
var JsonRpc = /** @class */ (function () {
    /**
     * @param args
     *    * `fetch`:
     *    * browsers: leave `null` or `undefined`
     *    * node: provide an implementation
     */
    function JsonRpc(endpoint, args) {
        if (args === void 0) { args = {}; }
        this.endpoint = endpoint;
        if (args.fetch) {
            this.fetchBuiltin = args.fetch;
        }
        else {
            this.fetchBuiltin = global.fetch;
        }
    }
    /** Post `body` to `endpoint + path`. Throws detailed error information in `RpcError` when available. */
    JsonRpc.prototype.fetch = function (path, body) {
        return __awaiter(this, void 0, void 0, function () {
            var response, json, f, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        f = this.fetchBuiltin;
                        return [4 /*yield*/, f(this.endpoint + path, {
                                body: JSON.stringify(body),
                                method: 'POST',
                            })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        if (json.processed && json.processed.except) {
                            throw new eosjs_rpcerror_1.RpcError(json);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        e_2.isFetchError = true;
                        throw e_2;
                    case 4:
                        if (!response.ok) {
                            throw new eosjs_rpcerror_1.RpcError(json);
                        }
                        return [2 /*return*/, json];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_abi` */
    JsonRpc.prototype.get_abi = function (accountName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_abi', { account_name: accountName })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_account` */
    JsonRpc.prototype.get_account = function (accountName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_account', { account_name: accountName })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_block_header_state` */
    JsonRpc.prototype.get_block_header_state = function (blockNumOrId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_block_header_state', { block_num_or_id: blockNumOrId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_block` */
    JsonRpc.prototype.get_block = function (blockNumOrId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_block', { block_num_or_id: blockNumOrId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_code` */
    JsonRpc.prototype.get_code = function (accountName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_code', { account_name: accountName })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_currency_balance` */
    JsonRpc.prototype.get_currency_balance = function (code, account, symbol) {
        if (symbol === void 0) { symbol = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_currency_balance', { code: code, account: account, symbol: symbol })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_currency_stats` */
    JsonRpc.prototype.get_currency_stats = function (code, symbol) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_currency_stats', { code: code, symbol: symbol })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_info` */
    JsonRpc.prototype.get_info = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_info', {})];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_producer_schedule` */
    JsonRpc.prototype.get_producer_schedule = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_producer_schedule', {})];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_producers` */
    JsonRpc.prototype.get_producers = function (json, lowerBound, limit) {
        if (json === void 0) { json = true; }
        if (lowerBound === void 0) { lowerBound = ''; }
        if (limit === void 0) { limit = 50; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_producers', { json: json, lower_bound: lowerBound, limit: limit })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_raw_code_and_abi` */
    JsonRpc.prototype.get_raw_code_and_abi = function (accountName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_raw_code_and_abi', { account_name: accountName })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** calls `/v1/chain/get_raw_code_and_abi` and pulls out unneeded raw wasm code */
    // TODO: use `/v1/chain/get_raw_abi` directly when it becomes available
    JsonRpc.prototype.getRawAbi = function (accountName) {
        return __awaiter(this, void 0, void 0, function () {
            var rawCodeAndAbi, abi;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get_raw_code_and_abi(accountName)];
                    case 1:
                        rawCodeAndAbi = _a.sent();
                        abi = eosjs_numeric_1.base64ToBinary(rawCodeAndAbi.abi);
                        return [2 /*return*/, { accountName: rawCodeAndAbi.account_name, abi: abi }];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_table_rows` */
    JsonRpc.prototype.get_table_rows = function (_a) {
        var _b = _a.json, json = _b === void 0 ? true : _b, code = _a.code, scope = _a.scope, table = _a.table, _c = _a.table_key, table_key = _c === void 0 ? '' : _c, _d = _a.lower_bound, lower_bound = _d === void 0 ? '' : _d, _e = _a.upper_bound, upper_bound = _e === void 0 ? '' : _e, _f = _a.index_position, index_position = _f === void 0 ? 1 : _f, _g = _a.key_type, key_type = _g === void 0 ? '' : _g, _h = _a.limit, limit = _h === void 0 ? 10 : _h, _j = _a.reverse, reverse = _j === void 0 ? false : _j, _k = _a.show_payer, show_payer = _k === void 0 ? false : _k;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_table_rows', {
                            json: json,
                            code: code,
                            scope: scope,
                            table: table,
                            table_key: table_key,
                            lower_bound: lower_bound,
                            upper_bound: upper_bound,
                            index_position: index_position,
                            key_type: key_type,
                            limit: limit,
                            reverse: reverse,
                            show_payer: show_payer,
                        })];
                    case 1: return [2 /*return*/, _l.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/chain/get_table_by_scope` */
    JsonRpc.prototype.get_table_by_scope = function (_a) {
        var code = _a.code, table = _a.table, _b = _a.lower_bound, lower_bound = _b === void 0 ? '' : _b, _c = _a.upper_bound, upper_bound = _c === void 0 ? '' : _c, _d = _a.limit, limit = _d === void 0 ? 10 : _d;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/get_table_by_scope', {
                            code: code,
                            table: table,
                            lower_bound: lower_bound,
                            upper_bound: upper_bound,
                            limit: limit,
                        })];
                    case 1: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    /** Get subset of `availableKeys` needed to meet authorities in `transaction`. Implements `AuthorityProvider` */
    JsonRpc.prototype.getRequiredKeys = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = eosjs_numeric_1.convertLegacyPublicKeys;
                        return [4 /*yield*/, this.fetch('/v1/chain/get_required_keys', {
                                transaction: args.transaction,
                                available_keys: args.availableKeys,
                            })];
                    case 1: return [2 /*return*/, _a.apply(void 0, [(_b.sent()).required_keys])];
                }
            });
        });
    };
    /** Push a serialized transaction */
    JsonRpc.prototype.push_transaction = function (_a) {
        var signatures = _a.signatures, serializedTransaction = _a.serializedTransaction;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/chain/push_transaction', {
                            signatures: signatures,
                            compression: 0,
                            packed_context_free_data: '',
                            packed_trx: arrayToHex(serializedTransaction),
                        })];
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/db_size/get` */
    JsonRpc.prototype.db_size_get = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, this.fetch('/v1/db_size/get', {})];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); });
    };
    /** Raw call to `/v1/history/get_actions` */
    JsonRpc.prototype.history_get_actions = function (accountName, pos, offset) {
        if (pos === void 0) { pos = null; }
        if (offset === void 0) { offset = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/history/get_actions', { account_name: accountName, pos: pos, offset: offset })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/history/get_transaction` */
    JsonRpc.prototype.history_get_transaction = function (id, blockNumHint) {
        if (blockNumHint === void 0) { blockNumHint = null; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/history/get_transaction', { id: id, block_num_hint: blockNumHint })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/history/get_key_accounts` */
    JsonRpc.prototype.history_get_key_accounts = function (publicKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/history/get_key_accounts', { public_key: publicKey })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Raw call to `/v1/history/get_controlled_accounts` */
    JsonRpc.prototype.history_get_controlled_accounts = function (controllingAccount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.fetch('/v1/history/get_controlled_accounts', { controlling_account: controllingAccount })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return JsonRpc;
}()); // JsonRpc
exports.JsonRpc = JsonRpc;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./eosjs-numeric":46,"./eosjs-rpcerror":48}],46:[function(require,module,exports){
"use strict";
/**
 * @module Numeric
 */
// copyright defined in eosjs/LICENSE.txt
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ripemd160 = require('./ripemd').RIPEMD160.hash;
var base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
var base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function create_base58_map() {
    var base58M = Array(256).fill(-1);
    for (var i = 0; i < base58Chars.length; ++i) {
        base58M[base58Chars.charCodeAt(i)] = i;
    }
    return base58M;
}
var base58Map = create_base58_map();
function create_base64_map() {
    var base64M = Array(256).fill(-1);
    for (var i = 0; i < base64Chars.length; ++i) {
        base64M[base64Chars.charCodeAt(i)] = i;
    }
    base64M['='.charCodeAt(0)] = 0;
    return base64M;
}
var base64Map = create_base64_map();
/** Is `bignum` a negative number? */
function isNegative(bignum) {
    return (bignum[bignum.length - 1] & 0x80) !== 0;
}
exports.isNegative = isNegative;
/** Negate `bignum` */
function negate(bignum) {
    var carry = 1;
    for (var i = 0; i < bignum.length; ++i) {
        var x = (~bignum[i] & 0xff) + carry;
        bignum[i] = x;
        carry = x >> 8;
    }
}
exports.negate = negate;
/**
 * Convert an unsigned decimal number in `s` to a bignum
 * @param size bignum size (bytes)
 */
function decimalToBinary(size, s) {
    var result = new Uint8Array(size);
    for (var i = 0; i < s.length; ++i) {
        var srcDigit = s.charCodeAt(i);
        if (srcDigit < '0'.charCodeAt(0) || srcDigit > '9'.charCodeAt(0)) {
            throw new Error('invalid number');
        }
        var carry = srcDigit - '0'.charCodeAt(0);
        for (var j = 0; j < size; ++j) {
            var x = result[j] * 10 + carry;
            result[j] = x;
            carry = x >> 8;
        }
        if (carry) {
            throw new Error('number is out of range');
        }
    }
    return result;
}
exports.decimalToBinary = decimalToBinary;
/**
 * Convert a signed decimal number in `s` to a bignum
 * @param size bignum size (bytes)
 */
function signedDecimalToBinary(size, s) {
    var negative = s[0] === '-';
    if (negative) {
        s = s.substr(1);
    }
    var result = decimalToBinary(size, s);
    if (negative) {
        negate(result);
        if (!isNegative(result)) {
            throw new Error('number is out of range');
        }
    }
    else if (isNegative(result)) {
        throw new Error('number is out of range');
    }
    return result;
}
exports.signedDecimalToBinary = signedDecimalToBinary;
/**
 * Convert `bignum` to an unsigned decimal number
 * @param minDigits 0-pad result to this many digits
 */
function binaryToDecimal(bignum, minDigits) {
    if (minDigits === void 0) { minDigits = 1; }
    var result = Array(minDigits).fill('0'.charCodeAt(0));
    for (var i = bignum.length - 1; i >= 0; --i) {
        var carry = bignum[i];
        for (var j = 0; j < result.length; ++j) {
            var x = ((result[j] - '0'.charCodeAt(0)) << 8) + carry;
            result[j] = '0'.charCodeAt(0) + x % 10;
            carry = (x / 10) | 0;
        }
        while (carry) {
            result.push('0'.charCodeAt(0) + carry % 10);
            carry = (carry / 10) | 0;
        }
    }
    result.reverse();
    return String.fromCharCode.apply(String, __spread(result));
}
exports.binaryToDecimal = binaryToDecimal;
/**
 * Convert `bignum` to a signed decimal number
 * @param minDigits 0-pad result to this many digits
 */
function signedBinaryToDecimal(bignum, minDigits) {
    if (minDigits === void 0) { minDigits = 1; }
    if (isNegative(bignum)) {
        var x = bignum.slice();
        negate(x);
        return '-' + binaryToDecimal(x, minDigits);
    }
    return binaryToDecimal(bignum, minDigits);
}
exports.signedBinaryToDecimal = signedBinaryToDecimal;
/**
 * Convert an unsigned base-58 number in `s` to a bignum
 * @param size bignum size (bytes)
 */
function base58ToBinary(size, s) {
    var result = new Uint8Array(size);
    for (var i = 0; i < s.length; ++i) {
        var carry = base58Map[s.charCodeAt(i)];
        if (carry < 0) {
            throw new Error('invalid base-58 value');
        }
        for (var j = 0; j < size; ++j) {
            var x = result[j] * 58 + carry;
            result[j] = x;
            carry = x >> 8;
        }
        if (carry) {
            throw new Error('base-58 value is out of range');
        }
    }
    result.reverse();
    return result;
}
exports.base58ToBinary = base58ToBinary;
/**
 * Convert `bignum` to a base-58 number
 * @param minDigits 0-pad result to this many digits
 */
function binaryToBase58(bignum, minDigits) {
    if (minDigits === void 0) { minDigits = 1; }
    var e_1, _a, e_2, _b;
    var result = [];
    try {
        for (var bignum_1 = __values(bignum), bignum_1_1 = bignum_1.next(); !bignum_1_1.done; bignum_1_1 = bignum_1.next()) {
            var byte = bignum_1_1.value;
            var carry = byte;
            for (var j = 0; j < result.length; ++j) {
                var x = (base58Map[result[j]] << 8) + carry;
                result[j] = base58Chars.charCodeAt(x % 58);
                carry = (x / 58) | 0;
            }
            while (carry) {
                result.push(base58Chars.charCodeAt(carry % 58));
                carry = (carry / 58) | 0;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (bignum_1_1 && !bignum_1_1.done && (_a = bignum_1.return)) _a.call(bignum_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var bignum_2 = __values(bignum), bignum_2_1 = bignum_2.next(); !bignum_2_1.done; bignum_2_1 = bignum_2.next()) {
            var byte = bignum_2_1.value;
            if (byte) {
                break;
            }
            else {
                result.push('1'.charCodeAt(0));
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (bignum_2_1 && !bignum_2_1.done && (_b = bignum_2.return)) _b.call(bignum_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    result.reverse();
    return String.fromCharCode.apply(String, __spread(result));
}
exports.binaryToBase58 = binaryToBase58;
/** Convert an unsigned base-64 number in `s` to a bignum */
function base64ToBinary(s) {
    var len = s.length;
    if ((len & 3) === 1 && s[len - 1] === '=') {
        len -= 1;
    } // fc appends an extra '='
    if ((len & 3) !== 0) {
        throw new Error('base-64 value is not padded correctly');
    }
    var groups = len >> 2;
    var bytes = groups * 3;
    if (len > 0 && s[len - 1] === '=') {
        if (s[len - 2] === '=') {
            bytes -= 2;
        }
        else {
            bytes -= 1;
        }
    }
    var result = new Uint8Array(bytes);
    for (var group = 0; group < groups; ++group) {
        var digit0 = base64Map[s.charCodeAt(group * 4 + 0)];
        var digit1 = base64Map[s.charCodeAt(group * 4 + 1)];
        var digit2 = base64Map[s.charCodeAt(group * 4 + 2)];
        var digit3 = base64Map[s.charCodeAt(group * 4 + 3)];
        result[group * 3 + 0] = (digit0 << 2) | (digit1 >> 4);
        if (group * 3 + 1 < bytes) {
            result[group * 3 + 1] = ((digit1 & 15) << 4) | (digit2 >> 2);
        }
        if (group * 3 + 2 < bytes) {
            result[group * 3 + 2] = ((digit2 & 3) << 6) | digit3;
        }
    }
    return result;
}
exports.base64ToBinary = base64ToBinary;
/** Key types this library supports */
var KeyType;
(function (KeyType) {
    KeyType[KeyType["k1"] = 0] = "k1";
    KeyType[KeyType["r1"] = 1] = "r1";
})(KeyType = exports.KeyType || (exports.KeyType = {}));
/** Public key data size, excluding type field */
exports.publicKeyDataSize = 33;
/** Private key data size, excluding type field */
exports.privateKeyDataSize = 32;
/** Signature data size, excluding type field */
exports.signatureDataSize = 65;
function digestSuffixRipemd160(data, suffix) {
    var d = new Uint8Array(data.length + suffix.length);
    for (var i = 0; i < data.length; ++i) {
        d[i] = data[i];
    }
    for (var i = 0; i < suffix.length; ++i) {
        d[data.length + i] = suffix.charCodeAt(i);
    }
    return ripemd160(d);
}
function stringToKey(s, type, size, suffix) {
    var whole = base58ToBinary(size + 4, s);
    var result = { type: type, data: new Uint8Array(whole.buffer, 0, size) };
    var digest = new Uint8Array(digestSuffixRipemd160(result.data, suffix));
    if (digest[0] !== whole[size + 0] || digest[1] !== whole[size + 1]
        || digest[2] !== whole[size + 2] || digest[3] !== whole[size + 3]) {
        throw new Error('checksum doesn\'t match');
    }
    return result;
}
function keyToString(key, suffix, prefix) {
    var digest = new Uint8Array(digestSuffixRipemd160(key.data, suffix));
    var whole = new Uint8Array(key.data.length + 4);
    for (var i = 0; i < key.data.length; ++i) {
        whole[i] = key.data[i];
    }
    for (var i = 0; i < 4; ++i) {
        whole[i + key.data.length] = digest[i];
    }
    return prefix + binaryToBase58(whole);
}
/** Convert key in `s` to binary form */
function stringToPublicKey(s) {
    if (typeof s !== 'string') {
        throw new Error('expected string containing public key');
    }
    if (s.substr(0, 3) === 'EOS') {
        var whole = base58ToBinary(exports.publicKeyDataSize + 4, s.substr(3));
        var key = { type: KeyType.k1, data: new Uint8Array(exports.publicKeyDataSize) };
        for (var i = 0; i < exports.publicKeyDataSize; ++i) {
            key.data[i] = whole[i];
        }
        var digest = new Uint8Array(ripemd160(key.data));
        if (digest[0] !== whole[exports.publicKeyDataSize] || digest[1] !== whole[34]
            || digest[2] !== whole[35] || digest[3] !== whole[36]) {
            throw new Error('checksum doesn\'t match');
        }
        return key;
    }
    else if (s.substr(0, 7) === 'PUB_K1_') {
        return stringToKey(s.substr(7), KeyType.k1, exports.publicKeyDataSize, 'K1');
    }
    else if (s.substr(0, 7) === 'PUB_R1_') {
        return stringToKey(s.substr(7), KeyType.r1, exports.publicKeyDataSize, 'R1');
    }
    else {
        throw new Error('unrecognized public key format');
    }
}
exports.stringToPublicKey = stringToPublicKey;
/** Convert `key` to string (base-58) form */
function publicKeyToString(key) {
    if (key.type === KeyType.k1 && key.data.length === exports.publicKeyDataSize) {
        return keyToString(key, 'K1', 'PUB_K1_');
    }
    else if (key.type === KeyType.r1 && key.data.length === exports.publicKeyDataSize) {
        return keyToString(key, 'R1', 'PUB_R1_');
    }
    else {
        throw new Error('unrecognized public key format');
    }
}
exports.publicKeyToString = publicKeyToString;
/** If a key is in the legacy format (`EOS` prefix), then convert it to the new format (`PUB_K1_`).
 * Leaves other formats untouched
 */
function convertLegacyPublicKey(s) {
    if (s.substr(0, 3) === 'EOS') {
        return publicKeyToString(stringToPublicKey(s));
    }
    return s;
}
exports.convertLegacyPublicKey = convertLegacyPublicKey;
/** If a key is in the legacy format (`EOS` prefix), then convert it to the new format (`PUB_K1_`).
 * Leaves other formats untouched
 */
function convertLegacyPublicKeys(keys) {
    return keys.map(convertLegacyPublicKey);
}
exports.convertLegacyPublicKeys = convertLegacyPublicKeys;
/** Convert key in `s` to binary form */
function stringToPrivateKey(s) {
    if (typeof s !== 'string') {
        throw new Error('expected string containing private key');
    }
    if (s.substr(0, 7) === 'PVT_R1_') {
        return stringToKey(s.substr(7), KeyType.r1, exports.privateKeyDataSize, 'R1');
    }
    else {
        throw new Error('unrecognized private key format');
    }
}
exports.stringToPrivateKey = stringToPrivateKey;
/** Convert `key` to string (base-58) form */
function privateKeyToString(key) {
    if (key.type === KeyType.r1) {
        return keyToString(key, 'R1', 'PVT_R1_');
    }
    else {
        throw new Error('unrecognized private key format');
    }
}
exports.privateKeyToString = privateKeyToString;
/** Convert key in `s` to binary form */
function stringToSignature(s) {
    if (typeof s !== 'string') {
        throw new Error('expected string containing signature');
    }
    if (s.substr(0, 7) === 'SIG_K1_') {
        return stringToKey(s.substr(7), KeyType.k1, exports.signatureDataSize, 'K1');
    }
    else if (s.substr(0, 7) === 'SIG_R1_') {
        return stringToKey(s.substr(7), KeyType.r1, exports.signatureDataSize, 'R1');
    }
    else {
        throw new Error('unrecognized signature format');
    }
}
exports.stringToSignature = stringToSignature;
/** Convert `signature` to string (base-58) form */
function signatureToString(signature) {
    if (signature.type === KeyType.k1) {
        return keyToString(signature, 'K1', 'SIG_K1_');
    }
    else if (signature.type === KeyType.r1) {
        return keyToString(signature, 'R1', 'SIG_R1_');
    }
    else {
        throw new Error('unrecognized signature format');
    }
}
exports.signatureToString = signatureToString;

},{"./ripemd":51}],47:[function(require,module,exports){
"use strict";
// copyright defined in eosjs/LICENSE.txt
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
/**
 * @module RPC-Error
 */
// copyright defined in eosjs/LICENSE.txt
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** Holds detailed error information */
var RpcError = /** @class */ (function (_super) {
    __extends(RpcError, _super);
    function RpcError(json) {
        var _this = this;
        if (json.error && json.error.details && json.error.details.length && json.error.details[0].message) {
            _this = _super.call(this, json.error.details[0].message) || this;
        }
        else if (json.processed && json.processed.except && json.processed.except.message) {
            _this = _super.call(this, json.processed.except.message) || this;
        }
        else {
            _this = _super.call(this, json.message) || this;
        }
        Object.setPrototypeOf(_this, RpcError.prototype);
        _this.json = json;
        return _this;
    }
    return RpcError;
}(Error));
exports.RpcError = RpcError;

},{}],49:[function(require,module,exports){
"use strict";
/**
 * @module Serialize
 */
// copyright defined in eosjs/LICENSE.txt
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var numeric = require("./eosjs-numeric");
/** State for serialize() and deserialize() */
var SerializerState = /** @class */ (function () {
    function SerializerState(options) {
        if (options === void 0) { options = {}; }
        /** Have any binary extensions been skipped? */
        this.skippedBinaryExtension = false;
        this.options = options;
    }
    return SerializerState;
}());
exports.SerializerState = SerializerState;
/** Serialize and deserialize data */
var SerialBuffer = /** @class */ (function () {
    /**
     * @param __namedParameters
     *    * `array`: `null` if serializing, or binary data to deserialize
     *    * `textEncoder`: `TextEncoder` instance to use. Pass in `null` if running in a browser
     *    * `textDecoder`: `TextDecider` instance to use. Pass in `null` if running in a browser
     */
    function SerialBuffer(_a) {
        var _b = _a === void 0 ? {} : _a, textEncoder = _b.textEncoder, textDecoder = _b.textDecoder, array = _b.array;
        /** Current position while reading (deserializing) */
        this.readPos = 0;
        this.array = array || new Uint8Array(1024);
        this.length = array ? array.length : 0;
        this.textEncoder = textEncoder || new TextEncoder();
        this.textDecoder = textDecoder || new TextDecoder('utf-8', { fatal: true });
    }
    /** Resize `array` if needed to have at least `size` bytes free */
    SerialBuffer.prototype.reserve = function (size) {
        if (this.length + size <= this.array.length) {
            return;
        }
        var l = this.array.length;
        while (this.length + size > l) {
            l = Math.ceil(l * 1.5);
        }
        var newArray = new Uint8Array(l);
        newArray.set(this.array);
        this.array = newArray;
    };
    /** Is there data available to read? */
    SerialBuffer.prototype.haveReadData = function () {
        return this.readPos < this.length;
    };
    /** Restart reading from the beginning */
    SerialBuffer.prototype.restartRead = function () {
        this.readPos = 0;
    };
    /** Return data with excess storage trimmed away */
    SerialBuffer.prototype.asUint8Array = function () {
        return new Uint8Array(this.array.buffer, this.array.byteOffset, this.length);
    };
    /** Append bytes */
    SerialBuffer.prototype.pushArray = function (v) {
        this.reserve(v.length);
        this.array.set(v, this.length);
        this.length += v.length;
    };
    /** Append bytes */
    SerialBuffer.prototype.push = function () {
        var v = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            v[_i] = arguments[_i];
        }
        this.pushArray(v);
    };
    /** Get a single byte */
    SerialBuffer.prototype.get = function () {
        if (this.readPos < this.length) {
            return this.array[this.readPos++];
        }
        throw new Error('Read past end of buffer');
    };
    /** Append bytes in `v`. Throws if `len` doesn't match `v.length` */
    SerialBuffer.prototype.pushUint8ArrayChecked = function (v, len) {
        if (v.length !== len) {
            throw new Error('Binary data has incorrect size');
        }
        this.pushArray(v);
    };
    /** Get `len` bytes */
    SerialBuffer.prototype.getUint8Array = function (len) {
        if (this.readPos + len > this.length) {
            throw new Error('Read past end of buffer');
        }
        var result = new Uint8Array(this.array.buffer, this.array.byteOffset + this.readPos, len);
        this.readPos += len;
        return result;
    };
    /** Append a `uint16` */
    SerialBuffer.prototype.pushUint16 = function (v) {
        this.push((v >> 0) & 0xff, (v >> 8) & 0xff);
    };
    /** Get a `uint16` */
    SerialBuffer.prototype.getUint16 = function () {
        var v = 0;
        v |= this.get() << 0;
        v |= this.get() << 8;
        return v;
    };
    /** Append a `uint32` */
    SerialBuffer.prototype.pushUint32 = function (v) {
        this.push((v >> 0) & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff);
    };
    /** Get a `uint32` */
    SerialBuffer.prototype.getUint32 = function () {
        var v = 0;
        v |= this.get() << 0;
        v |= this.get() << 8;
        v |= this.get() << 16;
        v |= this.get() << 24;
        return v >>> 0;
    };
    /** Append a `uint64`. *Caution*: `number` only has 53 bits of precision */
    SerialBuffer.prototype.pushNumberAsUint64 = function (v) {
        this.pushUint32(v >>> 0);
        this.pushUint32(Math.floor(v / 4294967296) >>> 0);
    };
    /**
     * Get a `uint64` as a `number`. *Caution*: `number` only has 53 bits of precision; some values will change.
     * `numeric.binaryToDecimal(serialBuffer.getUint8Array(8))` recommended instead
     */
    SerialBuffer.prototype.getUint64AsNumber = function () {
        var low = this.getUint32();
        var high = this.getUint32();
        return (high >>> 0) * 4294967296 + (low >>> 0);
    };
    /** Append a `varuint32` */
    SerialBuffer.prototype.pushVaruint32 = function (v) {
        while (true) {
            if (v >>> 7) {
                this.push(0x80 | (v & 0x7f));
                v = v >>> 7;
            }
            else {
                this.push(v);
                break;
            }
        }
    };
    /** Get a `varuint32` */
    SerialBuffer.prototype.getVaruint32 = function () {
        var v = 0;
        var bit = 0;
        while (true) {
            var b = this.get();
            v |= (b & 0x7f) << bit;
            bit += 7;
            if (!(b & 0x80)) {
                break;
            }
        }
        return v >>> 0;
    };
    /** Append a `varint32` */
    SerialBuffer.prototype.pushVarint32 = function (v) {
        this.pushVaruint32((v << 1) ^ (v >> 31));
    };
    /** Get a `varint32` */
    SerialBuffer.prototype.getVarint32 = function () {
        var v = this.getVaruint32();
        if (v & 1) {
            return ((~v) >> 1) | 2147483648;
        }
        else {
            return v >>> 1;
        }
    };
    /** Append a `float32` */
    SerialBuffer.prototype.pushFloat32 = function (v) {
        this.pushArray(new Uint8Array((new Float32Array([v])).buffer));
    };
    /** Get a `float32` */
    SerialBuffer.prototype.getFloat32 = function () {
        return new Float32Array(this.getUint8Array(4).slice().buffer)[0];
    };
    /** Append a `float64` */
    SerialBuffer.prototype.pushFloat64 = function (v) {
        this.pushArray(new Uint8Array((new Float64Array([v])).buffer));
    };
    /** Get a `float64` */
    SerialBuffer.prototype.getFloat64 = function () {
        return new Float64Array(this.getUint8Array(8).slice().buffer)[0];
    };
    /** Append a `name` */
    SerialBuffer.prototype.pushName = function (s) {
        if (typeof s !== 'string') {
            throw new Error('Expected string containing name');
        }
        function charToSymbol(c) {
            if (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) {
                return (c - 'a'.charCodeAt(0)) + 6;
            }
            if (c >= '1'.charCodeAt(0) && c <= '5'.charCodeAt(0)) {
                return (c - '1'.charCodeAt(0)) + 1;
            }
            return 0;
        }
        var a = new Uint8Array(8);
        var bit = 63;
        for (var i = 0; i < s.length; ++i) {
            var c = charToSymbol(s.charCodeAt(i));
            if (bit < 5) {
                c = c << 1;
            }
            for (var j = 4; j >= 0; --j) {
                if (bit >= 0) {
                    a[Math.floor(bit / 8)] |= ((c >> j) & 1) << (bit % 8);
                    --bit;
                }
            }
        }
        this.pushArray(a);
    };
    /** Get a `name` */
    SerialBuffer.prototype.getName = function () {
        var a = this.getUint8Array(8);
        var result = '';
        for (var bit = 63; bit >= 0;) {
            var c = 0;
            for (var i = 0; i < 5; ++i) {
                if (bit >= 0) {
                    c = (c << 1) | ((a[Math.floor(bit / 8)] >> (bit % 8)) & 1);
                    --bit;
                }
            }
            if (c >= 6) {
                result += String.fromCharCode(c + 'a'.charCodeAt(0) - 6);
            }
            else if (c >= 1) {
                result += String.fromCharCode(c + '1'.charCodeAt(0) - 1);
            }
            else {
                result += '.';
            }
        }
        while (result.endsWith('.')) {
            result = result.substr(0, result.length - 1);
        }
        return result;
    };
    /** Append length-prefixed binary data */
    SerialBuffer.prototype.pushBytes = function (v) {
        this.pushVaruint32(v.length);
        this.pushArray(v);
    };
    /** Get length-prefixed binary data */
    SerialBuffer.prototype.getBytes = function () {
        return this.getUint8Array(this.getVaruint32());
    };
    /** Append a string */
    SerialBuffer.prototype.pushString = function (v) {
        this.pushBytes(this.textEncoder.encode(v));
    };
    /** Get a string */
    SerialBuffer.prototype.getString = function () {
        return this.textDecoder.decode(this.getBytes());
    };
    /** Append a `symbol_code`. Unlike `symbol`, `symbol_code` doesn't include a precision. */
    SerialBuffer.prototype.pushSymbolCode = function (name) {
        if (typeof name !== 'string') {
            throw new Error('Expected string containing symbol_code');
        }
        var a = [];
        a.push.apply(a, __spread(this.textEncoder.encode(name)));
        while (a.length < 8) {
            a.push(0);
        }
        this.pushArray(a.slice(0, 8));
    };
    /** Get a `symbol_code`. Unlike `symbol`, `symbol_code` doesn't include a precision. */
    SerialBuffer.prototype.getSymbolCode = function () {
        var a = this.getUint8Array(8);
        var len;
        for (len = 0; len < a.length; ++len) {
            if (!a[len]) {
                break;
            }
        }
        var name = this.textDecoder.decode(new Uint8Array(a.buffer, a.byteOffset, len));
        return name;
    };
    /** Append a `symbol` */
    SerialBuffer.prototype.pushSymbol = function (_a) {
        var name = _a.name, precision = _a.precision;
        var a = [precision & 0xff];
        a.push.apply(a, __spread(this.textEncoder.encode(name)));
        while (a.length < 8) {
            a.push(0);
        }
        this.pushArray(a.slice(0, 8));
    };
    /** Get a `symbol` */
    SerialBuffer.prototype.getSymbol = function () {
        var precision = this.get();
        var a = this.getUint8Array(7);
        var len;
        for (len = 0; len < a.length; ++len) {
            if (!a[len]) {
                break;
            }
        }
        var name = this.textDecoder.decode(new Uint8Array(a.buffer, a.byteOffset, len));
        return { name: name, precision: precision };
    };
    /** Append an asset */
    SerialBuffer.prototype.pushAsset = function (s) {
        if (typeof s !== 'string') {
            throw new Error('Expected string containing asset');
        }
        s = s.trim();
        var pos = 0;
        var amount = '';
        var precision = 0;
        if (s[pos] === '-') {
            amount += '-';
            ++pos;
        }
        var foundDigit = false;
        while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
            foundDigit = true;
            amount += s[pos];
            ++pos;
        }
        if (!foundDigit) {
            throw new Error('Asset must begin with a number');
        }
        if (s[pos] === '.') {
            ++pos;
            while (pos < s.length && s.charCodeAt(pos) >= '0'.charCodeAt(0) && s.charCodeAt(pos) <= '9'.charCodeAt(0)) {
                amount += s[pos];
                ++precision;
                ++pos;
            }
        }
        var name = s.substr(pos).trim();
        this.pushArray(numeric.signedDecimalToBinary(8, amount));
        this.pushSymbol({ name: name, precision: precision });
    };
    /** Get an asset */
    SerialBuffer.prototype.getAsset = function () {
        var amount = this.getUint8Array(8);
        var _a = this.getSymbol(), name = _a.name, precision = _a.precision;
        var s = numeric.signedBinaryToDecimal(amount, precision + 1);
        if (precision) {
            s = s.substr(0, s.length - precision) + '.' + s.substr(s.length - precision);
        }
        return s + ' ' + name;
    };
    /** Append a public key */
    SerialBuffer.prototype.pushPublicKey = function (s) {
        var key = numeric.stringToPublicKey(s);
        this.push(key.type);
        this.pushArray(key.data);
    };
    /** Get a public key */
    SerialBuffer.prototype.getPublicKey = function () {
        var type = this.get();
        var data = this.getUint8Array(numeric.publicKeyDataSize);
        return numeric.publicKeyToString({ type: type, data: data });
    };
    /** Append a private key */
    SerialBuffer.prototype.pushPrivateKey = function (s) {
        var key = numeric.stringToPrivateKey(s);
        this.push(key.type);
        this.pushArray(key.data);
    };
    /** Get a private key */
    SerialBuffer.prototype.getPrivateKey = function () {
        var type = this.get();
        var data = this.getUint8Array(numeric.privateKeyDataSize);
        return numeric.privateKeyToString({ type: type, data: data });
    };
    /** Append a signature */
    SerialBuffer.prototype.pushSignature = function (s) {
        var key = numeric.stringToSignature(s);
        this.push(key.type);
        this.pushArray(key.data);
    };
    /** Get a signature */
    SerialBuffer.prototype.getSignature = function () {
        var type = this.get();
        var data = this.getUint8Array(numeric.signatureDataSize);
        return numeric.signatureToString({ type: type, data: data });
    };
    return SerialBuffer;
}()); // SerialBuffer
exports.SerialBuffer = SerialBuffer;
/** Is this a supported ABI version? */
function supportedAbiVersion(version) {
    return version.startsWith('eosio::abi/1.');
}
exports.supportedAbiVersion = supportedAbiVersion;
function checkDateParse(date) {
    var result = Date.parse(date);
    if (Number.isNaN(result)) {
        throw new Error('Invalid time format');
    }
    return result;
}
/** Convert date in ISO format to `time_point` (miliseconds since epoch) */
function dateToTimePoint(date) {
    return Math.round(checkDateParse(date + 'Z') * 1000);
}
exports.dateToTimePoint = dateToTimePoint;
/** Convert `time_point` (miliseconds since epoch) to date in ISO format */
function timePointToDate(us) {
    var s = (new Date(us / 1000)).toISOString();
    return s.substr(0, s.length - 1);
}
exports.timePointToDate = timePointToDate;
/** Convert date in ISO format to `time_point_sec` (seconds since epoch) */
function dateToTimePointSec(date) {
    return Math.round(checkDateParse(date + 'Z') / 1000);
}
exports.dateToTimePointSec = dateToTimePointSec;
/** Convert `time_point_sec` (seconds since epoch) to to date in ISO format */
function timePointSecToDate(sec) {
    var s = (new Date(sec * 1000)).toISOString();
    return s.substr(0, s.length - 1);
}
exports.timePointSecToDate = timePointSecToDate;
/** Convert date in ISO format to `block_timestamp_type` (half-seconds since a different epoch) */
function dateToBlockTimestamp(date) {
    return Math.round((checkDateParse(date + 'Z') - 946684800000) / 500);
}
exports.dateToBlockTimestamp = dateToBlockTimestamp;
/** Convert `block_timestamp_type` (half-seconds since a different epoch) to to date in ISO format */
function blockTimestampToDate(slot) {
    var s = (new Date(slot * 500 + 946684800000)).toISOString();
    return s.substr(0, s.length - 1);
}
exports.blockTimestampToDate = blockTimestampToDate;
/** Convert `string` to `Symbol`. format: `precision,NAME`. */
function stringToSymbol(s) {
    if (typeof s !== 'string') {
        throw new Error('Expected string containing symbol');
    }
    var m = s.match(/^([0-9]+),([A-Z]+)$/);
    if (!m) {
        throw new Error('Invalid symbol');
    }
    return { name: m[2], precision: +m[1] };
}
exports.stringToSymbol = stringToSymbol;
/** Convert `Symbol` to `string`. format: `precision,NAME`. */
function symbolToString(_a) {
    var name = _a.name, precision = _a.precision;
    return precision + ',' + name;
}
exports.symbolToString = symbolToString;
/** Convert binary data to hex */
function arrayToHex(data) {
    var e_1, _a;
    var result = '';
    try {
        for (var data_1 = __values(data), data_1_1 = data_1.next(); !data_1_1.done; data_1_1 = data_1.next()) {
            var x = data_1_1.value;
            result += ('00' + x.toString(16)).slice(-2);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (data_1_1 && !data_1_1.done && (_a = data_1.return)) _a.call(data_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result.toUpperCase();
}
exports.arrayToHex = arrayToHex;
/** Convert hex to binary data */
function hexToUint8Array(hex) {
    if (typeof hex !== 'string') {
        throw new Error('Expected string containing hex digits');
    }
    if (hex.length % 2) {
        throw new Error('Odd number of hex digits');
    }
    var l = hex.length / 2;
    var result = new Uint8Array(l);
    for (var i = 0; i < l; ++i) {
        var x = parseInt(hex.substr(i * 2, 2), 16);
        if (Number.isNaN(x)) {
            throw new Error('Expected hex string');
        }
        result[i] = x;
    }
    return result;
}
exports.hexToUint8Array = hexToUint8Array;
function serializeUnknown(buffer, data) {
    throw new Error('Don\'t know how to serialize ' + this.name);
}
function deserializeUnknown(buffer) {
    throw new Error('Don\'t know how to deserialize ' + this.name);
}
function serializeStruct(buffer, data, state, allowExtensions) {
    if (state === void 0) { state = new SerializerState(); }
    if (allowExtensions === void 0) { allowExtensions = true; }
    var e_2, _a;
    if (typeof data !== 'object') {
        throw new Error('expected object containing data: ' + JSON.stringify(data));
    }
    if (this.base) {
        this.base.serialize(buffer, data, state, allowExtensions);
    }
    try {
        for (var _b = __values(this.fields), _c = _b.next(); !_c.done; _c = _b.next()) {
            var field = _c.value;
            if (field.name in data) {
                if (state.skippedBinaryExtension) {
                    throw new Error('unexpected ' + this.name + '.' + field.name);
                }
                field.type.serialize(buffer, data[field.name], state, allowExtensions && field === this.fields[this.fields.length - 1]);
            }
            else {
                if (allowExtensions && field.type.extensionOf) {
                    state.skippedBinaryExtension = true;
                }
                else {
                    throw new Error('missing ' + this.name + '.' + field.name + ' (type=' + field.type.name + ')');
                }
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
function deserializeStruct(buffer, state, allowExtensions) {
    if (state === void 0) { state = new SerializerState(); }
    if (allowExtensions === void 0) { allowExtensions = true; }
    var e_3, _a;
    var result;
    if (this.base) {
        result = this.base.deserialize(buffer, state, allowExtensions);
    }
    else {
        result = {};
    }
    try {
        for (var _b = __values(this.fields), _c = _b.next(); !_c.done; _c = _b.next()) {
            var field = _c.value;
            if (allowExtensions && field.type.extensionOf && !buffer.haveReadData()) {
                state.skippedBinaryExtension = true;
            }
            else {
                result[field.name] = field.type.deserialize(buffer, state, allowExtensions);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return result;
}
function serializeVariant(buffer, data, state, allowExtensions) {
    if (!Array.isArray(data) || data.length !== 2 || typeof data[0] !== 'string') {
        throw new Error('expected variant: ["type", value]');
    }
    var i = this.fields.findIndex(function (field) { return field.name === data[0]; });
    if (i < 0) {
        throw new Error("type \"" + data[0] + "\" is not valid for variant");
    }
    buffer.pushVaruint32(i);
    this.fields[i].type.serialize(buffer, data[1], state, allowExtensions);
}
function deserializeVariant(buffer, state, allowExtensions) {
    var i = buffer.getVaruint32();
    if (i >= this.fields.length) {
        throw new Error("type index " + i + " is not valid for variant");
    }
    var field = this.fields[i];
    return [field.name, field.type.deserialize(buffer, state, allowExtensions)];
}
function serializeArray(buffer, data, state, allowExtensions) {
    var e_4, _a;
    buffer.pushVaruint32(data.length);
    try {
        for (var data_2 = __values(data), data_2_1 = data_2.next(); !data_2_1.done; data_2_1 = data_2.next()) {
            var item = data_2_1.value;
            this.arrayOf.serialize(buffer, item, state, false);
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (data_2_1 && !data_2_1.done && (_a = data_2.return)) _a.call(data_2);
        }
        finally { if (e_4) throw e_4.error; }
    }
}
function deserializeArray(buffer, state, allowExtensions) {
    var len = buffer.getVaruint32();
    var result = [];
    for (var i = 0; i < len; ++i) {
        result.push(this.arrayOf.deserialize(buffer, state, false));
    }
    return result;
}
function serializeOptional(buffer, data, state, allowExtensions) {
    if (data === null || data === undefined) {
        buffer.push(0);
    }
    else {
        buffer.push(1);
        this.optionalOf.serialize(buffer, data, state, allowExtensions);
    }
}
function deserializeOptional(buffer, state, allowExtensions) {
    if (buffer.get()) {
        return this.optionalOf.deserialize(buffer, state, allowExtensions);
    }
    else {
        return null;
    }
}
function serializeExtension(buffer, data, state, allowExtensions) {
    this.extensionOf.serialize(buffer, data, state, allowExtensions);
}
function deserializeExtension(buffer, state, allowExtensions) {
    return this.extensionOf.deserialize(buffer, state, allowExtensions);
}
function createType(attrs) {
    return __assign({ name: '<missing name>', aliasOfName: '', arrayOf: null, optionalOf: null, extensionOf: null, baseName: '', base: null, fields: [], serialize: serializeUnknown, deserialize: deserializeUnknown }, attrs);
}
function checkRange(orig, converted) {
    if (Number.isNaN(+orig) || Number.isNaN(+converted) || (typeof orig !== 'number' && typeof orig !== 'string')) {
        throw new Error('Expected number');
    }
    if (+orig !== +converted) {
        throw new Error('Number is out of range');
    }
    return +orig;
}
/** Create the set of types built-in to the abi format */
function createInitialTypes() {
    var result = new Map(Object.entries({
        bool: createType({
            name: 'bool',
            serialize: function (buffer, data) {
                if (typeof data !== 'boolean') {
                    throw new Error('Expected true or false');
                }
                buffer.push(data ? 1 : 0);
            },
            deserialize: function (buffer) { return !!buffer.get(); },
        }),
        uint8: createType({
            name: 'uint8',
            serialize: function (buffer, data) { buffer.push(checkRange(data, data & 0xff)); },
            deserialize: function (buffer) { return buffer.get(); },
        }),
        int8: createType({
            name: 'int8',
            serialize: function (buffer, data) { buffer.push(checkRange(data, data << 24 >> 24)); },
            deserialize: function (buffer) { return buffer.get() << 24 >> 24; },
        }),
        uint16: createType({
            name: 'uint16',
            serialize: function (buffer, data) { buffer.pushUint16(checkRange(data, data & 0xffff)); },
            deserialize: function (buffer) { return buffer.getUint16(); },
        }),
        int16: createType({
            name: 'int16',
            serialize: function (buffer, data) { buffer.pushUint16(checkRange(data, data << 16 >> 16)); },
            deserialize: function (buffer) { return buffer.getUint16() << 16 >> 16; },
        }),
        uint32: createType({
            name: 'uint32',
            serialize: function (buffer, data) { buffer.pushUint32(checkRange(data, data >>> 0)); },
            deserialize: function (buffer) { return buffer.getUint32(); },
        }),
        uint64: createType({
            name: 'uint64',
            serialize: function (buffer, data) {
                buffer.pushArray(numeric.decimalToBinary(8, '' + data));
            },
            deserialize: function (buffer) { return numeric.binaryToDecimal(buffer.getUint8Array(8)); },
        }),
        int64: createType({
            name: 'int64',
            serialize: function (buffer, data) {
                buffer.pushArray(numeric.signedDecimalToBinary(8, '' + data));
            },
            deserialize: function (buffer) { return numeric.signedBinaryToDecimal(buffer.getUint8Array(8)); },
        }),
        int32: createType({
            name: 'int32',
            serialize: function (buffer, data) { buffer.pushUint32(checkRange(data, data | 0)); },
            deserialize: function (buffer) { return buffer.getUint32() | 0; },
        }),
        varuint32: createType({
            name: 'varuint32',
            serialize: function (buffer, data) { buffer.pushVaruint32(checkRange(data, data >>> 0)); },
            deserialize: function (buffer) { return buffer.getVaruint32(); },
        }),
        varint32: createType({
            name: 'varint32',
            serialize: function (buffer, data) { buffer.pushVarint32(checkRange(data, data | 0)); },
            deserialize: function (buffer) { return buffer.getVarint32(); },
        }),
        uint128: createType({
            name: 'uint128',
            serialize: function (buffer, data) { buffer.pushArray(numeric.decimalToBinary(16, '' + data)); },
            deserialize: function (buffer) { return numeric.binaryToDecimal(buffer.getUint8Array(16)); },
        }),
        int128: createType({
            name: 'int128',
            serialize: function (buffer, data) {
                buffer.pushArray(numeric.signedDecimalToBinary(16, '' + data));
            },
            deserialize: function (buffer) { return numeric.signedBinaryToDecimal(buffer.getUint8Array(16)); },
        }),
        float32: createType({
            name: 'float32',
            serialize: function (buffer, data) { buffer.pushFloat32(data); },
            deserialize: function (buffer) { return buffer.getFloat32(); },
        }),
        float64: createType({
            name: 'float64',
            serialize: function (buffer, data) { buffer.pushFloat64(data); },
            deserialize: function (buffer) { return buffer.getFloat64(); },
        }),
        float128: createType({
            name: 'float128',
            serialize: function (buffer, data) { buffer.pushUint8ArrayChecked(hexToUint8Array(data), 16); },
            deserialize: function (buffer) { return arrayToHex(buffer.getUint8Array(16)); },
        }),
        bytes: createType({
            name: 'bytes',
            serialize: function (buffer, data) {
                if (data instanceof Uint8Array || Array.isArray(data)) {
                    buffer.pushBytes(data);
                }
                else {
                    buffer.pushBytes(hexToUint8Array(data));
                }
            },
            deserialize: function (buffer, state) {
                if (state && state.options.bytesAsUint8Array) {
                    return buffer.getBytes();
                }
                else {
                    return arrayToHex(buffer.getBytes());
                }
            },
        }),
        string: createType({
            name: 'string',
            serialize: function (buffer, data) { buffer.pushString(data); },
            deserialize: function (buffer) { return buffer.getString(); },
        }),
        name: createType({
            name: 'name',
            serialize: function (buffer, data) { buffer.pushName(data); },
            deserialize: function (buffer) { return buffer.getName(); },
        }),
        time_point: createType({
            name: 'time_point',
            serialize: function (buffer, data) { buffer.pushNumberAsUint64(dateToTimePoint(data)); },
            deserialize: function (buffer) { return timePointToDate(buffer.getUint64AsNumber()); },
        }),
        time_point_sec: createType({
            name: 'time_point_sec',
            serialize: function (buffer, data) { buffer.pushUint32(dateToTimePointSec(data)); },
            deserialize: function (buffer) { return timePointSecToDate(buffer.getUint32()); },
        }),
        block_timestamp_type: createType({
            name: 'block_timestamp_type',
            serialize: function (buffer, data) { buffer.pushUint32(dateToBlockTimestamp(data)); },
            deserialize: function (buffer) { return blockTimestampToDate(buffer.getUint32()); },
        }),
        symbol_code: createType({
            name: 'symbol_code',
            serialize: function (buffer, data) { buffer.pushSymbolCode(data); },
            deserialize: function (buffer) { return buffer.getSymbolCode(); },
        }),
        symbol: createType({
            name: 'symbol',
            serialize: function (buffer, data) { buffer.pushSymbol(stringToSymbol(data)); },
            deserialize: function (buffer) { return symbolToString(buffer.getSymbol()); },
        }),
        asset: createType({
            name: 'asset',
            serialize: function (buffer, data) { buffer.pushAsset(data); },
            deserialize: function (buffer) { return buffer.getAsset(); },
        }),
        checksum160: createType({
            name: 'checksum160',
            serialize: function (buffer, data) { buffer.pushUint8ArrayChecked(hexToUint8Array(data), 20); },
            deserialize: function (buffer) { return arrayToHex(buffer.getUint8Array(20)); },
        }),
        checksum256: createType({
            name: 'checksum256',
            serialize: function (buffer, data) { buffer.pushUint8ArrayChecked(hexToUint8Array(data), 32); },
            deserialize: function (buffer) { return arrayToHex(buffer.getUint8Array(32)); },
        }),
        checksum512: createType({
            name: 'checksum512',
            serialize: function (buffer, data) { buffer.pushUint8ArrayChecked(hexToUint8Array(data), 64); },
            deserialize: function (buffer) { return arrayToHex(buffer.getUint8Array(64)); },
        }),
        public_key: createType({
            name: 'public_key',
            serialize: function (buffer, data) { buffer.pushPublicKey(data); },
            deserialize: function (buffer) { return buffer.getPublicKey(); },
        }),
        private_key: createType({
            name: 'private_key',
            serialize: function (buffer, data) { buffer.pushPrivateKey(data); },
            deserialize: function (buffer) { return buffer.getPrivateKey(); },
        }),
        signature: createType({
            name: 'signature',
            serialize: function (buffer, data) { buffer.pushSignature(data); },
            deserialize: function (buffer) { return buffer.getSignature(); },
        }),
    }));
    result.set('extended_asset', createType({
        name: 'extended_asset',
        baseName: '',
        fields: [
            { name: 'quantity', typeName: 'asset', type: result.get('asset') },
            { name: 'contract', typeName: 'name', type: result.get('name') },
        ],
        serialize: serializeStruct,
        deserialize: deserializeStruct,
    }));
    return result;
} // createInitialTypes()
exports.createInitialTypes = createInitialTypes;
/** Get type from `types` */
function getType(types, name) {
    var type = types.get(name);
    if (type && type.aliasOfName) {
        return getType(types, type.aliasOfName);
    }
    if (type) {
        return type;
    }
    if (name.endsWith('[]')) {
        return createType({
            name: name,
            arrayOf: getType(types, name.substr(0, name.length - 2)),
            serialize: serializeArray,
            deserialize: deserializeArray,
        });
    }
    if (name.endsWith('?')) {
        return createType({
            name: name,
            optionalOf: getType(types, name.substr(0, name.length - 1)),
            serialize: serializeOptional,
            deserialize: deserializeOptional,
        });
    }
    if (name.endsWith('$')) {
        return createType({
            name: name,
            extensionOf: getType(types, name.substr(0, name.length - 1)),
            serialize: serializeExtension,
            deserialize: deserializeExtension,
        });
    }
    throw new Error('Unknown type: ' + name);
}
exports.getType = getType;
/**
 * Get types from abi
 * @param initialTypes Set of types to build on.
 *     In most cases, it's best to fill this from a fresh call to `getTypesFromAbi()`.
 */
function getTypesFromAbi(initialTypes, abi) {
    var e_5, _a, e_6, _b, e_7, _c, e_8, _d, e_9, _e;
    var types = new Map(initialTypes);
    if (abi.types) {
        try {
            for (var _f = __values(abi.types), _g = _f.next(); !_g.done; _g = _f.next()) {
                var _h = _g.value, new_type_name = _h.new_type_name, type = _h.type;
                types.set(new_type_name, createType({ name: new_type_name, aliasOfName: type }));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
            }
            finally { if (e_5) throw e_5.error; }
        }
    }
    if (abi.structs) {
        try {
            for (var _j = __values(abi.structs), _k = _j.next(); !_k.done; _k = _j.next()) {
                var _l = _k.value, name_1 = _l.name, base = _l.base, fields = _l.fields;
                types.set(name_1, createType({
                    name: name_1,
                    baseName: base,
                    fields: fields.map(function (_a) {
                        var n = _a.name, type = _a.type;
                        return ({ name: n, typeName: type, type: null });
                    }),
                    serialize: serializeStruct,
                    deserialize: deserializeStruct,
                }));
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_k && !_k.done && (_b = _j.return)) _b.call(_j);
            }
            finally { if (e_6) throw e_6.error; }
        }
    }
    if (abi.variants) {
        try {
            for (var _m = __values(abi.variants), _o = _m.next(); !_o.done; _o = _m.next()) {
                var _p = _o.value, name_2 = _p.name, t = _p.types;
                types.set(name_2, createType({
                    name: name_2,
                    fields: t.map(function (s) { return ({ name: s, typeName: s, type: null }); }),
                    serialize: serializeVariant,
                    deserialize: deserializeVariant,
                }));
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_o && !_o.done && (_c = _m.return)) _c.call(_m);
            }
            finally { if (e_7) throw e_7.error; }
        }
    }
    try {
        for (var types_1 = __values(types), types_1_1 = types_1.next(); !types_1_1.done; types_1_1 = types_1.next()) {
            var _q = __read(types_1_1.value, 2), name_3 = _q[0], type = _q[1];
            if (type.baseName) {
                type.base = getType(types, type.baseName);
            }
            try {
                for (var _r = __values(type.fields), _s = _r.next(); !_s.done; _s = _r.next()) {
                    var field = _s.value;
                    field.type = getType(types, field.typeName);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (_s && !_s.done && (_e = _r.return)) _e.call(_r);
                }
                finally { if (e_9) throw e_9.error; }
            }
        }
    }
    catch (e_8_1) { e_8 = { error: e_8_1 }; }
    finally {
        try {
            if (types_1_1 && !types_1_1.done && (_d = types_1.return)) _d.call(types_1);
        }
        finally { if (e_8) throw e_8.error; }
    }
    return types;
} // getTypesFromAbi
exports.getTypesFromAbi = getTypesFromAbi;
/** TAPoS: Return transaction fields which reference `refBlock` and expire `expireSeconds` after `refBlock.timestamp` */
function transactionHeader(refBlock, expireSeconds) {
    return {
        expiration: timePointSecToDate(dateToTimePointSec(refBlock.timestamp) + expireSeconds),
        ref_block_num: refBlock.block_num & 0xffff,
        ref_block_prefix: refBlock.ref_block_prefix,
    };
}
exports.transactionHeader = transactionHeader;
/** Convert action data to serialized form (hex) */
function serializeActionData(contract, account, name, data, textEncoder, textDecoder) {
    var action = contract.actions.get(name);
    if (!action) {
        throw new Error("Unknown action " + name + " in contract " + account);
    }
    var buffer = new SerialBuffer({ textEncoder: textEncoder, textDecoder: textDecoder });
    action.serialize(buffer, data);
    return arrayToHex(buffer.asUint8Array());
}
exports.serializeActionData = serializeActionData;
/** Return action in serialized form */
function serializeAction(contract, account, name, authorization, data, textEncoder, textDecoder) {
    return {
        account: account,
        name: name,
        authorization: authorization,
        data: serializeActionData(contract, account, name, data, textEncoder, textDecoder),
    };
}
exports.serializeAction = serializeAction;
/** Deserialize action data. If `data` is a `string`, then it's assumed to be in hex. */
function deserializeActionData(contract, account, name, data, textEncoder, textDecoder) {
    var action = contract.actions.get(name);
    if (typeof data === 'string') {
        data = hexToUint8Array(data);
    }
    if (!action) {
        throw new Error("Unknown action " + name + " in contract " + account);
    }
    var buffer = new SerialBuffer({ textDecoder: textDecoder, textEncoder: textEncoder });
    buffer.pushArray(data);
    return action.deserialize(buffer);
}
exports.deserializeActionData = deserializeActionData;
/** Deserialize action. If `data` is a `string`, then it's assumed to be in hex. */
function deserializeAction(contract, account, name, authorization, data, textEncoder, textDecoder) {
    return {
        account: account,
        name: name,
        authorization: authorization,
        data: deserializeActionData(contract, account, name, data, textEncoder, textDecoder),
    };
}
exports.deserializeAction = deserializeAction;

},{"./eosjs-numeric":46}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eosjs_api_1 = require("./eosjs-api");
exports.Api = eosjs_api_1.Api;
var ApiInterfaces = require("./eosjs-api-interfaces");
exports.ApiInterfaces = ApiInterfaces;
var eosjs_jsonrpc_1 = require("./eosjs-jsonrpc");
exports.JsonRpc = eosjs_jsonrpc_1.JsonRpc;
var Numeric = require("./eosjs-numeric");
exports.Numeric = Numeric;
var RpcInterfaces = require("./eosjs-rpc-interfaces");
exports.RpcInterfaces = RpcInterfaces;
var eosjs_rpcerror_1 = require("./eosjs-rpcerror");
exports.RpcError = eosjs_rpcerror_1.RpcError;
var Serialize = require("./eosjs-serialize");
exports.Serialize = Serialize;

},{"./eosjs-api":44,"./eosjs-api-interfaces":43,"./eosjs-jsonrpc":45,"./eosjs-numeric":46,"./eosjs-rpc-interfaces":47,"./eosjs-rpcerror":48,"./eosjs-serialize":49}],51:[function(require,module,exports){
// https://gist.githubusercontent.com/wlzla000/bac83df6d3c51916c4dd0bc947e46947/raw/7ee3462b095ab22580ddaf191f44a590da6fe33b/RIPEMD-160.js

/*
	RIPEMD-160.js

		developed
			by K. (https://github.com/wlzla000)
			on December 27-29, 2017,

		licensed under


		the MIT license

		Copyright (c) 2017 K.

		 Permission is hereby granted, free of charge, to any person
		obtaining a copy of this software and associated documentation
		files (the "Software"), to deal in the Software without
		restriction, including without limitation the rights to use,
		copy, modify, merge, publish, distribute, sublicense, and/or
		sell copies of the Software, and to permit persons to whom the
		Software is furnished to do so, subject to the following
		conditions:

		 The above copyright notice and this permission notice shall be
		included in all copies or substantial portions of the Software.

		 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
		EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
		OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
		NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
		HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
		WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
		FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
		OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RIPEMD160 = function () {
	function RIPEMD160() {
		// https://webcache.googleusercontent.com/search?q=cache:CnLOgolTHYEJ:https://www.cosic.esat.kuleuven.be/publications/article-317.pdf
		// http://shodhganga.inflibnet.ac.in/bitstream/10603/22978/13/13_appendix.pdf

		_classCallCheck(this, RIPEMD160);
	}

	_createClass(RIPEMD160, null, [{
		key: "get_n_pad_bytes",
		value: function get_n_pad_bytes(message_size /* in bytes, 1 byte is 8 bits. */) {
			//  Obtain the number of bytes needed to pad the message.
			// It does not contain the size of the message size information.
			/*
   	https://webcache.googleusercontent.com/search?q=cache:CnLOgolTHYEJ:https://www.cosic.esat.kuleuven.be/publications/article-317.pdf
   		The Cryptographic Hash Function RIPEMD-160
   		written by
   		Bart Preneel,
   		Hans Dobbertin,
   		Antoon Bosselaers
   	in
   		1997.
   		--------------------------------------------------
   		§5     Description of RIPEMD-160
   		......
   		 In order to guarantee that the total input size is a
   	multiple of 512 bits, the input is padded in the same
   	way as for all the members of the MD4-family: one
   	appends a single 1 followed by a string of 0s (the
   	number of 0s lies between 0 and 511); the last 64 bits
   	of the extended input contain the binary representation
   	of the input size in bits, least significant byte first.
   */
			/*
   	https://tools.ietf.org/rfc/rfc1186.txt
   		RFC 1186: MD4 Message Digest Algorithm.
   		written by
   		Ronald Linn Rivest
   	in
   		October 1990.
   		--------------------------------------------------
   		§3     MD4 Algorithm Description
   		......
   		Step 1. Append padding bits
   		 The message is "padded" (extended) so that its length
   	(in bits) is congruent to 448, modulo 512. That is, the
   	message is extended so that it is just 64 bits shy of
   	being a multiple of 512 bits long. Padding is always
   	performed, even if the length of the message is already
   	congruent to 448, modulo 512 (in which case 512 bits of
   	padding are added).
   		 Padding is performed as follows: a single "1" bit is
   	appended to the message, and then enough zero bits are
   	appended so that the length in bits of the padded
   	message becomes congruent to 448, modulo 512.
   		Step 2. Append length
   		 A 64-bit representation of b (the length of the message
   	before the padding bits were added) is appended to the
   	result of the previous step. In the unlikely event that
   	b is greater than 2^64, then only the low-order 64 bits
   	of b are used. (These bits are appended as two 32-bit
   	words and appended low-order word first in accordance
   	with the previous conventions.)
   		 At this point the resulting message (after padding with
   	bits and with b) has a length that is an exact multiple
   	of 512 bits. Equivalently, this message has a length
   	that is an exact multiple of 16 (32-bit) words. Let
   	M[0 ... N-1] denote the words of the resulting message,
   	where N is a multiple of 16.
   */
			// https://crypto.stackexchange.com/a/32407/54568
			/*
   	Example case  # 1
   		[0 bit: message.]
   		[1 bit: 1.]
   		[447 bits: 0.]
   		[64 bits: message size information.]
   		Example case  # 2
   		[512-bits: message]
   		[1 bit: 1.]
   		[447 bits: 0.]
   		[64 bits: message size information.]
   		Example case  # 3
   		[(512 - 64 = 448) bits: message.]
   		[1 bit: 1.]
   		[511 bits: 0.]
   		[64 bits: message size information.]
   		Example case  # 4
   		[(512 - 65 = 447) bits: message.]
   		[1 bit: 1.]
   		[0 bit: 0.]
   		[64 bits: message size information.]
   */
			// The number of padding zero bits:
			//      511 - [{(message size in bits) + 64} (mod 512)]
			return 64 - (message_size + 8 & 63 /* 63 */);
		}
	}, {
		key: "pad",
		value: function pad(message /* An ArrayBuffer. */) {
			var message_size = message.byteLength;
			var n_pad = RIPEMD160.get_n_pad_bytes(message_size);

			//  `Number.MAX_SAFE_INTEGER` is ((2 ** 53) - 1) and
			// bitwise operation in Javascript is done on 32-bits operands.
			var divmod = function divmod(dividend, divisor) {
				return [Math.floor(dividend / divisor), dividend % divisor];
			};
			/*
   To shift
     00000000 000????? ???????? ???????? ???????? ???????? ???????? ????????
                                      t o
    00000000 ???????? ???????? ???????? ???????? ???????? ???????? ?????000
   --------------------------------------------------------------------------------
   Method #1
      00000000 000????? ???????? ????????  ???????? ???????? ???????? ????????
    [00000000 000AAAAA AAAAAAAA AAAAAAAA] (<A> captured)
    [00000000 AAAAAAAA AAAAAAAA AAAAA000] (<A> shifted)
                          (<B> captured) [BBBBBBBB BBBBBBBB BBBBBBBB BBBBBBBB]
                      (<B> shifted) [BBB][BBBBBBBB BBBBBBBB BBBBBBBB BBBBB000]
    [00000000 AAAAAAAA AAAAAAAA AAAAABBB] (<A> & <B_2> merged)
    [00000000 AAAAAAAA AAAAAAAA AAAAABBB][BBBBBBBB BBBBBBBB BBBBBBBB BBBBB000]
     00000000 ???????? ???????? ????????  ???????? ???????? ???????? ?????000
   	const uint32_max_plus_1 = 0x100000000; // (2 ** 32)
   const [
   	msg_byte_size_most, // Value range [0, (2 ** 21) - 1].
   	msg_byte_size_least // Value range [0, (2 ** 32) - 1].
   ] = divmod(message_size, uint32_max_plus_1);
   const [
   	carry, // Value range [0, 7].
   	msg_bit_size_least // Value range [0, (2 ** 32) - 8].
   ] = divmod(message_byte_size_least * 8, uint32_max_plus_1);
   const message_bit_size_most = message_byte_size_most * 8
   	+ carry; // Value range [0, (2 ** 24) - 1].
   --------------------------------------------------------------------------------
   Method #2
     00000000 000????? ???????? ????????  ???????? ???????? ???????? ????????
       [00000 000AAAAA AAAAAAAA AAAAAAAA  AAA] (<A> captured)
                          (<B> captured) [000BBBBB BBBBBBBB BBBBBBBB BBBBBBBB]
                           (<B> shifted) [BBBBBBBB BBBBBBBB BBBBBBBB BBBBB000]
    [00000000 AAAAAAAA AAAAAAAA AAAAAAAA][BBBBBBBB BBBBBBBB BBBBBBBB BBBBB000]
     00000000 ???????? ???????? ????????  ???????? ???????? ???????? ?????000
   	*/

			var _divmod$map = divmod(message_size, 536870912 /* (2 ** 29) */).map(function (x, index) {
				return index ? x * 8 : x;
			}),
			    _divmod$map2 = _slicedToArray(_divmod$map, 2),
			    msg_bit_size_most = _divmod$map2[0],
			    msg_bit_size_least = _divmod$map2[1];

			// `ArrayBuffer.transfer()` is not supported.


			var padded = new Uint8Array(message_size + n_pad + 8);
			padded.set(new Uint8Array(message), 0);
			var data_view = new DataView(padded.buffer);
			data_view.setUint8(message_size, 128);
			data_view.setUint32(message_size + n_pad, msg_bit_size_least, true // Little-endian
			);
			data_view.setUint32(message_size + n_pad + 4, msg_bit_size_most, true // Little-endian
			);

			return padded.buffer;
		}
	}, {
		key: "f",
		value: function f(j, x, y, z) {
			if (0 <= j && j <= 15) {
				// Exclusive-OR
				return x ^ y ^ z;
			}
			if (16 <= j && j <= 31) {
				// Multiplexing (muxing)
				return x & y | ~x & z;
			}
			if (32 <= j && j <= 47) {
				return (x | ~y) ^ z;
			}
			if (48 <= j && j <= 63) {
				// Multiplexing (muxing)
				return x & z | y & ~z;
			}
			if (64 <= j && j <= 79) {
				return x ^ (y | ~z);
			}
		}
	}, {
		key: "K",
		value: function K(j) {
			if (0 <= j && j <= 15) {
				return 0x00000000;
			}
			if (16 <= j && j <= 31) {
				// Math.floor((2 ** 30) * Math.SQRT2)
				return 0x5A827999;
			}
			if (32 <= j && j <= 47) {
				// Math.floor((2 ** 30) * Math.sqrt(3))
				return 0x6ED9EBA1;
			}
			if (48 <= j && j <= 63) {
				// Math.floor((2 ** 30) * Math.sqrt(5))
				return 0x8F1BBCDC;
			}
			if (64 <= j && j <= 79) {
				// Math.floor((2 ** 30) * Math.sqrt(7))
				return 0xA953FD4E;
			}
		}
	}, {
		key: "KP",
		value: function KP(j) // K'
		{
			if (0 <= j && j <= 15) {
				// Math.floor((2 ** 30) * Math.cbrt(2))
				return 0x50A28BE6;
			}
			if (16 <= j && j <= 31) {
				// Math.floor((2 ** 30) * Math.cbrt(3))
				return 0x5C4DD124;
			}
			if (32 <= j && j <= 47) {
				// Math.floor((2 ** 30) * Math.cbrt(5))
				return 0x6D703EF3;
			}
			if (48 <= j && j <= 63) {
				// Math.floor((2 ** 30) * Math.cbrt(7))
				return 0x7A6D76E9;
			}
			if (64 <= j && j <= 79) {
				return 0x00000000;
			}
		}
	}, {
		key: "add_modulo32",
		value: function add_modulo32() /* ...... */{
			// 1.  Modulo addition (addition modulo) is associative.
			//    https://proofwiki.org/wiki/Modulo_Addition_is_Associative
			// 2.  Bitwise operation in Javascript
			//    is done on 32-bits operands
			//    and results in a 32-bits value.
			return Array.from(arguments).reduce(function (a, b) {
				return a + b;
			}, 0) | 0;
		}
	}, {
		key: "rol32",
		value: function rol32(value, count) {
			// Cyclic left shift (rotate) on 32-bits value.
			return value << count | value >>> 32 - count;
		}
	}, {
		key: "hash",
		value: function hash(message /* An ArrayBuffer. */) {
			//////////       Padding       //////////

			// The padded message.
			var padded = RIPEMD160.pad(message);

			//////////     Compression     //////////

			// Message word selectors.
			var r = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13];
			var rP = [// r'
			5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11];

			// Amounts for 'rotate left' operation.
			var s = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6];
			var sP = [// s'
			8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];

			// The size, in bytes, of a word.
			var word_size = 4;

			// The size, in bytes, of a 16-words block.
			var block_size = 64;

			// The number of the 16-words blocks.
			var t = padded.byteLength / block_size;

			//  The message after padding consists of t 16-word blocks that
			// are denoted with X_i[j], with 0≤i≤(t − 1) and 0≤j≤15.
			var X = new Array(t).fill(undefined).map(function (_, i) {
				return function (j) {
					return new DataView(padded, i * block_size, block_size).getUint32(j * word_size, true // Little-endian
					);
				};
			});

			//  The result of RIPEMD-160 is contained in five 32-bit words,
			// which form the internal state of the algorithm. The final
			// content of these five 32-bit words is converted to a 160-bit
			// string, again using the little-endian convention.
			var h = [0x67452301, // h_0
			0xEFCDAB89, // h_1
			0x98BADCFE, // h_2
			0x10325476, // h_3
			0xC3D2E1F0 // h_4
			];

			for (var i = 0; i < t; ++i) {
				var A = h[0],
				    B = h[1],
				    C = h[2],
				    D = h[3],
				    E = h[4];
				var AP = A,
				    BP = B,
				    CP = C,
				    DP = D,
				    EP = E;
				for (var j = 0; j < 80; ++j) {
					// Left rounds
					var _T = RIPEMD160.add_modulo32(RIPEMD160.rol32(RIPEMD160.add_modulo32(A, RIPEMD160.f(j, B, C, D), X[i](r[j]), RIPEMD160.K(j)), s[j]), E);
					A = E;
					E = D;
					D = RIPEMD160.rol32(C, 10);
					C = B;
					B = _T;

					// Right rounds
					_T = RIPEMD160.add_modulo32(RIPEMD160.rol32(RIPEMD160.add_modulo32(AP, RIPEMD160.f(79 - j, BP, CP, DP), X[i](rP[j]), RIPEMD160.KP(j)), sP[j]), EP);
					AP = EP;
					EP = DP;
					DP = RIPEMD160.rol32(CP, 10);
					CP = BP;
					BP = _T;
				}
				var T = RIPEMD160.add_modulo32(h[1], C, DP);
				h[1] = RIPEMD160.add_modulo32(h[2], D, EP);
				h[2] = RIPEMD160.add_modulo32(h[3], E, AP);
				h[3] = RIPEMD160.add_modulo32(h[4], A, BP);
				h[4] = RIPEMD160.add_modulo32(h[0], B, CP);
				h[0] = T;
			}

			//  The final output string then consists of the concatenatation
			// of h_0, h_1, h_2, h_3, and h_4 after converting each h_i to a
			// 4-byte string using the little-endian convention.
			var result = new ArrayBuffer(20);
			var data_view = new DataView(result);
			h.forEach(function (h_i, i) {
				return data_view.setUint32(i * 4, h_i, true);
			});
			return result;
		}
	}]);

	return RIPEMD160;
}();

module.exports = {
	RIPEMD160: RIPEMD160
};

},{}],52:[function(require,module,exports){
module.exports={
    "version": "eosio::abi/1.1",
    "structs": [
        {
            "name": "extensions_entry",
            "base": "",
            "fields": [
                {
                    "name": "tag",
                    "type": "uint16"
                },
                {
                    "name": "value",
                    "type": "bytes"
                }
            ]
        },
        {
            "name": "type_def",
            "base": "",
            "fields": [
                {
                    "name": "new_type_name",
                    "type": "string"
                },
                {
                    "name": "type",
                    "type": "string"
                }
            ]
        },
        {
            "name": "field_def",
            "base": "",
            "fields": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "type",
                    "type": "string"
                }
            ]
        },
        {
            "name": "struct_def",
            "base": "",
            "fields": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "base",
                    "type": "string"
                },
                {
                    "name": "fields",
                    "type": "field_def[]"
                }
            ]
        },
        {
            "name": "action_def",
            "base": "",
            "fields": [
                {
                    "name": "name",
                    "type": "name"
                },
                {
                    "name": "type",
                    "type": "string"
                },
                {
                    "name": "ricardian_contract",
                    "type": "string"
                }
            ]
        },
        {
            "name": "table_def",
            "base": "",
            "fields": [
                {
                    "name": "name",
                    "type": "name"
                },
                {
                    "name": "index_type",
                    "type": "string"
                },
                {
                    "name": "key_names",
                    "type": "string[]"
                },
                {
                    "name": "key_types",
                    "type": "string[]"
                },
                {
                    "name": "type",
                    "type": "string"
                }
            ]
        },
        {
            "name": "clause_pair",
            "base": "",
            "fields": [
                {
                    "name": "id",
                    "type": "string"
                },
                {
                    "name": "body",
                    "type": "string"
                }
            ]
        },
        {
            "name": "error_message",
            "base": "",
            "fields": [
                {
                    "name": "error_code",
                    "type": "uint64"
                },
                {
                    "name": "error_msg",
                    "type": "string"
                }
            ]
        },
        {
            "name": "variant_def",
            "base": "",
            "fields": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "types",
                    "type": "string[]"
                }
            ]
        },
        {
            "name": "abi_def",
            "base": "",
            "fields": [
                {
                    "name": "version",
                    "type": "string"
                },
                {
                    "name": "types",
                    "type": "type_def[]"
                },
                {
                    "name": "structs",
                    "type": "struct_def[]"
                },
                {
                    "name": "actions",
                    "type": "action_def[]"
                },
                {
                    "name": "tables",
                    "type": "table_def[]"
                },
                {
                    "name": "ricardian_clauses",
                    "type": "clause_pair[]"
                },
                {
                    "name": "error_messages",
                    "type": "error_message[]"
                },
                {
                    "name": "abi_extensions",
                    "type": "extensions_entry[]"
                },
                {
                    "name": "variants",
                    "type": "variant_def[]$"
                }
            ]
        }
    ]
}

},{}],53:[function(require,module,exports){
module.exports={
    "version": "eosio::abi/1.0",
    "types": [
        {
            "new_type_name": "account_name",
            "type": "name"
        },
        {
            "new_type_name": "action_name",
            "type": "name"
        },
        {
            "new_type_name": "permission_name",
            "type": "name"
        }
    ],
    "structs": [
        {
            "name": "permission_level",
            "base": "",
            "fields": [
                {
                    "name": "actor",
                    "type": "account_name"
                },
                {
                    "name": "permission",
                    "type": "permission_name"
                }
            ]
        },
        {
            "name": "action",
            "base": "",
            "fields": [
                {
                    "name": "account",
                    "type": "account_name"
                },
                {
                    "name": "name",
                    "type": "action_name"
                },
                {
                    "name": "authorization",
                    "type": "permission_level[]"
                },
                {
                    "name": "data",
                    "type": "bytes"
                }
            ]
        },
        {
            "name": "extension",
            "base": "",
            "fields": [
                {
                    "name": "type",
                    "type": "uint16"
                },
                {
                    "name": "data",
                    "type": "bytes"
                }
            ]
        },
        {
            "name": "transaction_header",
            "base": "",
            "fields": [
                {
                    "name": "expiration",
                    "type": "time_point_sec"
                },
                {
                    "name": "ref_block_num",
                    "type": "uint16"
                },
                {
                    "name": "ref_block_prefix",
                    "type": "uint32"
                },
                {
                    "name": "max_net_usage_words",
                    "type": "varuint32"
                },
                {
                    "name": "max_cpu_usage_ms",
                    "type": "uint8"
                },
                {
                    "name": "delay_sec",
                    "type": "varuint32"
                }
            ]
        },
        {
            "name": "transaction",
            "base": "transaction_header",
            "fields": [
                {
                    "name": "context_free_actions",
                    "type": "action[]"
                },
                {
                    "name": "actions",
                    "type": "action[]"
                },
                {
                    "name": "transaction_extensions",
                    "type": "extension[]"
                }
            ]
        }
    ]
}

},{}],54:[function(require,module,exports){
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
},{}],55:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).PureCache=t()}(this,(function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var i=0;i<t.length;i++){var n=t[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function i(e,i,n){return i&&t(e.prototype,i),n&&t(e,n),e}function n(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function r(e){return e=e||Object.create(null),{on:function(t,i){(e[t]||(e[t]=[])).push(i)},off:function(t,i){e[t]&&e[t].splice(e[t].indexOf(i)>>>0,1)},emit:function(t,i){(e[t]||[]).slice().map((function(e){e(i)})),(e["*"]||[]).slice().map((function(e){e(t,i)}))}}}var s="expiry",o="add",a="get",u="remove",c="clear",h=function(e){if(e)throw new Error("Cannot use disposed instance.")},d={expiryCheckInterval:100},f=function(){function t(){var i=this,r=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};e(this,t),n(this,"expire",(function(){h(i.disposed);for(var e=Date.now(),t=e;t>=i.lastExpiredTime;t-=1){var n=i.queue[t];n&&(delete i.queue[t],n.forEach((function(e){var t=e.key;return(0,e.onExpire)(t)})))}i.lastExpiredTime=e})),this.config=Object.assign({},d,r),this.queue={},this.disposed=!1,this.lastExpiredTime=Date.now()-1;var s=this.config.expiryCheckInterval;this.timer=setInterval(this.expire,s)}return i(t,[{key:"add",value:function(e,t,i){return h(this.disposed),this.queue[e]||(this.queue[e]=[]),this.queue[e].push({key:t,onExpire:i}),!0}},{key:"remove",value:function(e,t){h(this.disposed);var i=this.queue[e];if(i){var n=i.filter((function(e){return e.key!==t}));return n.length?this.queue[e]=n:delete this.queue[e],!0}return!1}},{key:"dispose",value:function(){return h(this.disposed),clearInterval(this.timer),this.timer=null,this.queue={},this.disposed=!0,!0}}]),t}(),l={defaultCacheExpiryIn:6e4,expiryCheckInterval:100};return function(){function t(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:f;e(this,t),this.config=Object.assign({},l,i);var s=r(),o=s.on,a=s.off,u=s.emit,c=[o,a,u];this.on=c[0],this.off=c[1],this.emit=c[2],this.cacheStore={},this.disposed=!1;var h=this.config.expiryCheckInterval;this.cacheExpirer=new n({expiryCheckInterval:h})}return i(t,[{key:"put",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",i=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.config.defaultCacheExpiryIn;h(this.disposed),this.cacheStore[t]&&this.remove(t);var r=Date.now(),a=n?r+n:null,u={value:i,addedAt:r,expiryAt:a};if(this.cacheStore[t]=u,a){var c=function(){e.remove(t),e.emit(s,{key:t,data:e.cacheStore[t]})};this.cacheExpirer.add(a,t,c)}return this.emit(o,{key:t,data:u}),u}},{key:"get",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";h(this.disposed);var t=this.cacheStore[e];return t?(this.emit(a,{key:e,data:t}),t):null}},{key:"remove",value:function(e){h(this.disposed);var t=this.cacheStore[e];if(t){delete this.cacheStore[e];var i=t.expiryAt;return this.cacheExpirer.remove(i,e),this.emit(u,{key:e,data:t}),!0}return!1}},{key:"dispose",value:function(){var e=this;return h(this.disposed),Object.keys(this.cacheStore).forEach((function(t){return e.remove(t)})),this.emit(c,{}),this.cacheExpirer.dispose(),this.disposed=!0,!0}}]),t}()}));


},{}],56:[function(require,module,exports){
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SecureLS", [], factory);
	else if(typeof exports === 'object')
		exports["SecureLS"] = factory();
	else
		root["SecureLS"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _utils = __webpack_require__(1);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _constants = __webpack_require__(2);
	
	var _constants2 = _interopRequireDefault(_constants);
	
	var _encUtf = __webpack_require__(8);
	
	var _encUtf2 = _interopRequireDefault(_encUtf);
	
	var _Base = __webpack_require__(9);
	
	var _Base2 = _interopRequireDefault(_Base);
	
	var _lzString = __webpack_require__(10);
	
	var _lzString2 = _interopRequireDefault(_lzString);
	
	var _aes = __webpack_require__(11);
	
	var _aes2 = _interopRequireDefault(_aes);
	
	var _tripledes = __webpack_require__(16);
	
	var _tripledes2 = _interopRequireDefault(_tripledes);
	
	var _rabbit = __webpack_require__(17);
	
	var _rabbit2 = _interopRequireDefault(_rabbit);
	
	var _rc = __webpack_require__(18);
	
	var _rc2 = _interopRequireDefault(_rc);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SecureLS = function () {
	  function SecureLS(config) {
	    _classCallCheck(this, SecureLS);
	
	    config = config || {};
	    this._name = 'secure-ls';
	    this.utils = _utils2.default;
	    this.constants = _constants2.default;
	    this.Base64 = _Base2.default;
	    this.LZString = _lzString2.default;
	    this.AES = _aes2.default;
	    this.DES = _tripledes2.default;
	    this.RABBIT = _rabbit2.default;
	    this.RC4 = _rc2.default;
	    this.enc = _encUtf2.default;
	
	    this.config = {
	      isCompression: true,
	      encodingType: _constants2.default.EncrytionTypes.BASE64,
	      encryptionSecret: config.encryptionSecret,
	      encryptionNamespace: config.encryptionNamespace
	    };
	    this.config.isCompression = typeof config.isCompression !== 'undefined' ? config.isCompression : true;
	    this.config.encodingType = typeof config.encodingType !== 'undefined' || config.encodingType === '' ? config.encodingType.toLowerCase() : _constants2.default.EncrytionTypes.BASE64;
	
	    this.ls = localStorage;
	    this.init();
	  }
	
	  _createClass(SecureLS, [{
	    key: 'init',
	    value: function init() {
	      var metaData = this.getMetaData();
	
	      this.WarningEnum = this.constants.WarningEnum;
	      this.WarningTypes = this.constants.WarningTypes;
	      this.EncrytionTypes = this.constants.EncrytionTypes;
	
	      this._isBase64 = this._isBase64EncryptionType();
	      this._isAES = this._isAESEncryptionType();
	      this._isDES = this._isDESEncryptionType();
	      this._isRabbit = this._isRabbitEncryptionType();
	      this._isRC4 = this._isRC4EncryptionType();
	      this._isCompression = this._isDataCompressionEnabled();
	
	      // fill the already present keys to the list of keys being used by secure-ls
	      this.utils.allKeys = metaData.keys || this.resetAllKeys();
	    }
	  }, {
	    key: '_isBase64EncryptionType',
	    value: function _isBase64EncryptionType() {
	      return _Base2.default && (typeof this.config.encodingType === 'undefined' || this.config.encodingType === this.constants.EncrytionTypes.BASE64);
	    }
	  }, {
	    key: '_isAESEncryptionType',
	    value: function _isAESEncryptionType() {
	      return _aes2.default && this.config.encodingType === this.constants.EncrytionTypes.AES;
	    }
	  }, {
	    key: '_isDESEncryptionType',
	    value: function _isDESEncryptionType() {
	      return _tripledes2.default && this.config.encodingType === this.constants.EncrytionTypes.DES;
	    }
	  }, {
	    key: '_isRabbitEncryptionType',
	    value: function _isRabbitEncryptionType() {
	      return _rabbit2.default && this.config.encodingType === this.constants.EncrytionTypes.RABBIT;
	    }
	  }, {
	    key: '_isRC4EncryptionType',
	    value: function _isRC4EncryptionType() {
	      return _rc2.default && this.config.encodingType === this.constants.EncrytionTypes.RC4;
	    }
	  }, {
	    key: '_isDataCompressionEnabled',
	    value: function _isDataCompressionEnabled() {
	      return this.config.isCompression;
	    }
	  }, {
	    key: 'getEncryptionSecret',
	    value: function getEncryptionSecret(key) {
	      var metaData = this.getMetaData();
	      var obj = this.utils.getObjectFromKey(metaData.keys, key);
	
	      if (!obj) {
	        return;
	      }
	
	      if (this._isAES || this._isDES || this._isRabbit || this._isRC4) {
	        if (typeof this.config.encryptionSecret === 'undefined') {
	          this.utils.encryptionSecret = obj.s;
	
	          if (!this.utils.encryptionSecret) {
	            this.utils.encryptionSecret = this.utils.generateSecretKey();
	            this.setMetaData();
	          }
	        } else {
	          this.utils.encryptionSecret = this.config.encryptionSecret || obj.s || '';
	        }
	      }
	    }
	  }, {
	    key: 'get',
	    value: function get(key, isAllKeysData) {
	      var decodedData = '',
	          jsonData = '',
	          deCompressedData = void 0,
	          bytes = void 0,
	          data = void 0;
	
	      if (!this.utils.is(key)) {
	        this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED);
	        return jsonData;
	      }
	
	      data = this.getDataFromLocalStorage(key);
	
	      if (!data) {
	        return jsonData;
	      }
	
	      deCompressedData = data; // saves else
	      if (this._isCompression || isAllKeysData) {
	        // meta data always compressed
	        deCompressedData = _lzString2.default.decompressFromUTF16(data);
	      }
	
	      decodedData = deCompressedData; // saves else
	      if (this._isBase64 || isAllKeysData) {
	        // meta data always Base64
	        decodedData = _Base2.default.decode(deCompressedData);
	      } else {
	        this.getEncryptionSecret(key);
	        if (this._isAES) {
	          bytes = _aes2.default.decrypt(deCompressedData.toString(), this.utils.encryptionSecret);
	        } else if (this._isDES) {
	          bytes = _tripledes2.default.decrypt(deCompressedData.toString(), this.utils.encryptionSecret);
	        } else if (this._isRabbit) {
	          bytes = _rabbit2.default.decrypt(deCompressedData.toString(), this.utils.encryptionSecret);
	        } else if (this._isRC4) {
	          bytes = _rc2.default.decrypt(deCompressedData.toString(), this.utils.encryptionSecret);
	        }
	
	        if (bytes) {
	          decodedData = bytes.toString(_encUtf2.default._Utf8);
	        }
	      }
	
	      try {
	        jsonData = JSON.parse(decodedData);
	      } catch (e) {
	        throw new Error('Could not parse JSON');
	      }
	
	      return jsonData;
	    }
	  }, {
	    key: 'getDataFromLocalStorage',
	    value: function getDataFromLocalStorage(key) {
	      return this.ls.getItem(key, true);
	    }
	  }, {
	    key: 'getAllKeys',
	    value: function getAllKeys() {
	      var data = this.getMetaData();
	
	      return this.utils.extractKeyNames(data) || [];
	    }
	  }, {
	    key: 'set',
	    value: function set(key, data) {
	      var dataToStore = '';
	
	      if (!this.utils.is(key)) {
	        this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED);
	        return;
	      }
	
	      this.getEncryptionSecret(key);
	
	      // add key(s) to Array if not already added, only for keys other than meta key
	      if (!(String(key) === String(this.utils.metaKey))) {
	        if (!this.utils.isKeyPresent(key)) {
	          this.utils.addToKeysList(key);
	          this.setMetaData();
	        }
	      }
	
	      dataToStore = this.processData(data);
	      // Store the data to localStorage
	      this.setDataToLocalStorage(key, dataToStore);
	    }
	  }, {
	    key: 'setDataToLocalStorage',
	    value: function setDataToLocalStorage(key, data) {
	      this.ls.setItem(key, data);
	    }
	  }, {
	    key: 'remove',
	    value: function remove(key) {
	      if (!this.utils.is(key)) {
	        this.utils.warn(this.WarningEnum.KEY_NOT_PROVIDED);
	        return;
	      }
	
	      if (key === this.utils.metaKey && this.getAllKeys().length) {
	        this.utils.warn(this.WarningEnum.META_KEY_REMOVE);
	        return;
	      }
	
	      if (this.utils.isKeyPresent(key)) {
	        this.utils.removeFromKeysList(key);
	        this.setMetaData();
	      }
	      this.ls.removeItem(key);
	    }
	  }, {
	    key: 'removeAll',
	    value: function removeAll() {
	      var keys = void 0,
	          i = void 0;
	
	      keys = this.getAllKeys();
	      for (i = 0; i < keys.length; i++) {
	        this.ls.removeItem(keys[i]);
	      }
	      this.ls.removeItem(this.utils.metaKey);
	
	      this.resetAllKeys();
	    }
	  }, {
	    key: 'clear',
	    value: function clear() {
	      this.ls.clear();
	      this.resetAllKeys();
	    }
	  }, {
	    key: 'resetAllKeys',
	    value: function resetAllKeys() {
	      this.utils.allKeys = [];
	      return [];
	    }
	  }, {
	    key: 'processData',
	    value: function processData(data, isAllKeysData) {
	      if (data === null || data === undefined || data === '') {
	        return '';
	      }
	
	      var jsonData = void 0,
	          encodedData = void 0,
	          compressedData = void 0;
	
	      try {
	        jsonData = JSON.stringify(data);
	      } catch (e) {
	        throw new Error('Could not stringify data.');
	      }
	
	      // Encode Based on encoding type
	      // If not set, default to Base64 for securing data
	      encodedData = jsonData;
	      if (this._isBase64 || isAllKeysData) {
	        encodedData = _Base2.default.encode(jsonData);
	      } else {
	        if (this._isAES) {
	          encodedData = _aes2.default.encrypt(jsonData, this.utils.encryptionSecret);
	        } else if (this._isDES) {
	          encodedData = _tripledes2.default.encrypt(jsonData, this.utils.encryptionSecret);
	        } else if (this._isRabbit) {
	          encodedData = _rabbit2.default.encrypt(jsonData, this.utils.encryptionSecret);
	        } else if (this._isRC4) {
	          encodedData = _rc2.default.encrypt(jsonData, this.utils.encryptionSecret);
	        }
	
	        encodedData = encodedData && encodedData.toString();
	      }
	
	      // Compress data if set to true
	      compressedData = encodedData;
	      if (this._isCompression || isAllKeysData) {
	        compressedData = _lzString2.default.compressToUTF16(encodedData);
	      }
	
	      return compressedData;
	    }
	  }, {
	    key: 'setMetaData',
	    value: function setMetaData() {
	      var dataToStore = this.processData({
	        keys: this.utils.allKeys
	      }, true);
	
	      // Store the data to localStorage
	      this.setDataToLocalStorage(this.getMetaKey(), dataToStore);
	    }
	  }, {
	    key: 'getMetaData',
	    value: function getMetaData() {
	      return this.get(this.getMetaKey(), true) || {};
	    }
	  }, {
	    key: 'getMetaKey',
	    value: function getMetaKey() {
	      return this.utils.metaKey + (this.config.encryptionNamespace ? '__' + this.config.encryptionNamespace : '');
	    }
	  }]);
	
	  return SecureLS;
	}();
	
	exports.default = SecureLS;
	;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _constants = __webpack_require__(2);
	
	var _constants2 = _interopRequireDefault(_constants);
	
	var _WordArray = __webpack_require__(3);
	
	var _WordArray2 = _interopRequireDefault(_WordArray);
	
	var _pbkdf = __webpack_require__(4);
	
	var _pbkdf2 = _interopRequireDefault(_pbkdf);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var utils = {
	  metaKey: '_secure__ls__metadata',
	  encryptionSecret: '',
	  secretPhrase: 's3cr3t$#@135^&*246',
	  allKeys: [],
	  is: function is(key) {
	    if (key) {
	      return true;
	    }
	    return false;
	  },
	  warn: function warn(reason) {
	    reason = reason ? reason : _constants2.default.WarningEnum.DEFAULT_TEXT;
	    console.warn(_constants2.default.WarningTypes[reason]);
	  },
	  generateSecretKey: function generateSecretKey() {
	    var salt = _WordArray2.default.random(128 / 8);
	    var key128Bits = (0, _pbkdf2.default)(this.secretPhrase, salt, { keySize: 128 / 32 });
	
	    return key128Bits && key128Bits.toString();
	  },
	  getObjectFromKey: function getObjectFromKey(data, key) {
	    if (!data || !data.length) {
	      return {};
	    }
	
	    var i = void 0,
	        obj = {};
	
	    for (i = 0; i < data.length; i++) {
	      if (data[i].k === key) {
	        obj = data[i];
	        break;
	      }
	    }
	
	    return obj;
	  },
	  extractKeyNames: function extractKeyNames(data) {
	    if (!data || !data.keys || !data.keys.length) {
	      return [];
	    }
	
	    return data.keys.map(function (keyData) {
	      return keyData.k;
	    });
	  },
	  getAllKeys: function getAllKeys() {
	    return this.allKeys;
	  },
	  isKeyPresent: function isKeyPresent(key) {
	    var isKeyAlreadyPresent = false;
	
	    for (var i = 0; i < this.allKeys.length; i++) {
	      if (String(this.allKeys[i].k) === String(key)) {
	        isKeyAlreadyPresent = true; // found
	        break;
	      }
	    }
	
	    return isKeyAlreadyPresent;
	  },
	  addToKeysList: function addToKeysList(key) {
	    this.allKeys.push({
	      k: key,
	      s: this.encryptionSecret
	    });
	  },
	  removeFromKeysList: function removeFromKeysList(key) {
	    var i = void 0,
	        index = -1;
	
	    for (i = 0; i < this.allKeys.length; i++) {
	      if (this.allKeys[i].k === key) {
	        index = i;
	        break;
	      }
	    }
	    if (index !== -1) {
	      this.allKeys.splice(index, 1);
	    }
	    return index;
	  }
	};
	
	module.exports = utils;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	var WarningEnum = {
	  KEY_NOT_PROVIDED: 'keyNotProvided',
	  META_KEY_REMOVE: 'metaKeyRemove',
	  DEFAULT_TEXT: 'defaultText'
	};
	
	var WarningTypes = {};
	
	WarningTypes[WarningEnum.KEY_NOT_PROVIDED] = 'Secure LS: Key not provided. Aborting operation!';
	WarningTypes[WarningEnum.META_KEY_REMOVE] = 'Secure LS: Meta key can not be removed\nunless all keys created by Secure LS are removed!';
	WarningTypes[WarningEnum.DEFAULT_TEXT] = 'Unexpected output';
	
	var constants = {
	  WarningEnum: WarningEnum,
	  WarningTypes: WarningTypes,
	  EncrytionTypes: {
	    BASE64: 'base64',
	    AES: 'aes',
	    DES: 'des',
	    RABBIT: 'rabbit',
	    RC4: 'rc4'
	  }
	};
	
	module.exports = constants;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	/*
	 ES6 compatible port of CryptoJS - WordArray for PBKDF2 password key generation
	
	 Source: https://github.com/brix/crypto-js
	 LICENSE: MIT
	 */
	
	var CryptoJSWordArray = {};
	
	CryptoJSWordArray.random = function (nBytes) {
	  var words = [];
	  var r = function r(mw) {
	    var mz = 0x3ade68b1;
	    var mask = 0xffffffff;
	
	    return function () {
	      mz = 0x9069 * (mz & 0xFFFF) + (mz >> 0x10) & mask;
	      mw = 0x4650 * (mw & 0xFFFF) + (mw >> 0x10) & mask;
	      var result = (mz << 0x10) + mw & mask;
	
	      result /= 0x100000000;
	      result += 0.5;
	      return result * (Math.random() > 0.5 ? 1 : -1);
	    };
	  };
	
	  for (var i = 0, rcache; i < nBytes; i += 4) {
	    var _r = r((rcache || Math.random()) * 0x100000000);
	
	    rcache = _r() * 0x3ade67b7;
	    words.push(_r() * 0x100000000 | 0);
	  }
	
	  return new this.Set(words, nBytes);
	};
	
	CryptoJSWordArray.Set = function (words, sigBytes) {
	  words = this.words = words || [];
	
	  if (sigBytes !== undefined) {
	    this.sigBytes = sigBytes;
	  } else {
	    this.sigBytes = words.length * 8;
	  }
	};
	
	module.exports = CryptoJSWordArray;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(6), __webpack_require__(7));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./sha1", "./hmac"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var Base = C_lib.Base;
		    var WordArray = C_lib.WordArray;
		    var C_algo = C.algo;
		    var SHA1 = C_algo.SHA1;
		    var HMAC = C_algo.HMAC;
	
		    /**
		     * Password-Based Key Derivation Function 2 algorithm.
		     */
		    var PBKDF2 = C_algo.PBKDF2 = Base.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
		         * @property {Hasher} hasher The hasher to use. Default: SHA1
		         * @property {number} iterations The number of iterations to perform. Default: 1
		         */
		        cfg: Base.extend({
		            keySize: 128/32,
		            hasher: SHA1,
		            iterations: 1
		        }),
	
		        /**
		         * Initializes a newly created key derivation function.
		         *
		         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
		         *
		         * @example
		         *
		         *     var kdf = CryptoJS.algo.PBKDF2.create();
		         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
		         *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
		         */
		        init: function (cfg) {
		            this.cfg = this.cfg.extend(cfg);
		        },
	
		        /**
		         * Computes the Password-Based Key Derivation Function 2.
		         *
		         * @param {WordArray|string} password The password.
		         * @param {WordArray|string} salt A salt.
		         *
		         * @return {WordArray} The derived key.
		         *
		         * @example
		         *
		         *     var key = kdf.compute(password, salt);
		         */
		        compute: function (password, salt) {
		            // Shortcut
		            var cfg = this.cfg;
	
		            // Init HMAC
		            var hmac = HMAC.create(cfg.hasher, password);
	
		            // Initial values
		            var derivedKey = WordArray.create();
		            var blockIndex = WordArray.create([0x00000001]);
	
		            // Shortcuts
		            var derivedKeyWords = derivedKey.words;
		            var blockIndexWords = blockIndex.words;
		            var keySize = cfg.keySize;
		            var iterations = cfg.iterations;
	
		            // Generate key
		            while (derivedKeyWords.length < keySize) {
		                var block = hmac.update(salt).finalize(blockIndex);
		                hmac.reset();
	
		                // Shortcuts
		                var blockWords = block.words;
		                var blockWordsLength = blockWords.length;
	
		                // Iterations
		                var intermediate = block;
		                for (var i = 1; i < iterations; i++) {
		                    intermediate = hmac.finalize(intermediate);
		                    hmac.reset();
	
		                    // Shortcut
		                    var intermediateWords = intermediate.words;
	
		                    // XOR intermediate with block
		                    for (var j = 0; j < blockWordsLength; j++) {
		                        blockWords[j] ^= intermediateWords[j];
		                    }
		                }
	
		                derivedKey.concat(block);
		                blockIndexWords[0]++;
		            }
		            derivedKey.sigBytes = keySize * 4;
	
		            return derivedKey;
		        }
		    });
	
		    /**
		     * Computes the Password-Based Key Derivation Function 2.
		     *
		     * @param {WordArray|string} password The password.
		     * @param {WordArray|string} salt A salt.
		     * @param {Object} cfg (Optional) The configuration options to use for this computation.
		     *
		     * @return {WordArray} The derived key.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var key = CryptoJS.PBKDF2(password, salt);
		     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8 });
		     *     var key = CryptoJS.PBKDF2(password, salt, { keySize: 8, iterations: 1000 });
		     */
		    C.PBKDF2 = function (password, salt, cfg) {
		        return PBKDF2.create(cfg).compute(password, salt);
		    };
		}());
	
	
		return CryptoJS.PBKDF2;
	
	}));

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory();
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define([], factory);
		}
		else {
			// Global (browser)
			root.CryptoJS = factory();
		}
	}(this, function () {
	
		/**
		 * CryptoJS core components.
		 */
		var CryptoJS = CryptoJS || (function (Math, undefined) {
		    /*
		     * Local polyfil of Object.create
		     */
		    var create = Object.create || (function () {
		        function F() {};
	
		        return function (obj) {
		            var subtype;
	
		            F.prototype = obj;
	
		            subtype = new F();
	
		            F.prototype = null;
	
		            return subtype;
		        };
		    }())
	
		    /**
		     * CryptoJS namespace.
		     */
		    var C = {};
	
		    /**
		     * Library namespace.
		     */
		    var C_lib = C.lib = {};
	
		    /**
		     * Base object for prototypal inheritance.
		     */
		    var Base = C_lib.Base = (function () {
	
	
		        return {
		            /**
		             * Creates a new object that inherits from this object.
		             *
		             * @param {Object} overrides Properties to copy into the new object.
		             *
		             * @return {Object} The new object.
		             *
		             * @static
		             *
		             * @example
		             *
		             *     var MyType = CryptoJS.lib.Base.extend({
		             *         field: 'value',
		             *
		             *         method: function () {
		             *         }
		             *     });
		             */
		            extend: function (overrides) {
		                // Spawn
		                var subtype = create(this);
	
		                // Augment
		                if (overrides) {
		                    subtype.mixIn(overrides);
		                }
	
		                // Create default initializer
		                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
		                    subtype.init = function () {
		                        subtype.$super.init.apply(this, arguments);
		                    };
		                }
	
		                // Initializer's prototype is the subtype object
		                subtype.init.prototype = subtype;
	
		                // Reference supertype
		                subtype.$super = this;
	
		                return subtype;
		            },
	
		            /**
		             * Extends this object and runs the init method.
		             * Arguments to create() will be passed to init().
		             *
		             * @return {Object} The new object.
		             *
		             * @static
		             *
		             * @example
		             *
		             *     var instance = MyType.create();
		             */
		            create: function () {
		                var instance = this.extend();
		                instance.init.apply(instance, arguments);
	
		                return instance;
		            },
	
		            /**
		             * Initializes a newly created object.
		             * Override this method to add some logic when your objects are created.
		             *
		             * @example
		             *
		             *     var MyType = CryptoJS.lib.Base.extend({
		             *         init: function () {
		             *             // ...
		             *         }
		             *     });
		             */
		            init: function () {
		            },
	
		            /**
		             * Copies properties into this object.
		             *
		             * @param {Object} properties The properties to mix in.
		             *
		             * @example
		             *
		             *     MyType.mixIn({
		             *         field: 'value'
		             *     });
		             */
		            mixIn: function (properties) {
		                for (var propertyName in properties) {
		                    if (properties.hasOwnProperty(propertyName)) {
		                        this[propertyName] = properties[propertyName];
		                    }
		                }
	
		                // IE won't copy toString using the loop above
		                if (properties.hasOwnProperty('toString')) {
		                    this.toString = properties.toString;
		                }
		            },
	
		            /**
		             * Creates a copy of this object.
		             *
		             * @return {Object} The clone.
		             *
		             * @example
		             *
		             *     var clone = instance.clone();
		             */
		            clone: function () {
		                return this.init.prototype.extend(this);
		            }
		        };
		    }());
	
		    /**
		     * An array of 32-bit words.
		     *
		     * @property {Array} words The array of 32-bit words.
		     * @property {number} sigBytes The number of significant bytes in this word array.
		     */
		    var WordArray = C_lib.WordArray = Base.extend({
		        /**
		         * Initializes a newly created word array.
		         *
		         * @param {Array} words (Optional) An array of 32-bit words.
		         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.lib.WordArray.create();
		         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
		         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
		         */
		        init: function (words, sigBytes) {
		            words = this.words = words || [];
	
		            if (sigBytes != undefined) {
		                this.sigBytes = sigBytes;
		            } else {
		                this.sigBytes = words.length * 4;
		            }
		        },
	
		        /**
		         * Converts this word array to a string.
		         *
		         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
		         *
		         * @return {string} The stringified word array.
		         *
		         * @example
		         *
		         *     var string = wordArray + '';
		         *     var string = wordArray.toString();
		         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
		         */
		        toString: function (encoder) {
		            return (encoder || Hex).stringify(this);
		        },
	
		        /**
		         * Concatenates a word array to this word array.
		         *
		         * @param {WordArray} wordArray The word array to append.
		         *
		         * @return {WordArray} This word array.
		         *
		         * @example
		         *
		         *     wordArray1.concat(wordArray2);
		         */
		        concat: function (wordArray) {
		            // Shortcuts
		            var thisWords = this.words;
		            var thatWords = wordArray.words;
		            var thisSigBytes = this.sigBytes;
		            var thatSigBytes = wordArray.sigBytes;
	
		            // Clamp excess bits
		            this.clamp();
	
		            // Concat
		            if (thisSigBytes % 4) {
		                // Copy one byte at a time
		                for (var i = 0; i < thatSigBytes; i++) {
		                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
		                }
		            } else {
		                // Copy one word at a time
		                for (var i = 0; i < thatSigBytes; i += 4) {
		                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
		                }
		            }
		            this.sigBytes += thatSigBytes;
	
		            // Chainable
		            return this;
		        },
	
		        /**
		         * Removes insignificant bits.
		         *
		         * @example
		         *
		         *     wordArray.clamp();
		         */
		        clamp: function () {
		            // Shortcuts
		            var words = this.words;
		            var sigBytes = this.sigBytes;
	
		            // Clamp
		            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
		            words.length = Math.ceil(sigBytes / 4);
		        },
	
		        /**
		         * Creates a copy of this word array.
		         *
		         * @return {WordArray} The clone.
		         *
		         * @example
		         *
		         *     var clone = wordArray.clone();
		         */
		        clone: function () {
		            var clone = Base.clone.call(this);
		            clone.words = this.words.slice(0);
	
		            return clone;
		        },
	
		        /**
		         * Creates a word array filled with random bytes.
		         *
		         * @param {number} nBytes The number of random bytes to generate.
		         *
		         * @return {WordArray} The random word array.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.lib.WordArray.random(16);
		         */
		        random: function (nBytes) {
		            var words = [];
	
		            var r = (function (m_w) {
		                var m_w = m_w;
		                var m_z = 0x3ade68b1;
		                var mask = 0xffffffff;
	
		                return function () {
		                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
		                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
		                    var result = ((m_z << 0x10) + m_w) & mask;
		                    result /= 0x100000000;
		                    result += 0.5;
		                    return result * (Math.random() > .5 ? 1 : -1);
		                }
		            });
	
		            for (var i = 0, rcache; i < nBytes; i += 4) {
		                var _r = r((rcache || Math.random()) * 0x100000000);
	
		                rcache = _r() * 0x3ade67b7;
		                words.push((_r() * 0x100000000) | 0);
		            }
	
		            return new WordArray.init(words, nBytes);
		        }
		    });
	
		    /**
		     * Encoder namespace.
		     */
		    var C_enc = C.enc = {};
	
		    /**
		     * Hex encoding strategy.
		     */
		    var Hex = C_enc.Hex = {
		        /**
		         * Converts a word array to a hex string.
		         *
		         * @param {WordArray} wordArray The word array.
		         *
		         * @return {string} The hex string.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
		         */
		        stringify: function (wordArray) {
		            // Shortcuts
		            var words = wordArray.words;
		            var sigBytes = wordArray.sigBytes;
	
		            // Convert
		            var hexChars = [];
		            for (var i = 0; i < sigBytes; i++) {
		                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		                hexChars.push((bite >>> 4).toString(16));
		                hexChars.push((bite & 0x0f).toString(16));
		            }
	
		            return hexChars.join('');
		        },
	
		        /**
		         * Converts a hex string to a word array.
		         *
		         * @param {string} hexStr The hex string.
		         *
		         * @return {WordArray} The word array.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
		         */
		        parse: function (hexStr) {
		            // Shortcut
		            var hexStrLength = hexStr.length;
	
		            // Convert
		            var words = [];
		            for (var i = 0; i < hexStrLength; i += 2) {
		                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
		            }
	
		            return new WordArray.init(words, hexStrLength / 2);
		        }
		    };
	
		    /**
		     * Latin1 encoding strategy.
		     */
		    var Latin1 = C_enc.Latin1 = {
		        /**
		         * Converts a word array to a Latin1 string.
		         *
		         * @param {WordArray} wordArray The word array.
		         *
		         * @return {string} The Latin1 string.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
		         */
		        stringify: function (wordArray) {
		            // Shortcuts
		            var words = wordArray.words;
		            var sigBytes = wordArray.sigBytes;
	
		            // Convert
		            var latin1Chars = [];
		            for (var i = 0; i < sigBytes; i++) {
		                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
		                latin1Chars.push(String.fromCharCode(bite));
		            }
	
		            return latin1Chars.join('');
		        },
	
		        /**
		         * Converts a Latin1 string to a word array.
		         *
		         * @param {string} latin1Str The Latin1 string.
		         *
		         * @return {WordArray} The word array.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
		         */
		        parse: function (latin1Str) {
		            // Shortcut
		            var latin1StrLength = latin1Str.length;
	
		            // Convert
		            var words = [];
		            for (var i = 0; i < latin1StrLength; i++) {
		                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
		            }
	
		            return new WordArray.init(words, latin1StrLength);
		        }
		    };
	
		    /**
		     * UTF-8 encoding strategy.
		     */
		    var Utf8 = C_enc.Utf8 = {
		        /**
		         * Converts a word array to a UTF-8 string.
		         *
		         * @param {WordArray} wordArray The word array.
		         *
		         * @return {string} The UTF-8 string.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
		         */
		        stringify: function (wordArray) {
		            try {
		                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
		            } catch (e) {
		                throw new Error('Malformed UTF-8 data');
		            }
		        },
	
		        /**
		         * Converts a UTF-8 string to a word array.
		         *
		         * @param {string} utf8Str The UTF-8 string.
		         *
		         * @return {WordArray} The word array.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
		         */
		        parse: function (utf8Str) {
		            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
		        }
		    };
	
		    /**
		     * Abstract buffered block algorithm template.
		     *
		     * The property blockSize must be implemented in a concrete subtype.
		     *
		     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
		     */
		    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
		        /**
		         * Resets this block algorithm's data buffer to its initial state.
		         *
		         * @example
		         *
		         *     bufferedBlockAlgorithm.reset();
		         */
		        reset: function () {
		            // Initial values
		            this._data = new WordArray.init();
		            this._nDataBytes = 0;
		        },
	
		        /**
		         * Adds new data to this block algorithm's buffer.
		         *
		         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
		         *
		         * @example
		         *
		         *     bufferedBlockAlgorithm._append('data');
		         *     bufferedBlockAlgorithm._append(wordArray);
		         */
		        _append: function (data) {
		            // Convert string to WordArray, else assume WordArray already
		            if (typeof data == 'string') {
		                data = Utf8.parse(data);
		            }
	
		            // Append
		            this._data.concat(data);
		            this._nDataBytes += data.sigBytes;
		        },
	
		        /**
		         * Processes available data blocks.
		         *
		         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
		         *
		         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
		         *
		         * @return {WordArray} The processed data.
		         *
		         * @example
		         *
		         *     var processedData = bufferedBlockAlgorithm._process();
		         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
		         */
		        _process: function (doFlush) {
		            // Shortcuts
		            var data = this._data;
		            var dataWords = data.words;
		            var dataSigBytes = data.sigBytes;
		            var blockSize = this.blockSize;
		            var blockSizeBytes = blockSize * 4;
	
		            // Count blocks ready
		            var nBlocksReady = dataSigBytes / blockSizeBytes;
		            if (doFlush) {
		                // Round up to include partial blocks
		                nBlocksReady = Math.ceil(nBlocksReady);
		            } else {
		                // Round down to include only full blocks,
		                // less the number of blocks that must remain in the buffer
		                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
		            }
	
		            // Count words ready
		            var nWordsReady = nBlocksReady * blockSize;
	
		            // Count bytes ready
		            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
	
		            // Process blocks
		            if (nWordsReady) {
		                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
		                    // Perform concrete-algorithm logic
		                    this._doProcessBlock(dataWords, offset);
		                }
	
		                // Remove processed words
		                var processedWords = dataWords.splice(0, nWordsReady);
		                data.sigBytes -= nBytesReady;
		            }
	
		            // Return processed words
		            return new WordArray.init(processedWords, nBytesReady);
		        },
	
		        /**
		         * Creates a copy of this object.
		         *
		         * @return {Object} The clone.
		         *
		         * @example
		         *
		         *     var clone = bufferedBlockAlgorithm.clone();
		         */
		        clone: function () {
		            var clone = Base.clone.call(this);
		            clone._data = this._data.clone();
	
		            return clone;
		        },
	
		        _minBufferSize: 0
		    });
	
		    /**
		     * Abstract hasher template.
		     *
		     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
		     */
		    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
		        /**
		         * Configuration options.
		         */
		        cfg: Base.extend(),
	
		        /**
		         * Initializes a newly created hasher.
		         *
		         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
		         *
		         * @example
		         *
		         *     var hasher = CryptoJS.algo.SHA256.create();
		         */
		        init: function (cfg) {
		            // Apply config defaults
		            this.cfg = this.cfg.extend(cfg);
	
		            // Set initial values
		            this.reset();
		        },
	
		        /**
		         * Resets this hasher to its initial state.
		         *
		         * @example
		         *
		         *     hasher.reset();
		         */
		        reset: function () {
		            // Reset data buffer
		            BufferedBlockAlgorithm.reset.call(this);
	
		            // Perform concrete-hasher logic
		            this._doReset();
		        },
	
		        /**
		         * Updates this hasher with a message.
		         *
		         * @param {WordArray|string} messageUpdate The message to append.
		         *
		         * @return {Hasher} This hasher.
		         *
		         * @example
		         *
		         *     hasher.update('message');
		         *     hasher.update(wordArray);
		         */
		        update: function (messageUpdate) {
		            // Append
		            this._append(messageUpdate);
	
		            // Update the hash
		            this._process();
	
		            // Chainable
		            return this;
		        },
	
		        /**
		         * Finalizes the hash computation.
		         * Note that the finalize operation is effectively a destructive, read-once operation.
		         *
		         * @param {WordArray|string} messageUpdate (Optional) A final message update.
		         *
		         * @return {WordArray} The hash.
		         *
		         * @example
		         *
		         *     var hash = hasher.finalize();
		         *     var hash = hasher.finalize('message');
		         *     var hash = hasher.finalize(wordArray);
		         */
		        finalize: function (messageUpdate) {
		            // Final message update
		            if (messageUpdate) {
		                this._append(messageUpdate);
		            }
	
		            // Perform concrete-hasher logic
		            var hash = this._doFinalize();
	
		            return hash;
		        },
	
		        blockSize: 512/32,
	
		        /**
		         * Creates a shortcut function to a hasher's object interface.
		         *
		         * @param {Hasher} hasher The hasher to create a helper for.
		         *
		         * @return {Function} The shortcut function.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
		         */
		        _createHelper: function (hasher) {
		            return function (message, cfg) {
		                return new hasher.init(cfg).finalize(message);
		            };
		        },
	
		        /**
		         * Creates a shortcut function to the HMAC's object interface.
		         *
		         * @param {Hasher} hasher The hasher to use in this HMAC helper.
		         *
		         * @return {Function} The shortcut function.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
		         */
		        _createHmacHelper: function (hasher) {
		            return function (message, key) {
		                return new C_algo.HMAC.init(hasher, key).finalize(message);
		            };
		        }
		    });
	
		    /**
		     * Algorithm namespace.
		     */
		    var C_algo = C.algo = {};
	
		    return C;
		}(Math));
	
	
		return CryptoJS;
	
	}));

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var WordArray = C_lib.WordArray;
		    var Hasher = C_lib.Hasher;
		    var C_algo = C.algo;
	
		    // Reusable object
		    var W = [];
	
		    /**
		     * SHA-1 hash algorithm.
		     */
		    var SHA1 = C_algo.SHA1 = Hasher.extend({
		        _doReset: function () {
		            this._hash = new WordArray.init([
		                0x67452301, 0xefcdab89,
		                0x98badcfe, 0x10325476,
		                0xc3d2e1f0
		            ]);
		        },
	
		        _doProcessBlock: function (M, offset) {
		            // Shortcut
		            var H = this._hash.words;
	
		            // Working variables
		            var a = H[0];
		            var b = H[1];
		            var c = H[2];
		            var d = H[3];
		            var e = H[4];
	
		            // Computation
		            for (var i = 0; i < 80; i++) {
		                if (i < 16) {
		                    W[i] = M[offset + i] | 0;
		                } else {
		                    var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
		                    W[i] = (n << 1) | (n >>> 31);
		                }
	
		                var t = ((a << 5) | (a >>> 27)) + e + W[i];
		                if (i < 20) {
		                    t += ((b & c) | (~b & d)) + 0x5a827999;
		                } else if (i < 40) {
		                    t += (b ^ c ^ d) + 0x6ed9eba1;
		                } else if (i < 60) {
		                    t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
		                } else /* if (i < 80) */ {
		                    t += (b ^ c ^ d) - 0x359d3e2a;
		                }
	
		                e = d;
		                d = c;
		                c = (b << 30) | (b >>> 2);
		                b = a;
		                a = t;
		            }
	
		            // Intermediate hash value
		            H[0] = (H[0] + a) | 0;
		            H[1] = (H[1] + b) | 0;
		            H[2] = (H[2] + c) | 0;
		            H[3] = (H[3] + d) | 0;
		            H[4] = (H[4] + e) | 0;
		        },
	
		        _doFinalize: function () {
		            // Shortcuts
		            var data = this._data;
		            var dataWords = data.words;
	
		            var nBitsTotal = this._nDataBytes * 8;
		            var nBitsLeft = data.sigBytes * 8;
	
		            // Add padding
		            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
		            data.sigBytes = dataWords.length * 4;
	
		            // Hash final blocks
		            this._process();
	
		            // Return final computed hash
		            return this._hash;
		        },
	
		        clone: function () {
		            var clone = Hasher.clone.call(this);
		            clone._hash = this._hash.clone();
	
		            return clone;
		        }
		    });
	
		    /**
		     * Shortcut function to the hasher's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     *
		     * @return {WordArray} The hash.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hash = CryptoJS.SHA1('message');
		     *     var hash = CryptoJS.SHA1(wordArray);
		     */
		    C.SHA1 = Hasher._createHelper(SHA1);
	
		    /**
		     * Shortcut function to the HMAC's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     * @param {WordArray|string} key The secret key.
		     *
		     * @return {WordArray} The HMAC.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hmac = CryptoJS.HmacSHA1(message, key);
		     */
		    C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
		}());
	
	
		return CryptoJS.SHA1;
	
	}));

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var Base = C_lib.Base;
		    var C_enc = C.enc;
		    var Utf8 = C_enc.Utf8;
		    var C_algo = C.algo;
	
		    /**
		     * HMAC algorithm.
		     */
		    var HMAC = C_algo.HMAC = Base.extend({
		        /**
		         * Initializes a newly created HMAC.
		         *
		         * @param {Hasher} hasher The hash algorithm to use.
		         * @param {WordArray|string} key The secret key.
		         *
		         * @example
		         *
		         *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
		         */
		        init: function (hasher, key) {
		            // Init hasher
		            hasher = this._hasher = new hasher.init();
	
		            // Convert string to WordArray, else assume WordArray already
		            if (typeof key == 'string') {
		                key = Utf8.parse(key);
		            }
	
		            // Shortcuts
		            var hasherBlockSize = hasher.blockSize;
		            var hasherBlockSizeBytes = hasherBlockSize * 4;
	
		            // Allow arbitrary length keys
		            if (key.sigBytes > hasherBlockSizeBytes) {
		                key = hasher.finalize(key);
		            }
	
		            // Clamp excess bits
		            key.clamp();
	
		            // Clone key for inner and outer pads
		            var oKey = this._oKey = key.clone();
		            var iKey = this._iKey = key.clone();
	
		            // Shortcuts
		            var oKeyWords = oKey.words;
		            var iKeyWords = iKey.words;
	
		            // XOR keys with pad constants
		            for (var i = 0; i < hasherBlockSize; i++) {
		                oKeyWords[i] ^= 0x5c5c5c5c;
		                iKeyWords[i] ^= 0x36363636;
		            }
		            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
	
		            // Set initial values
		            this.reset();
		        },
	
		        /**
		         * Resets this HMAC to its initial state.
		         *
		         * @example
		         *
		         *     hmacHasher.reset();
		         */
		        reset: function () {
		            // Shortcut
		            var hasher = this._hasher;
	
		            // Reset
		            hasher.reset();
		            hasher.update(this._iKey);
		        },
	
		        /**
		         * Updates this HMAC with a message.
		         *
		         * @param {WordArray|string} messageUpdate The message to append.
		         *
		         * @return {HMAC} This HMAC instance.
		         *
		         * @example
		         *
		         *     hmacHasher.update('message');
		         *     hmacHasher.update(wordArray);
		         */
		        update: function (messageUpdate) {
		            this._hasher.update(messageUpdate);
	
		            // Chainable
		            return this;
		        },
	
		        /**
		         * Finalizes the HMAC computation.
		         * Note that the finalize operation is effectively a destructive, read-once operation.
		         *
		         * @param {WordArray|string} messageUpdate (Optional) A final message update.
		         *
		         * @return {WordArray} The HMAC.
		         *
		         * @example
		         *
		         *     var hmac = hmacHasher.finalize();
		         *     var hmac = hmacHasher.finalize('message');
		         *     var hmac = hmacHasher.finalize(wordArray);
		         */
		        finalize: function (messageUpdate) {
		            // Shortcut
		            var hasher = this._hasher;
	
		            // Compute HMAC
		            var innerHash = hasher.finalize(messageUpdate);
		            hasher.reset();
		            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));
	
		            return hmac;
		        }
		    });
		}());
	
	
	}));

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	/*
	 ES6 compatible port of CryptoJS - encoding
	
	 Source: https://github.com/brix/crypto-js
	 LICENSE: MIT
	 */
	var enc = {};
	
	enc.Latin1 = {
	  stringify: function stringify(wordArray) {
	    // Shortcuts
	    var words = wordArray.words;
	    var sigBytes = wordArray.sigBytes;
	    var latin1Chars = [],
	        i = void 0,
	        bite = void 0;
	
	    // Convert
	    for (i = 0; i < sigBytes; i++) {
	      bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff;
	      latin1Chars.push(String.fromCharCode(bite));
	    }
	
	    return latin1Chars.join('');
	  }
	};
	
	enc._Utf8 = {
	  stringify: function stringify(wordArray) {
	    try {
	      return decodeURIComponent(escape(enc.Latin1.stringify(wordArray)));
	    } catch (e) {
	      throw new Error('Malformed UTF-8 data');
	    }
	  }
	};
	
	module.exports = enc;

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	var Base64 = {
	  _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
	  encode: function encode(e) {
	    var t = '';
	    var n = void 0,
	        r = void 0,
	        i = void 0,
	        s = void 0,
	        o = void 0,
	        u = void 0,
	        a = void 0;
	    var f = 0;
	
	    e = Base64._utf8Encode(e);
	    while (f < e.length) {
	      n = e.charCodeAt(f++);
	      r = e.charCodeAt(f++);
	      i = e.charCodeAt(f++);
	      s = n >> 2;
	      o = (n & 3) << 4 | r >> 4;
	      u = (r & 15) << 2 | i >> 6;
	      a = i & 63;
	      if (isNaN(r)) {
	        u = a = 64;
	      } else if (isNaN(i)) {
	        a = 64;
	      }
	      t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
	    }
	    return t;
	  },
	  decode: function decode(e) {
	    var t = '';
	    var n = void 0,
	        r = void 0,
	        i = void 0;
	    var s = void 0,
	        o = void 0,
	        u = void 0,
	        a = void 0;
	    var f = 0;
	
	    e = e.replace(/[^A-Za-z0-9\+\/\=]/g, '');
	    while (f < e.length) {
	      s = this._keyStr.indexOf(e.charAt(f++));
	      o = this._keyStr.indexOf(e.charAt(f++));
	      u = this._keyStr.indexOf(e.charAt(f++));
	      a = this._keyStr.indexOf(e.charAt(f++));
	      n = s << 2 | o >> 4;
	      r = (o & 15) << 4 | u >> 2;
	      i = (u & 3) << 6 | a;
	      t = t + String.fromCharCode(n);
	      if (u !== 64) {
	        t = t + String.fromCharCode(r);
	      }
	      if (a !== 64) {
	        t = t + String.fromCharCode(i);
	      }
	    }
	    t = Base64._utf8Decode(t);
	    return t;
	  },
	  _utf8Encode: function _utf8Encode(e) {
	    e = e.replace(/\r\n/g, '\n');
	    var t = '';
	
	    for (var n = 0; n < e.length; n++) {
	      var r = e.charCodeAt(n);
	
	      if (r < 128) {
	        t += String.fromCharCode(r);
	      } else if (r > 127 && r < 2048) {
	        t += String.fromCharCode(r >> 6 | 192);
	        t += String.fromCharCode(r & 63 | 128);
	      } else {
	        t += String.fromCharCode(r >> 12 | 224);
	        t += String.fromCharCode(r >> 6 & 63 | 128);
	        t += String.fromCharCode(r & 63 | 128);
	      }
	    }
	    return t;
	  },
	  _utf8Decode: function _utf8Decode(e) {
	    var t = '';
	    var n = 0;
	    var r = void 0,
	        c2 = void 0,
	        c3 = void 0;
	
	    r = c2 = 0;
	    while (n < e.length) {
	      r = e.charCodeAt(n);
	      if (r < 128) {
	        t += String.fromCharCode(r);
	        n++;
	      } else if (r > 191 && r < 224) {
	        c2 = e.charCodeAt(n + 1);
	        t += String.fromCharCode((r & 31) << 6 | c2 & 63);
	        n += 2;
	      } else {
	        c2 = e.charCodeAt(n + 1);
	        c3 = e.charCodeAt(n + 2);
	        t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
	        n += 3;
	      }
	    }
	    return t;
	  }
	};
	
	module.exports = Base64;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
	// This work is free. You can redistribute it and/or modify it
	// under the terms of the WTFPL, Version 2
	// For more information see LICENSE.txt or http://www.wtfpl.net/
	//
	// For more information, the home page:
	// http://pieroxy.net/blog/pages/lz-string/testing.html
	//
	// LZ-based compression algorithm, version 1.4.4
	var LZString = (function() {
	
	// private property
	var f = String.fromCharCode;
	var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
	var baseReverseDic = {};
	
	function getBaseValue(alphabet, character) {
	  if (!baseReverseDic[alphabet]) {
	    baseReverseDic[alphabet] = {};
	    for (var i=0 ; i<alphabet.length ; i++) {
	      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
	    }
	  }
	  return baseReverseDic[alphabet][character];
	}
	
	var LZString = {
	  compressToBase64 : function (input) {
	    if (input == null) return "";
	    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
	    switch (res.length % 4) { // To produce valid Base64
	    default: // When could this happen ?
	    case 0 : return res;
	    case 1 : return res+"===";
	    case 2 : return res+"==";
	    case 3 : return res+"=";
	    }
	  },
	
	  decompressFromBase64 : function (input) {
	    if (input == null) return "";
	    if (input == "") return null;
	    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
	  },
	
	  compressToUTF16 : function (input) {
	    if (input == null) return "";
	    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
	  },
	
	  decompressFromUTF16: function (compressed) {
	    if (compressed == null) return "";
	    if (compressed == "") return null;
	    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
	  },
	
	  //compress into uint8array (UCS-2 big endian format)
	  compressToUint8Array: function (uncompressed) {
	    var compressed = LZString.compress(uncompressed);
	    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character
	
	    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
	      var current_value = compressed.charCodeAt(i);
	      buf[i*2] = current_value >>> 8;
	      buf[i*2+1] = current_value % 256;
	    }
	    return buf;
	  },
	
	  //decompress from uint8array (UCS-2 big endian format)
	  decompressFromUint8Array:function (compressed) {
	    if (compressed===null || compressed===undefined){
	        return LZString.decompress(compressed);
	    } else {
	        var buf=new Array(compressed.length/2); // 2 bytes per character
	        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
	          buf[i]=compressed[i*2]*256+compressed[i*2+1];
	        }
	
	        var result = [];
	        buf.forEach(function (c) {
	          result.push(f(c));
	        });
	        return LZString.decompress(result.join(''));
	
	    }
	
	  },
	
	
	  //compress into a string that is already URI encoded
	  compressToEncodedURIComponent: function (input) {
	    if (input == null) return "";
	    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
	  },
	
	  //decompress from an output of compressToEncodedURIComponent
	  decompressFromEncodedURIComponent:function (input) {
	    if (input == null) return "";
	    if (input == "") return null;
	    input = input.replace(/ /g, "+");
	    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
	  },
	
	  compress: function (uncompressed) {
	    return LZString._compress(uncompressed, 16, function(a){return f(a);});
	  },
	  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
	    if (uncompressed == null) return "";
	    var i, value,
	        context_dictionary= {},
	        context_dictionaryToCreate= {},
	        context_c="",
	        context_wc="",
	        context_w="",
	        context_enlargeIn= 2, // Compensate for the first entry which should not count
	        context_dictSize= 3,
	        context_numBits= 2,
	        context_data=[],
	        context_data_val=0,
	        context_data_position=0,
	        ii;
	
	    for (ii = 0; ii < uncompressed.length; ii += 1) {
	      context_c = uncompressed.charAt(ii);
	      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
	        context_dictionary[context_c] = context_dictSize++;
	        context_dictionaryToCreate[context_c] = true;
	      }
	
	      context_wc = context_w + context_c;
	      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
	        context_w = context_wc;
	      } else {
	        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
	          if (context_w.charCodeAt(0)<256) {
	            for (i=0 ; i<context_numBits ; i++) {
	              context_data_val = (context_data_val << 1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	            }
	            value = context_w.charCodeAt(0);
	            for (i=0 ; i<8 ; i++) {
	              context_data_val = (context_data_val << 1) | (value&1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = value >> 1;
	            }
	          } else {
	            value = 1;
	            for (i=0 ; i<context_numBits ; i++) {
	              context_data_val = (context_data_val << 1) | value;
	              if (context_data_position ==bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = 0;
	            }
	            value = context_w.charCodeAt(0);
	            for (i=0 ; i<16 ; i++) {
	              context_data_val = (context_data_val << 1) | (value&1);
	              if (context_data_position == bitsPerChar-1) {
	                context_data_position = 0;
	                context_data.push(getCharFromInt(context_data_val));
	                context_data_val = 0;
	              } else {
	                context_data_position++;
	              }
	              value = value >> 1;
	            }
	          }
	          context_enlargeIn--;
	          if (context_enlargeIn == 0) {
	            context_enlargeIn = Math.pow(2, context_numBits);
	            context_numBits++;
	          }
	          delete context_dictionaryToCreate[context_w];
	        } else {
	          value = context_dictionary[context_w];
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	
	
	        }
	        context_enlargeIn--;
	        if (context_enlargeIn == 0) {
	          context_enlargeIn = Math.pow(2, context_numBits);
	          context_numBits++;
	        }
	        // Add wc to the dictionary.
	        context_dictionary[context_wc] = context_dictSize++;
	        context_w = String(context_c);
	      }
	    }
	
	    // Output the code for w.
	    if (context_w !== "") {
	      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
	        if (context_w.charCodeAt(0)<256) {
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	          }
	          value = context_w.charCodeAt(0);
	          for (i=0 ; i<8 ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	        } else {
	          value = 1;
	          for (i=0 ; i<context_numBits ; i++) {
	            context_data_val = (context_data_val << 1) | value;
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = 0;
	          }
	          value = context_w.charCodeAt(0);
	          for (i=0 ; i<16 ; i++) {
	            context_data_val = (context_data_val << 1) | (value&1);
	            if (context_data_position == bitsPerChar-1) {
	              context_data_position = 0;
	              context_data.push(getCharFromInt(context_data_val));
	              context_data_val = 0;
	            } else {
	              context_data_position++;
	            }
	            value = value >> 1;
	          }
	        }
	        context_enlargeIn--;
	        if (context_enlargeIn == 0) {
	          context_enlargeIn = Math.pow(2, context_numBits);
	          context_numBits++;
	        }
	        delete context_dictionaryToCreate[context_w];
	      } else {
	        value = context_dictionary[context_w];
	        for (i=0 ; i<context_numBits ; i++) {
	          context_data_val = (context_data_val << 1) | (value&1);
	          if (context_data_position == bitsPerChar-1) {
	            context_data_position = 0;
	            context_data.push(getCharFromInt(context_data_val));
	            context_data_val = 0;
	          } else {
	            context_data_position++;
	          }
	          value = value >> 1;
	        }
	
	
	      }
	      context_enlargeIn--;
	      if (context_enlargeIn == 0) {
	        context_enlargeIn = Math.pow(2, context_numBits);
	        context_numBits++;
	      }
	    }
	
	    // Mark the end of the stream
	    value = 2;
	    for (i=0 ; i<context_numBits ; i++) {
	      context_data_val = (context_data_val << 1) | (value&1);
	      if (context_data_position == bitsPerChar-1) {
	        context_data_position = 0;
	        context_data.push(getCharFromInt(context_data_val));
	        context_data_val = 0;
	      } else {
	        context_data_position++;
	      }
	      value = value >> 1;
	    }
	
	    // Flush the last char
	    while (true) {
	      context_data_val = (context_data_val << 1);
	      if (context_data_position == bitsPerChar-1) {
	        context_data.push(getCharFromInt(context_data_val));
	        break;
	      }
	      else context_data_position++;
	    }
	    return context_data.join('');
	  },
	
	  decompress: function (compressed) {
	    if (compressed == null) return "";
	    if (compressed == "") return null;
	    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
	  },
	
	  _decompress: function (length, resetValue, getNextValue) {
	    var dictionary = [],
	        next,
	        enlargeIn = 4,
	        dictSize = 4,
	        numBits = 3,
	        entry = "",
	        result = [],
	        i,
	        w,
	        bits, resb, maxpower, power,
	        c,
	        data = {val:getNextValue(0), position:resetValue, index:1};
	
	    for (i = 0; i < 3; i += 1) {
	      dictionary[i] = i;
	    }
	
	    bits = 0;
	    maxpower = Math.pow(2,2);
	    power=1;
	    while (power!=maxpower) {
	      resb = data.val & data.position;
	      data.position >>= 1;
	      if (data.position == 0) {
	        data.position = resetValue;
	        data.val = getNextValue(data.index++);
	      }
	      bits |= (resb>0 ? 1 : 0) * power;
	      power <<= 1;
	    }
	
	    switch (next = bits) {
	      case 0:
	          bits = 0;
	          maxpower = Math.pow(2,8);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	        c = f(bits);
	        break;
	      case 1:
	          bits = 0;
	          maxpower = Math.pow(2,16);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	        c = f(bits);
	        break;
	      case 2:
	        return "";
	    }
	    dictionary[3] = c;
	    w = c;
	    result.push(c);
	    while (true) {
	      if (data.index > length) {
	        return "";
	      }
	
	      bits = 0;
	      maxpower = Math.pow(2,numBits);
	      power=1;
	      while (power!=maxpower) {
	        resb = data.val & data.position;
	        data.position >>= 1;
	        if (data.position == 0) {
	          data.position = resetValue;
	          data.val = getNextValue(data.index++);
	        }
	        bits |= (resb>0 ? 1 : 0) * power;
	        power <<= 1;
	      }
	
	      switch (c = bits) {
	        case 0:
	          bits = 0;
	          maxpower = Math.pow(2,8);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	
	          dictionary[dictSize++] = f(bits);
	          c = dictSize-1;
	          enlargeIn--;
	          break;
	        case 1:
	          bits = 0;
	          maxpower = Math.pow(2,16);
	          power=1;
	          while (power!=maxpower) {
	            resb = data.val & data.position;
	            data.position >>= 1;
	            if (data.position == 0) {
	              data.position = resetValue;
	              data.val = getNextValue(data.index++);
	            }
	            bits |= (resb>0 ? 1 : 0) * power;
	            power <<= 1;
	          }
	          dictionary[dictSize++] = f(bits);
	          c = dictSize-1;
	          enlargeIn--;
	          break;
	        case 2:
	          return result.join('');
	      }
	
	      if (enlargeIn == 0) {
	        enlargeIn = Math.pow(2, numBits);
	        numBits++;
	      }
	
	      if (dictionary[c]) {
	        entry = dictionary[c];
	      } else {
	        if (c === dictSize) {
	          entry = w + w.charAt(0);
	        } else {
	          return null;
	        }
	      }
	      result.push(entry);
	
	      // Add w+entry[0] to the dictionary.
	      dictionary[dictSize++] = w + entry.charAt(0);
	      enlargeIn--;
	
	      w = entry;
	
	      if (enlargeIn == 0) {
	        enlargeIn = Math.pow(2, numBits);
	        numBits++;
	      }
	
	    }
	  }
	};
	  return LZString;
	})();
	
	if (true) {
	  !(__WEBPACK_AMD_DEFINE_RESULT__ = function () { return LZString; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if( typeof module !== 'undefined' && module != null ) {
	  module.exports = LZString
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(12), __webpack_require__(13), __webpack_require__(14), __webpack_require__(15));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var BlockCipher = C_lib.BlockCipher;
		    var C_algo = C.algo;
	
		    // Lookup tables
		    var SBOX = [];
		    var INV_SBOX = [];
		    var SUB_MIX_0 = [];
		    var SUB_MIX_1 = [];
		    var SUB_MIX_2 = [];
		    var SUB_MIX_3 = [];
		    var INV_SUB_MIX_0 = [];
		    var INV_SUB_MIX_1 = [];
		    var INV_SUB_MIX_2 = [];
		    var INV_SUB_MIX_3 = [];
	
		    // Compute lookup tables
		    (function () {
		        // Compute double table
		        var d = [];
		        for (var i = 0; i < 256; i++) {
		            if (i < 128) {
		                d[i] = i << 1;
		            } else {
		                d[i] = (i << 1) ^ 0x11b;
		            }
		        }
	
		        // Walk GF(2^8)
		        var x = 0;
		        var xi = 0;
		        for (var i = 0; i < 256; i++) {
		            // Compute sbox
		            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
		            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
		            SBOX[x] = sx;
		            INV_SBOX[sx] = x;
	
		            // Compute multiplication
		            var x2 = d[x];
		            var x4 = d[x2];
		            var x8 = d[x4];
	
		            // Compute sub bytes, mix columns tables
		            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
		            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
		            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
		            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
		            SUB_MIX_3[x] = t;
	
		            // Compute inv sub bytes, inv mix columns tables
		            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
		            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
		            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
		            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
		            INV_SUB_MIX_3[sx] = t;
	
		            // Compute next counter
		            if (!x) {
		                x = xi = 1;
		            } else {
		                x = x2 ^ d[d[d[x8 ^ x2]]];
		                xi ^= d[d[xi]];
		            }
		        }
		    }());
	
		    // Precomputed Rcon lookup
		    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];
	
		    /**
		     * AES block cipher algorithm.
		     */
		    var AES = C_algo.AES = BlockCipher.extend({
		        _doReset: function () {
		            // Skip reset of nRounds has been set before and key did not change
		            if (this._nRounds && this._keyPriorReset === this._key) {
		                return;
		            }
	
		            // Shortcuts
		            var key = this._keyPriorReset = this._key;
		            var keyWords = key.words;
		            var keySize = key.sigBytes / 4;
	
		            // Compute number of rounds
		            var nRounds = this._nRounds = keySize + 6;
	
		            // Compute number of key schedule rows
		            var ksRows = (nRounds + 1) * 4;
	
		            // Compute key schedule
		            var keySchedule = this._keySchedule = [];
		            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
		                if (ksRow < keySize) {
		                    keySchedule[ksRow] = keyWords[ksRow];
		                } else {
		                    var t = keySchedule[ksRow - 1];
	
		                    if (!(ksRow % keySize)) {
		                        // Rot word
		                        t = (t << 8) | (t >>> 24);
	
		                        // Sub word
		                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
	
		                        // Mix Rcon
		                        t ^= RCON[(ksRow / keySize) | 0] << 24;
		                    } else if (keySize > 6 && ksRow % keySize == 4) {
		                        // Sub word
		                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
		                    }
	
		                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
		                }
		            }
	
		            // Compute inv key schedule
		            var invKeySchedule = this._invKeySchedule = [];
		            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
		                var ksRow = ksRows - invKsRow;
	
		                if (invKsRow % 4) {
		                    var t = keySchedule[ksRow];
		                } else {
		                    var t = keySchedule[ksRow - 4];
		                }
	
		                if (invKsRow < 4 || ksRow <= 4) {
		                    invKeySchedule[invKsRow] = t;
		                } else {
		                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
		                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
		                }
		            }
		        },
	
		        encryptBlock: function (M, offset) {
		            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
		        },
	
		        decryptBlock: function (M, offset) {
		            // Swap 2nd and 4th rows
		            var t = M[offset + 1];
		            M[offset + 1] = M[offset + 3];
		            M[offset + 3] = t;
	
		            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
	
		            // Inv swap 2nd and 4th rows
		            var t = M[offset + 1];
		            M[offset + 1] = M[offset + 3];
		            M[offset + 3] = t;
		        },
	
		        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
		            // Shortcut
		            var nRounds = this._nRounds;
	
		            // Get input, add round key
		            var s0 = M[offset]     ^ keySchedule[0];
		            var s1 = M[offset + 1] ^ keySchedule[1];
		            var s2 = M[offset + 2] ^ keySchedule[2];
		            var s3 = M[offset + 3] ^ keySchedule[3];
	
		            // Key schedule row counter
		            var ksRow = 4;
	
		            // Rounds
		            for (var round = 1; round < nRounds; round++) {
		                // Shift rows, sub bytes, mix columns, add round key
		                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
		                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
		                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
		                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];
	
		                // Update state
		                s0 = t0;
		                s1 = t1;
		                s2 = t2;
		                s3 = t3;
		            }
	
		            // Shift rows, sub bytes, add round key
		            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
		            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
		            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
		            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];
	
		            // Set output
		            M[offset]     = t0;
		            M[offset + 1] = t1;
		            M[offset + 2] = t2;
		            M[offset + 3] = t3;
		        },
	
		        keySize: 256/32
		    });
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
		     */
		    C.AES = BlockCipher._createHelper(AES);
		}());
	
	
		return CryptoJS.AES;
	
	}));

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var WordArray = C_lib.WordArray;
		    var C_enc = C.enc;
	
		    /**
		     * Base64 encoding strategy.
		     */
		    var Base64 = C_enc.Base64 = {
		        /**
		         * Converts a word array to a Base64 string.
		         *
		         * @param {WordArray} wordArray The word array.
		         *
		         * @return {string} The Base64 string.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
		         */
		        stringify: function (wordArray) {
		            // Shortcuts
		            var words = wordArray.words;
		            var sigBytes = wordArray.sigBytes;
		            var map = this._map;
	
		            // Clamp excess bits
		            wordArray.clamp();
	
		            // Convert
		            var base64Chars = [];
		            for (var i = 0; i < sigBytes; i += 3) {
		                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
		                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
		                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;
	
		                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;
	
		                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
		                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
		                }
		            }
	
		            // Add padding
		            var paddingChar = map.charAt(64);
		            if (paddingChar) {
		                while (base64Chars.length % 4) {
		                    base64Chars.push(paddingChar);
		                }
		            }
	
		            return base64Chars.join('');
		        },
	
		        /**
		         * Converts a Base64 string to a word array.
		         *
		         * @param {string} base64Str The Base64 string.
		         *
		         * @return {WordArray} The word array.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
		         */
		        parse: function (base64Str) {
		            // Shortcuts
		            var base64StrLength = base64Str.length;
		            var map = this._map;
		            var reverseMap = this._reverseMap;
	
		            if (!reverseMap) {
		                    reverseMap = this._reverseMap = [];
		                    for (var j = 0; j < map.length; j++) {
		                        reverseMap[map.charCodeAt(j)] = j;
		                    }
		            }
	
		            // Ignore padding
		            var paddingChar = map.charAt(64);
		            if (paddingChar) {
		                var paddingIndex = base64Str.indexOf(paddingChar);
		                if (paddingIndex !== -1) {
		                    base64StrLength = paddingIndex;
		                }
		            }
	
		            // Convert
		            return parseLoop(base64Str, base64StrLength, reverseMap);
	
		        },
	
		        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
		    };
	
		    function parseLoop(base64Str, base64StrLength, reverseMap) {
		      var words = [];
		      var nBytes = 0;
		      for (var i = 0; i < base64StrLength; i++) {
		          if (i % 4) {
		              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
		              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
		              words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
		              nBytes++;
		          }
		      }
		      return WordArray.create(words, nBytes);
		    }
		}());
	
	
		return CryptoJS.enc.Base64;
	
	}));

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function (Math) {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var WordArray = C_lib.WordArray;
		    var Hasher = C_lib.Hasher;
		    var C_algo = C.algo;
	
		    // Constants table
		    var T = [];
	
		    // Compute constants
		    (function () {
		        for (var i = 0; i < 64; i++) {
		            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
		        }
		    }());
	
		    /**
		     * MD5 hash algorithm.
		     */
		    var MD5 = C_algo.MD5 = Hasher.extend({
		        _doReset: function () {
		            this._hash = new WordArray.init([
		                0x67452301, 0xefcdab89,
		                0x98badcfe, 0x10325476
		            ]);
		        },
	
		        _doProcessBlock: function (M, offset) {
		            // Swap endian
		            for (var i = 0; i < 16; i++) {
		                // Shortcuts
		                var offset_i = offset + i;
		                var M_offset_i = M[offset_i];
	
		                M[offset_i] = (
		                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
		                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
		                );
		            }
	
		            // Shortcuts
		            var H = this._hash.words;
	
		            var M_offset_0  = M[offset + 0];
		            var M_offset_1  = M[offset + 1];
		            var M_offset_2  = M[offset + 2];
		            var M_offset_3  = M[offset + 3];
		            var M_offset_4  = M[offset + 4];
		            var M_offset_5  = M[offset + 5];
		            var M_offset_6  = M[offset + 6];
		            var M_offset_7  = M[offset + 7];
		            var M_offset_8  = M[offset + 8];
		            var M_offset_9  = M[offset + 9];
		            var M_offset_10 = M[offset + 10];
		            var M_offset_11 = M[offset + 11];
		            var M_offset_12 = M[offset + 12];
		            var M_offset_13 = M[offset + 13];
		            var M_offset_14 = M[offset + 14];
		            var M_offset_15 = M[offset + 15];
	
		            // Working varialbes
		            var a = H[0];
		            var b = H[1];
		            var c = H[2];
		            var d = H[3];
	
		            // Computation
		            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
		            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
		            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
		            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
		            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
		            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
		            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
		            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
		            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
		            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
		            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
		            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
		            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
		            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
		            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
		            b = FF(b, c, d, a, M_offset_15, 22, T[15]);
	
		            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
		            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
		            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
		            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
		            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
		            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
		            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
		            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
		            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
		            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
		            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
		            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
		            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
		            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
		            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
		            b = GG(b, c, d, a, M_offset_12, 20, T[31]);
	
		            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
		            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
		            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
		            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
		            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
		            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
		            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
		            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
		            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
		            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
		            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
		            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
		            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
		            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
		            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
		            b = HH(b, c, d, a, M_offset_2,  23, T[47]);
	
		            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
		            d = II(d, a, b, c, M_offset_7,  10, T[49]);
		            c = II(c, d, a, b, M_offset_14, 15, T[50]);
		            b = II(b, c, d, a, M_offset_5,  21, T[51]);
		            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
		            d = II(d, a, b, c, M_offset_3,  10, T[53]);
		            c = II(c, d, a, b, M_offset_10, 15, T[54]);
		            b = II(b, c, d, a, M_offset_1,  21, T[55]);
		            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
		            d = II(d, a, b, c, M_offset_15, 10, T[57]);
		            c = II(c, d, a, b, M_offset_6,  15, T[58]);
		            b = II(b, c, d, a, M_offset_13, 21, T[59]);
		            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
		            d = II(d, a, b, c, M_offset_11, 10, T[61]);
		            c = II(c, d, a, b, M_offset_2,  15, T[62]);
		            b = II(b, c, d, a, M_offset_9,  21, T[63]);
	
		            // Intermediate hash value
		            H[0] = (H[0] + a) | 0;
		            H[1] = (H[1] + b) | 0;
		            H[2] = (H[2] + c) | 0;
		            H[3] = (H[3] + d) | 0;
		        },
	
		        _doFinalize: function () {
		            // Shortcuts
		            var data = this._data;
		            var dataWords = data.words;
	
		            var nBitsTotal = this._nDataBytes * 8;
		            var nBitsLeft = data.sigBytes * 8;
	
		            // Add padding
		            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	
		            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
		            var nBitsTotalL = nBitsTotal;
		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
		                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
		                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
		            );
		            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
		                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
		                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
		            );
	
		            data.sigBytes = (dataWords.length + 1) * 4;
	
		            // Hash final blocks
		            this._process();
	
		            // Shortcuts
		            var hash = this._hash;
		            var H = hash.words;
	
		            // Swap endian
		            for (var i = 0; i < 4; i++) {
		                // Shortcut
		                var H_i = H[i];
	
		                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
		                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
		            }
	
		            // Return final computed hash
		            return hash;
		        },
	
		        clone: function () {
		            var clone = Hasher.clone.call(this);
		            clone._hash = this._hash.clone();
	
		            return clone;
		        }
		    });
	
		    function FF(a, b, c, d, x, s, t) {
		        var n = a + ((b & c) | (~b & d)) + x + t;
		        return ((n << s) | (n >>> (32 - s))) + b;
		    }
	
		    function GG(a, b, c, d, x, s, t) {
		        var n = a + ((b & d) | (c & ~d)) + x + t;
		        return ((n << s) | (n >>> (32 - s))) + b;
		    }
	
		    function HH(a, b, c, d, x, s, t) {
		        var n = a + (b ^ c ^ d) + x + t;
		        return ((n << s) | (n >>> (32 - s))) + b;
		    }
	
		    function II(a, b, c, d, x, s, t) {
		        var n = a + (c ^ (b | ~d)) + x + t;
		        return ((n << s) | (n >>> (32 - s))) + b;
		    }
	
		    /**
		     * Shortcut function to the hasher's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     *
		     * @return {WordArray} The hash.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hash = CryptoJS.MD5('message');
		     *     var hash = CryptoJS.MD5(wordArray);
		     */
		    C.MD5 = Hasher._createHelper(MD5);
	
		    /**
		     * Shortcut function to the HMAC's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     * @param {WordArray|string} key The secret key.
		     *
		     * @return {WordArray} The HMAC.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hmac = CryptoJS.HmacMD5(message, key);
		     */
		    C.HmacMD5 = Hasher._createHmacHelper(MD5);
		}(Math));
	
	
		return CryptoJS.MD5;
	
	}));

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(6), __webpack_require__(7));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./sha1", "./hmac"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var Base = C_lib.Base;
		    var WordArray = C_lib.WordArray;
		    var C_algo = C.algo;
		    var MD5 = C_algo.MD5;
	
		    /**
		     * This key derivation function is meant to conform with EVP_BytesToKey.
		     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
		     */
		    var EvpKDF = C_algo.EvpKDF = Base.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
		         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
		         * @property {number} iterations The number of iterations to perform. Default: 1
		         */
		        cfg: Base.extend({
		            keySize: 128/32,
		            hasher: MD5,
		            iterations: 1
		        }),
	
		        /**
		         * Initializes a newly created key derivation function.
		         *
		         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
		         *
		         * @example
		         *
		         *     var kdf = CryptoJS.algo.EvpKDF.create();
		         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
		         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
		         */
		        init: function (cfg) {
		            this.cfg = this.cfg.extend(cfg);
		        },
	
		        /**
		         * Derives a key from a password.
		         *
		         * @param {WordArray|string} password The password.
		         * @param {WordArray|string} salt A salt.
		         *
		         * @return {WordArray} The derived key.
		         *
		         * @example
		         *
		         *     var key = kdf.compute(password, salt);
		         */
		        compute: function (password, salt) {
		            // Shortcut
		            var cfg = this.cfg;
	
		            // Init hasher
		            var hasher = cfg.hasher.create();
	
		            // Initial values
		            var derivedKey = WordArray.create();
	
		            // Shortcuts
		            var derivedKeyWords = derivedKey.words;
		            var keySize = cfg.keySize;
		            var iterations = cfg.iterations;
	
		            // Generate key
		            while (derivedKeyWords.length < keySize) {
		                if (block) {
		                    hasher.update(block);
		                }
		                var block = hasher.update(password).finalize(salt);
		                hasher.reset();
	
		                // Iterations
		                for (var i = 1; i < iterations; i++) {
		                    block = hasher.finalize(block);
		                    hasher.reset();
		                }
	
		                derivedKey.concat(block);
		            }
		            derivedKey.sigBytes = keySize * 4;
	
		            return derivedKey;
		        }
		    });
	
		    /**
		     * Derives a key from a password.
		     *
		     * @param {WordArray|string} password The password.
		     * @param {WordArray|string} salt A salt.
		     * @param {Object} cfg (Optional) The configuration options to use for this computation.
		     *
		     * @return {WordArray} The derived key.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var key = CryptoJS.EvpKDF(password, salt);
		     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
		     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
		     */
		    C.EvpKDF = function (password, salt, cfg) {
		        return EvpKDF.create(cfg).compute(password, salt);
		    };
		}());
	
	
		return CryptoJS.EvpKDF;
	
	}));

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		/**
		 * Cipher core components.
		 */
		CryptoJS.lib.Cipher || (function (undefined) {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var Base = C_lib.Base;
		    var WordArray = C_lib.WordArray;
		    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
		    var C_enc = C.enc;
		    var Utf8 = C_enc.Utf8;
		    var Base64 = C_enc.Base64;
		    var C_algo = C.algo;
		    var EvpKDF = C_algo.EvpKDF;
	
		    /**
		     * Abstract base cipher template.
		     *
		     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
		     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
		     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
		     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
		     */
		    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {WordArray} iv The IV to use for this operation.
		         */
		        cfg: Base.extend(),
	
		        /**
		         * Creates this cipher in encryption mode.
		         *
		         * @param {WordArray} key The key.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {Cipher} A cipher instance.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
		         */
		        createEncryptor: function (key, cfg) {
		            return this.create(this._ENC_XFORM_MODE, key, cfg);
		        },
	
		        /**
		         * Creates this cipher in decryption mode.
		         *
		         * @param {WordArray} key The key.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {Cipher} A cipher instance.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
		         */
		        createDecryptor: function (key, cfg) {
		            return this.create(this._DEC_XFORM_MODE, key, cfg);
		        },
	
		        /**
		         * Initializes a newly created cipher.
		         *
		         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
		         * @param {WordArray} key The key.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @example
		         *
		         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
		         */
		        init: function (xformMode, key, cfg) {
		            // Apply config defaults
		            this.cfg = this.cfg.extend(cfg);
	
		            // Store transform mode and key
		            this._xformMode = xformMode;
		            this._key = key;
	
		            // Set initial values
		            this.reset();
		        },
	
		        /**
		         * Resets this cipher to its initial state.
		         *
		         * @example
		         *
		         *     cipher.reset();
		         */
		        reset: function () {
		            // Reset data buffer
		            BufferedBlockAlgorithm.reset.call(this);
	
		            // Perform concrete-cipher logic
		            this._doReset();
		        },
	
		        /**
		         * Adds data to be encrypted or decrypted.
		         *
		         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
		         *
		         * @return {WordArray} The data after processing.
		         *
		         * @example
		         *
		         *     var encrypted = cipher.process('data');
		         *     var encrypted = cipher.process(wordArray);
		         */
		        process: function (dataUpdate) {
		            // Append
		            this._append(dataUpdate);
	
		            // Process available blocks
		            return this._process();
		        },
	
		        /**
		         * Finalizes the encryption or decryption process.
		         * Note that the finalize operation is effectively a destructive, read-once operation.
		         *
		         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
		         *
		         * @return {WordArray} The data after final processing.
		         *
		         * @example
		         *
		         *     var encrypted = cipher.finalize();
		         *     var encrypted = cipher.finalize('data');
		         *     var encrypted = cipher.finalize(wordArray);
		         */
		        finalize: function (dataUpdate) {
		            // Final data update
		            if (dataUpdate) {
		                this._append(dataUpdate);
		            }
	
		            // Perform concrete-cipher logic
		            var finalProcessedData = this._doFinalize();
	
		            return finalProcessedData;
		        },
	
		        keySize: 128/32,
	
		        ivSize: 128/32,
	
		        _ENC_XFORM_MODE: 1,
	
		        _DEC_XFORM_MODE: 2,
	
		        /**
		         * Creates shortcut functions to a cipher's object interface.
		         *
		         * @param {Cipher} cipher The cipher to create a helper for.
		         *
		         * @return {Object} An object with encrypt and decrypt shortcut functions.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
		         */
		        _createHelper: (function () {
		            function selectCipherStrategy(key) {
		                if (typeof key == 'string') {
		                    return PasswordBasedCipher;
		                } else {
		                    return SerializableCipher;
		                }
		            }
	
		            return function (cipher) {
		                return {
		                    encrypt: function (message, key, cfg) {
		                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
		                    },
	
		                    decrypt: function (ciphertext, key, cfg) {
		                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
		                    }
		                };
		            };
		        }())
		    });
	
		    /**
		     * Abstract base stream cipher template.
		     *
		     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
		     */
		    var StreamCipher = C_lib.StreamCipher = Cipher.extend({
		        _doFinalize: function () {
		            // Process partial blocks
		            var finalProcessedBlocks = this._process(!!'flush');
	
		            return finalProcessedBlocks;
		        },
	
		        blockSize: 1
		    });
	
		    /**
		     * Mode namespace.
		     */
		    var C_mode = C.mode = {};
	
		    /**
		     * Abstract base block cipher mode template.
		     */
		    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
		        /**
		         * Creates this mode for encryption.
		         *
		         * @param {Cipher} cipher A block cipher instance.
		         * @param {Array} iv The IV words.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
		         */
		        createEncryptor: function (cipher, iv) {
		            return this.Encryptor.create(cipher, iv);
		        },
	
		        /**
		         * Creates this mode for decryption.
		         *
		         * @param {Cipher} cipher A block cipher instance.
		         * @param {Array} iv The IV words.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
		         */
		        createDecryptor: function (cipher, iv) {
		            return this.Decryptor.create(cipher, iv);
		        },
	
		        /**
		         * Initializes a newly created mode.
		         *
		         * @param {Cipher} cipher A block cipher instance.
		         * @param {Array} iv The IV words.
		         *
		         * @example
		         *
		         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
		         */
		        init: function (cipher, iv) {
		            this._cipher = cipher;
		            this._iv = iv;
		        }
		    });
	
		    /**
		     * Cipher Block Chaining mode.
		     */
		    var CBC = C_mode.CBC = (function () {
		        /**
		         * Abstract base CBC mode.
		         */
		        var CBC = BlockCipherMode.extend();
	
		        /**
		         * CBC encryptor.
		         */
		        CBC.Encryptor = CBC.extend({
		            /**
		             * Processes the data block at offset.
		             *
		             * @param {Array} words The data words to operate on.
		             * @param {number} offset The offset where the block starts.
		             *
		             * @example
		             *
		             *     mode.processBlock(data.words, offset);
		             */
		            processBlock: function (words, offset) {
		                // Shortcuts
		                var cipher = this._cipher;
		                var blockSize = cipher.blockSize;
	
		                // XOR and encrypt
		                xorBlock.call(this, words, offset, blockSize);
		                cipher.encryptBlock(words, offset);
	
		                // Remember this block to use with next block
		                this._prevBlock = words.slice(offset, offset + blockSize);
		            }
		        });
	
		        /**
		         * CBC decryptor.
		         */
		        CBC.Decryptor = CBC.extend({
		            /**
		             * Processes the data block at offset.
		             *
		             * @param {Array} words The data words to operate on.
		             * @param {number} offset The offset where the block starts.
		             *
		             * @example
		             *
		             *     mode.processBlock(data.words, offset);
		             */
		            processBlock: function (words, offset) {
		                // Shortcuts
		                var cipher = this._cipher;
		                var blockSize = cipher.blockSize;
	
		                // Remember this block to use with next block
		                var thisBlock = words.slice(offset, offset + blockSize);
	
		                // Decrypt and XOR
		                cipher.decryptBlock(words, offset);
		                xorBlock.call(this, words, offset, blockSize);
	
		                // This block becomes the previous block
		                this._prevBlock = thisBlock;
		            }
		        });
	
		        function xorBlock(words, offset, blockSize) {
		            // Shortcut
		            var iv = this._iv;
	
		            // Choose mixing block
		            if (iv) {
		                var block = iv;
	
		                // Remove IV for subsequent blocks
		                this._iv = undefined;
		            } else {
		                var block = this._prevBlock;
		            }
	
		            // XOR blocks
		            for (var i = 0; i < blockSize; i++) {
		                words[offset + i] ^= block[i];
		            }
		        }
	
		        return CBC;
		    }());
	
		    /**
		     * Padding namespace.
		     */
		    var C_pad = C.pad = {};
	
		    /**
		     * PKCS #5/7 padding strategy.
		     */
		    var Pkcs7 = C_pad.Pkcs7 = {
		        /**
		         * Pads data using the algorithm defined in PKCS #5/7.
		         *
		         * @param {WordArray} data The data to pad.
		         * @param {number} blockSize The multiple that the data should be padded to.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
		         */
		        pad: function (data, blockSize) {
		            // Shortcut
		            var blockSizeBytes = blockSize * 4;
	
		            // Count padding bytes
		            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
	
		            // Create padding word
		            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;
	
		            // Create padding
		            var paddingWords = [];
		            for (var i = 0; i < nPaddingBytes; i += 4) {
		                paddingWords.push(paddingWord);
		            }
		            var padding = WordArray.create(paddingWords, nPaddingBytes);
	
		            // Add padding
		            data.concat(padding);
		        },
	
		        /**
		         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
		         *
		         * @param {WordArray} data The data to unpad.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
		         */
		        unpad: function (data) {
		            // Get number of padding bytes from last byte
		            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;
	
		            // Remove padding
		            data.sigBytes -= nPaddingBytes;
		        }
		    };
	
		    /**
		     * Abstract base block cipher template.
		     *
		     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
		     */
		    var BlockCipher = C_lib.BlockCipher = Cipher.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {Mode} mode The block mode to use. Default: CBC
		         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
		         */
		        cfg: Cipher.cfg.extend({
		            mode: CBC,
		            padding: Pkcs7
		        }),
	
		        reset: function () {
		            // Reset cipher
		            Cipher.reset.call(this);
	
		            // Shortcuts
		            var cfg = this.cfg;
		            var iv = cfg.iv;
		            var mode = cfg.mode;
	
		            // Reset block mode
		            if (this._xformMode == this._ENC_XFORM_MODE) {
		                var modeCreator = mode.createEncryptor;
		            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
		                var modeCreator = mode.createDecryptor;
	
		                // Keep at least one block in the buffer for unpadding
		                this._minBufferSize = 1;
		            }
		            this._mode = modeCreator.call(mode, this, iv && iv.words);
		        },
	
		        _doProcessBlock: function (words, offset) {
		            this._mode.processBlock(words, offset);
		        },
	
		        _doFinalize: function () {
		            // Shortcut
		            var padding = this.cfg.padding;
	
		            // Finalize
		            if (this._xformMode == this._ENC_XFORM_MODE) {
		                // Pad data
		                padding.pad(this._data, this.blockSize);
	
		                // Process final blocks
		                var finalProcessedBlocks = this._process(!!'flush');
		            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
		                // Process final blocks
		                var finalProcessedBlocks = this._process(!!'flush');
	
		                // Unpad data
		                padding.unpad(finalProcessedBlocks);
		            }
	
		            return finalProcessedBlocks;
		        },
	
		        blockSize: 128/32
		    });
	
		    /**
		     * A collection of cipher parameters.
		     *
		     * @property {WordArray} ciphertext The raw ciphertext.
		     * @property {WordArray} key The key to this ciphertext.
		     * @property {WordArray} iv The IV used in the ciphering operation.
		     * @property {WordArray} salt The salt used with a key derivation function.
		     * @property {Cipher} algorithm The cipher algorithm.
		     * @property {Mode} mode The block mode used in the ciphering operation.
		     * @property {Padding} padding The padding scheme used in the ciphering operation.
		     * @property {number} blockSize The block size of the cipher.
		     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
		     */
		    var CipherParams = C_lib.CipherParams = Base.extend({
		        /**
		         * Initializes a newly created cipher params object.
		         *
		         * @param {Object} cipherParams An object with any of the possible cipher parameters.
		         *
		         * @example
		         *
		         *     var cipherParams = CryptoJS.lib.CipherParams.create({
		         *         ciphertext: ciphertextWordArray,
		         *         key: keyWordArray,
		         *         iv: ivWordArray,
		         *         salt: saltWordArray,
		         *         algorithm: CryptoJS.algo.AES,
		         *         mode: CryptoJS.mode.CBC,
		         *         padding: CryptoJS.pad.PKCS7,
		         *         blockSize: 4,
		         *         formatter: CryptoJS.format.OpenSSL
		         *     });
		         */
		        init: function (cipherParams) {
		            this.mixIn(cipherParams);
		        },
	
		        /**
		         * Converts this cipher params object to a string.
		         *
		         * @param {Format} formatter (Optional) The formatting strategy to use.
		         *
		         * @return {string} The stringified cipher params.
		         *
		         * @throws Error If neither the formatter nor the default formatter is set.
		         *
		         * @example
		         *
		         *     var string = cipherParams + '';
		         *     var string = cipherParams.toString();
		         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
		         */
		        toString: function (formatter) {
		            return (formatter || this.formatter).stringify(this);
		        }
		    });
	
		    /**
		     * Format namespace.
		     */
		    var C_format = C.format = {};
	
		    /**
		     * OpenSSL formatting strategy.
		     */
		    var OpenSSLFormatter = C_format.OpenSSL = {
		        /**
		         * Converts a cipher params object to an OpenSSL-compatible string.
		         *
		         * @param {CipherParams} cipherParams The cipher params object.
		         *
		         * @return {string} The OpenSSL-compatible string.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
		         */
		        stringify: function (cipherParams) {
		            // Shortcuts
		            var ciphertext = cipherParams.ciphertext;
		            var salt = cipherParams.salt;
	
		            // Format
		            if (salt) {
		                var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
		            } else {
		                var wordArray = ciphertext;
		            }
	
		            return wordArray.toString(Base64);
		        },
	
		        /**
		         * Converts an OpenSSL-compatible string to a cipher params object.
		         *
		         * @param {string} openSSLStr The OpenSSL-compatible string.
		         *
		         * @return {CipherParams} The cipher params object.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
		         */
		        parse: function (openSSLStr) {
		            // Parse base64
		            var ciphertext = Base64.parse(openSSLStr);
	
		            // Shortcut
		            var ciphertextWords = ciphertext.words;
	
		            // Test for salt
		            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
		                // Extract salt
		                var salt = WordArray.create(ciphertextWords.slice(2, 4));
	
		                // Remove salt from ciphertext
		                ciphertextWords.splice(0, 4);
		                ciphertext.sigBytes -= 16;
		            }
	
		            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
		        }
		    };
	
		    /**
		     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
		     */
		    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
		         */
		        cfg: Base.extend({
		            format: OpenSSLFormatter
		        }),
	
		        /**
		         * Encrypts a message.
		         *
		         * @param {Cipher} cipher The cipher algorithm to use.
		         * @param {WordArray|string} message The message to encrypt.
		         * @param {WordArray} key The key.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {CipherParams} A cipher params object.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
		         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
		         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
		         */
		        encrypt: function (cipher, message, key, cfg) {
		            // Apply config defaults
		            cfg = this.cfg.extend(cfg);
	
		            // Encrypt
		            var encryptor = cipher.createEncryptor(key, cfg);
		            var ciphertext = encryptor.finalize(message);
	
		            // Shortcut
		            var cipherCfg = encryptor.cfg;
	
		            // Create and return serializable cipher params
		            return CipherParams.create({
		                ciphertext: ciphertext,
		                key: key,
		                iv: cipherCfg.iv,
		                algorithm: cipher,
		                mode: cipherCfg.mode,
		                padding: cipherCfg.padding,
		                blockSize: cipher.blockSize,
		                formatter: cfg.format
		            });
		        },
	
		        /**
		         * Decrypts serialized ciphertext.
		         *
		         * @param {Cipher} cipher The cipher algorithm to use.
		         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
		         * @param {WordArray} key The key.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {WordArray} The plaintext.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
		         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
		         */
		        decrypt: function (cipher, ciphertext, key, cfg) {
		            // Apply config defaults
		            cfg = this.cfg.extend(cfg);
	
		            // Convert string to CipherParams
		            ciphertext = this._parse(ciphertext, cfg.format);
	
		            // Decrypt
		            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
	
		            return plaintext;
		        },
	
		        /**
		         * Converts serialized ciphertext to CipherParams,
		         * else assumed CipherParams already and returns ciphertext unchanged.
		         *
		         * @param {CipherParams|string} ciphertext The ciphertext.
		         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
		         *
		         * @return {CipherParams} The unserialized ciphertext.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
		         */
		        _parse: function (ciphertext, format) {
		            if (typeof ciphertext == 'string') {
		                return format.parse(ciphertext, this);
		            } else {
		                return ciphertext;
		            }
		        }
		    });
	
		    /**
		     * Key derivation function namespace.
		     */
		    var C_kdf = C.kdf = {};
	
		    /**
		     * OpenSSL key derivation function.
		     */
		    var OpenSSLKdf = C_kdf.OpenSSL = {
		        /**
		         * Derives a key and IV from a password.
		         *
		         * @param {string} password The password to derive from.
		         * @param {number} keySize The size in words of the key to generate.
		         * @param {number} ivSize The size in words of the IV to generate.
		         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
		         *
		         * @return {CipherParams} A cipher params object with the key, IV, and salt.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
		         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
		         */
		        execute: function (password, keySize, ivSize, salt) {
		            // Generate random salt
		            if (!salt) {
		                salt = WordArray.random(64/8);
		            }
	
		            // Derive key and IV
		            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
	
		            // Separate key and IV
		            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
		            key.sigBytes = keySize * 4;
	
		            // Return params
		            return CipherParams.create({ key: key, iv: iv, salt: salt });
		        }
		    };
	
		    /**
		     * A serializable cipher wrapper that derives the key from a password,
		     * and returns ciphertext as a serializable cipher params object.
		     */
		    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
		         */
		        cfg: SerializableCipher.cfg.extend({
		            kdf: OpenSSLKdf
		        }),
	
		        /**
		         * Encrypts a message using a password.
		         *
		         * @param {Cipher} cipher The cipher algorithm to use.
		         * @param {WordArray|string} message The message to encrypt.
		         * @param {string} password The password.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {CipherParams} A cipher params object.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
		         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
		         */
		        encrypt: function (cipher, message, password, cfg) {
		            // Apply config defaults
		            cfg = this.cfg.extend(cfg);
	
		            // Derive key and other params
		            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);
	
		            // Add IV to config
		            cfg.iv = derivedParams.iv;
	
		            // Encrypt
		            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
	
		            // Mix in derived params
		            ciphertext.mixIn(derivedParams);
	
		            return ciphertext;
		        },
	
		        /**
		         * Decrypts serialized ciphertext using a password.
		         *
		         * @param {Cipher} cipher The cipher algorithm to use.
		         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
		         * @param {string} password The password.
		         * @param {Object} cfg (Optional) The configuration options to use for this operation.
		         *
		         * @return {WordArray} The plaintext.
		         *
		         * @static
		         *
		         * @example
		         *
		         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
		         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
		         */
		        decrypt: function (cipher, ciphertext, password, cfg) {
		            // Apply config defaults
		            cfg = this.cfg.extend(cfg);
	
		            // Convert string to CipherParams
		            ciphertext = this._parse(ciphertext, cfg.format);
	
		            // Derive key and other params
		            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);
	
		            // Add IV to config
		            cfg.iv = derivedParams.iv;
	
		            // Decrypt
		            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
	
		            return plaintext;
		        }
		    });
		}());
	
	
	}));

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(12), __webpack_require__(13), __webpack_require__(14), __webpack_require__(15));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var WordArray = C_lib.WordArray;
		    var BlockCipher = C_lib.BlockCipher;
		    var C_algo = C.algo;
	
		    // Permuted Choice 1 constants
		    var PC1 = [
		        57, 49, 41, 33, 25, 17, 9,  1,
		        58, 50, 42, 34, 26, 18, 10, 2,
		        59, 51, 43, 35, 27, 19, 11, 3,
		        60, 52, 44, 36, 63, 55, 47, 39,
		        31, 23, 15, 7,  62, 54, 46, 38,
		        30, 22, 14, 6,  61, 53, 45, 37,
		        29, 21, 13, 5,  28, 20, 12, 4
		    ];
	
		    // Permuted Choice 2 constants
		    var PC2 = [
		        14, 17, 11, 24, 1,  5,
		        3,  28, 15, 6,  21, 10,
		        23, 19, 12, 4,  26, 8,
		        16, 7,  27, 20, 13, 2,
		        41, 52, 31, 37, 47, 55,
		        30, 40, 51, 45, 33, 48,
		        44, 49, 39, 56, 34, 53,
		        46, 42, 50, 36, 29, 32
		    ];
	
		    // Cumulative bit shift constants
		    var BIT_SHIFTS = [1,  2,  4,  6,  8,  10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
	
		    // SBOXes and round permutation constants
		    var SBOX_P = [
		        {
		            0x0: 0x808200,
		            0x10000000: 0x8000,
		            0x20000000: 0x808002,
		            0x30000000: 0x2,
		            0x40000000: 0x200,
		            0x50000000: 0x808202,
		            0x60000000: 0x800202,
		            0x70000000: 0x800000,
		            0x80000000: 0x202,
		            0x90000000: 0x800200,
		            0xa0000000: 0x8200,
		            0xb0000000: 0x808000,
		            0xc0000000: 0x8002,
		            0xd0000000: 0x800002,
		            0xe0000000: 0x0,
		            0xf0000000: 0x8202,
		            0x8000000: 0x0,
		            0x18000000: 0x808202,
		            0x28000000: 0x8202,
		            0x38000000: 0x8000,
		            0x48000000: 0x808200,
		            0x58000000: 0x200,
		            0x68000000: 0x808002,
		            0x78000000: 0x2,
		            0x88000000: 0x800200,
		            0x98000000: 0x8200,
		            0xa8000000: 0x808000,
		            0xb8000000: 0x800202,
		            0xc8000000: 0x800002,
		            0xd8000000: 0x8002,
		            0xe8000000: 0x202,
		            0xf8000000: 0x800000,
		            0x1: 0x8000,
		            0x10000001: 0x2,
		            0x20000001: 0x808200,
		            0x30000001: 0x800000,
		            0x40000001: 0x808002,
		            0x50000001: 0x8200,
		            0x60000001: 0x200,
		            0x70000001: 0x800202,
		            0x80000001: 0x808202,
		            0x90000001: 0x808000,
		            0xa0000001: 0x800002,
		            0xb0000001: 0x8202,
		            0xc0000001: 0x202,
		            0xd0000001: 0x800200,
		            0xe0000001: 0x8002,
		            0xf0000001: 0x0,
		            0x8000001: 0x808202,
		            0x18000001: 0x808000,
		            0x28000001: 0x800000,
		            0x38000001: 0x200,
		            0x48000001: 0x8000,
		            0x58000001: 0x800002,
		            0x68000001: 0x2,
		            0x78000001: 0x8202,
		            0x88000001: 0x8002,
		            0x98000001: 0x800202,
		            0xa8000001: 0x202,
		            0xb8000001: 0x808200,
		            0xc8000001: 0x800200,
		            0xd8000001: 0x0,
		            0xe8000001: 0x8200,
		            0xf8000001: 0x808002
		        },
		        {
		            0x0: 0x40084010,
		            0x1000000: 0x4000,
		            0x2000000: 0x80000,
		            0x3000000: 0x40080010,
		            0x4000000: 0x40000010,
		            0x5000000: 0x40084000,
		            0x6000000: 0x40004000,
		            0x7000000: 0x10,
		            0x8000000: 0x84000,
		            0x9000000: 0x40004010,
		            0xa000000: 0x40000000,
		            0xb000000: 0x84010,
		            0xc000000: 0x80010,
		            0xd000000: 0x0,
		            0xe000000: 0x4010,
		            0xf000000: 0x40080000,
		            0x800000: 0x40004000,
		            0x1800000: 0x84010,
		            0x2800000: 0x10,
		            0x3800000: 0x40004010,
		            0x4800000: 0x40084010,
		            0x5800000: 0x40000000,
		            0x6800000: 0x80000,
		            0x7800000: 0x40080010,
		            0x8800000: 0x80010,
		            0x9800000: 0x0,
		            0xa800000: 0x4000,
		            0xb800000: 0x40080000,
		            0xc800000: 0x40000010,
		            0xd800000: 0x84000,
		            0xe800000: 0x40084000,
		            0xf800000: 0x4010,
		            0x10000000: 0x0,
		            0x11000000: 0x40080010,
		            0x12000000: 0x40004010,
		            0x13000000: 0x40084000,
		            0x14000000: 0x40080000,
		            0x15000000: 0x10,
		            0x16000000: 0x84010,
		            0x17000000: 0x4000,
		            0x18000000: 0x4010,
		            0x19000000: 0x80000,
		            0x1a000000: 0x80010,
		            0x1b000000: 0x40000010,
		            0x1c000000: 0x84000,
		            0x1d000000: 0x40004000,
		            0x1e000000: 0x40000000,
		            0x1f000000: 0x40084010,
		            0x10800000: 0x84010,
		            0x11800000: 0x80000,
		            0x12800000: 0x40080000,
		            0x13800000: 0x4000,
		            0x14800000: 0x40004000,
		            0x15800000: 0x40084010,
		            0x16800000: 0x10,
		            0x17800000: 0x40000000,
		            0x18800000: 0x40084000,
		            0x19800000: 0x40000010,
		            0x1a800000: 0x40004010,
		            0x1b800000: 0x80010,
		            0x1c800000: 0x0,
		            0x1d800000: 0x4010,
		            0x1e800000: 0x40080010,
		            0x1f800000: 0x84000
		        },
		        {
		            0x0: 0x104,
		            0x100000: 0x0,
		            0x200000: 0x4000100,
		            0x300000: 0x10104,
		            0x400000: 0x10004,
		            0x500000: 0x4000004,
		            0x600000: 0x4010104,
		            0x700000: 0x4010000,
		            0x800000: 0x4000000,
		            0x900000: 0x4010100,
		            0xa00000: 0x10100,
		            0xb00000: 0x4010004,
		            0xc00000: 0x4000104,
		            0xd00000: 0x10000,
		            0xe00000: 0x4,
		            0xf00000: 0x100,
		            0x80000: 0x4010100,
		            0x180000: 0x4010004,
		            0x280000: 0x0,
		            0x380000: 0x4000100,
		            0x480000: 0x4000004,
		            0x580000: 0x10000,
		            0x680000: 0x10004,
		            0x780000: 0x104,
		            0x880000: 0x4,
		            0x980000: 0x100,
		            0xa80000: 0x4010000,
		            0xb80000: 0x10104,
		            0xc80000: 0x10100,
		            0xd80000: 0x4000104,
		            0xe80000: 0x4010104,
		            0xf80000: 0x4000000,
		            0x1000000: 0x4010100,
		            0x1100000: 0x10004,
		            0x1200000: 0x10000,
		            0x1300000: 0x4000100,
		            0x1400000: 0x100,
		            0x1500000: 0x4010104,
		            0x1600000: 0x4000004,
		            0x1700000: 0x0,
		            0x1800000: 0x4000104,
		            0x1900000: 0x4000000,
		            0x1a00000: 0x4,
		            0x1b00000: 0x10100,
		            0x1c00000: 0x4010000,
		            0x1d00000: 0x104,
		            0x1e00000: 0x10104,
		            0x1f00000: 0x4010004,
		            0x1080000: 0x4000000,
		            0x1180000: 0x104,
		            0x1280000: 0x4010100,
		            0x1380000: 0x0,
		            0x1480000: 0x10004,
		            0x1580000: 0x4000100,
		            0x1680000: 0x100,
		            0x1780000: 0x4010004,
		            0x1880000: 0x10000,
		            0x1980000: 0x4010104,
		            0x1a80000: 0x10104,
		            0x1b80000: 0x4000004,
		            0x1c80000: 0x4000104,
		            0x1d80000: 0x4010000,
		            0x1e80000: 0x4,
		            0x1f80000: 0x10100
		        },
		        {
		            0x0: 0x80401000,
		            0x10000: 0x80001040,
		            0x20000: 0x401040,
		            0x30000: 0x80400000,
		            0x40000: 0x0,
		            0x50000: 0x401000,
		            0x60000: 0x80000040,
		            0x70000: 0x400040,
		            0x80000: 0x80000000,
		            0x90000: 0x400000,
		            0xa0000: 0x40,
		            0xb0000: 0x80001000,
		            0xc0000: 0x80400040,
		            0xd0000: 0x1040,
		            0xe0000: 0x1000,
		            0xf0000: 0x80401040,
		            0x8000: 0x80001040,
		            0x18000: 0x40,
		            0x28000: 0x80400040,
		            0x38000: 0x80001000,
		            0x48000: 0x401000,
		            0x58000: 0x80401040,
		            0x68000: 0x0,
		            0x78000: 0x80400000,
		            0x88000: 0x1000,
		            0x98000: 0x80401000,
		            0xa8000: 0x400000,
		            0xb8000: 0x1040,
		            0xc8000: 0x80000000,
		            0xd8000: 0x400040,
		            0xe8000: 0x401040,
		            0xf8000: 0x80000040,
		            0x100000: 0x400040,
		            0x110000: 0x401000,
		            0x120000: 0x80000040,
		            0x130000: 0x0,
		            0x140000: 0x1040,
		            0x150000: 0x80400040,
		            0x160000: 0x80401000,
		            0x170000: 0x80001040,
		            0x180000: 0x80401040,
		            0x190000: 0x80000000,
		            0x1a0000: 0x80400000,
		            0x1b0000: 0x401040,
		            0x1c0000: 0x80001000,
		            0x1d0000: 0x400000,
		            0x1e0000: 0x40,
		            0x1f0000: 0x1000,
		            0x108000: 0x80400000,
		            0x118000: 0x80401040,
		            0x128000: 0x0,
		            0x138000: 0x401000,
		            0x148000: 0x400040,
		            0x158000: 0x80000000,
		            0x168000: 0x80001040,
		            0x178000: 0x40,
		            0x188000: 0x80000040,
		            0x198000: 0x1000,
		            0x1a8000: 0x80001000,
		            0x1b8000: 0x80400040,
		            0x1c8000: 0x1040,
		            0x1d8000: 0x80401000,
		            0x1e8000: 0x400000,
		            0x1f8000: 0x401040
		        },
		        {
		            0x0: 0x80,
		            0x1000: 0x1040000,
		            0x2000: 0x40000,
		            0x3000: 0x20000000,
		            0x4000: 0x20040080,
		            0x5000: 0x1000080,
		            0x6000: 0x21000080,
		            0x7000: 0x40080,
		            0x8000: 0x1000000,
		            0x9000: 0x20040000,
		            0xa000: 0x20000080,
		            0xb000: 0x21040080,
		            0xc000: 0x21040000,
		            0xd000: 0x0,
		            0xe000: 0x1040080,
		            0xf000: 0x21000000,
		            0x800: 0x1040080,
		            0x1800: 0x21000080,
		            0x2800: 0x80,
		            0x3800: 0x1040000,
		            0x4800: 0x40000,
		            0x5800: 0x20040080,
		            0x6800: 0x21040000,
		            0x7800: 0x20000000,
		            0x8800: 0x20040000,
		            0x9800: 0x0,
		            0xa800: 0x21040080,
		            0xb800: 0x1000080,
		            0xc800: 0x20000080,
		            0xd800: 0x21000000,
		            0xe800: 0x1000000,
		            0xf800: 0x40080,
		            0x10000: 0x40000,
		            0x11000: 0x80,
		            0x12000: 0x20000000,
		            0x13000: 0x21000080,
		            0x14000: 0x1000080,
		            0x15000: 0x21040000,
		            0x16000: 0x20040080,
		            0x17000: 0x1000000,
		            0x18000: 0x21040080,
		            0x19000: 0x21000000,
		            0x1a000: 0x1040000,
		            0x1b000: 0x20040000,
		            0x1c000: 0x40080,
		            0x1d000: 0x20000080,
		            0x1e000: 0x0,
		            0x1f000: 0x1040080,
		            0x10800: 0x21000080,
		            0x11800: 0x1000000,
		            0x12800: 0x1040000,
		            0x13800: 0x20040080,
		            0x14800: 0x20000000,
		            0x15800: 0x1040080,
		            0x16800: 0x80,
		            0x17800: 0x21040000,
		            0x18800: 0x40080,
		            0x19800: 0x21040080,
		            0x1a800: 0x0,
		            0x1b800: 0x21000000,
		            0x1c800: 0x1000080,
		            0x1d800: 0x40000,
		            0x1e800: 0x20040000,
		            0x1f800: 0x20000080
		        },
		        {
		            0x0: 0x10000008,
		            0x100: 0x2000,
		            0x200: 0x10200000,
		            0x300: 0x10202008,
		            0x400: 0x10002000,
		            0x500: 0x200000,
		            0x600: 0x200008,
		            0x700: 0x10000000,
		            0x800: 0x0,
		            0x900: 0x10002008,
		            0xa00: 0x202000,
		            0xb00: 0x8,
		            0xc00: 0x10200008,
		            0xd00: 0x202008,
		            0xe00: 0x2008,
		            0xf00: 0x10202000,
		            0x80: 0x10200000,
		            0x180: 0x10202008,
		            0x280: 0x8,
		            0x380: 0x200000,
		            0x480: 0x202008,
		            0x580: 0x10000008,
		            0x680: 0x10002000,
		            0x780: 0x2008,
		            0x880: 0x200008,
		            0x980: 0x2000,
		            0xa80: 0x10002008,
		            0xb80: 0x10200008,
		            0xc80: 0x0,
		            0xd80: 0x10202000,
		            0xe80: 0x202000,
		            0xf80: 0x10000000,
		            0x1000: 0x10002000,
		            0x1100: 0x10200008,
		            0x1200: 0x10202008,
		            0x1300: 0x2008,
		            0x1400: 0x200000,
		            0x1500: 0x10000000,
		            0x1600: 0x10000008,
		            0x1700: 0x202000,
		            0x1800: 0x202008,
		            0x1900: 0x0,
		            0x1a00: 0x8,
		            0x1b00: 0x10200000,
		            0x1c00: 0x2000,
		            0x1d00: 0x10002008,
		            0x1e00: 0x10202000,
		            0x1f00: 0x200008,
		            0x1080: 0x8,
		            0x1180: 0x202000,
		            0x1280: 0x200000,
		            0x1380: 0x10000008,
		            0x1480: 0x10002000,
		            0x1580: 0x2008,
		            0x1680: 0x10202008,
		            0x1780: 0x10200000,
		            0x1880: 0x10202000,
		            0x1980: 0x10200008,
		            0x1a80: 0x2000,
		            0x1b80: 0x202008,
		            0x1c80: 0x200008,
		            0x1d80: 0x0,
		            0x1e80: 0x10000000,
		            0x1f80: 0x10002008
		        },
		        {
		            0x0: 0x100000,
		            0x10: 0x2000401,
		            0x20: 0x400,
		            0x30: 0x100401,
		            0x40: 0x2100401,
		            0x50: 0x0,
		            0x60: 0x1,
		            0x70: 0x2100001,
		            0x80: 0x2000400,
		            0x90: 0x100001,
		            0xa0: 0x2000001,
		            0xb0: 0x2100400,
		            0xc0: 0x2100000,
		            0xd0: 0x401,
		            0xe0: 0x100400,
		            0xf0: 0x2000000,
		            0x8: 0x2100001,
		            0x18: 0x0,
		            0x28: 0x2000401,
		            0x38: 0x2100400,
		            0x48: 0x100000,
		            0x58: 0x2000001,
		            0x68: 0x2000000,
		            0x78: 0x401,
		            0x88: 0x100401,
		            0x98: 0x2000400,
		            0xa8: 0x2100000,
		            0xb8: 0x100001,
		            0xc8: 0x400,
		            0xd8: 0x2100401,
		            0xe8: 0x1,
		            0xf8: 0x100400,
		            0x100: 0x2000000,
		            0x110: 0x100000,
		            0x120: 0x2000401,
		            0x130: 0x2100001,
		            0x140: 0x100001,
		            0x150: 0x2000400,
		            0x160: 0x2100400,
		            0x170: 0x100401,
		            0x180: 0x401,
		            0x190: 0x2100401,
		            0x1a0: 0x100400,
		            0x1b0: 0x1,
		            0x1c0: 0x0,
		            0x1d0: 0x2100000,
		            0x1e0: 0x2000001,
		            0x1f0: 0x400,
		            0x108: 0x100400,
		            0x118: 0x2000401,
		            0x128: 0x2100001,
		            0x138: 0x1,
		            0x148: 0x2000000,
		            0x158: 0x100000,
		            0x168: 0x401,
		            0x178: 0x2100400,
		            0x188: 0x2000001,
		            0x198: 0x2100000,
		            0x1a8: 0x0,
		            0x1b8: 0x2100401,
		            0x1c8: 0x100401,
		            0x1d8: 0x400,
		            0x1e8: 0x2000400,
		            0x1f8: 0x100001
		        },
		        {
		            0x0: 0x8000820,
		            0x1: 0x20000,
		            0x2: 0x8000000,
		            0x3: 0x20,
		            0x4: 0x20020,
		            0x5: 0x8020820,
		            0x6: 0x8020800,
		            0x7: 0x800,
		            0x8: 0x8020000,
		            0x9: 0x8000800,
		            0xa: 0x20800,
		            0xb: 0x8020020,
		            0xc: 0x820,
		            0xd: 0x0,
		            0xe: 0x8000020,
		            0xf: 0x20820,
		            0x80000000: 0x800,
		            0x80000001: 0x8020820,
		            0x80000002: 0x8000820,
		            0x80000003: 0x8000000,
		            0x80000004: 0x8020000,
		            0x80000005: 0x20800,
		            0x80000006: 0x20820,
		            0x80000007: 0x20,
		            0x80000008: 0x8000020,
		            0x80000009: 0x820,
		            0x8000000a: 0x20020,
		            0x8000000b: 0x8020800,
		            0x8000000c: 0x0,
		            0x8000000d: 0x8020020,
		            0x8000000e: 0x8000800,
		            0x8000000f: 0x20000,
		            0x10: 0x20820,
		            0x11: 0x8020800,
		            0x12: 0x20,
		            0x13: 0x800,
		            0x14: 0x8000800,
		            0x15: 0x8000020,
		            0x16: 0x8020020,
		            0x17: 0x20000,
		            0x18: 0x0,
		            0x19: 0x20020,
		            0x1a: 0x8020000,
		            0x1b: 0x8000820,
		            0x1c: 0x8020820,
		            0x1d: 0x20800,
		            0x1e: 0x820,
		            0x1f: 0x8000000,
		            0x80000010: 0x20000,
		            0x80000011: 0x800,
		            0x80000012: 0x8020020,
		            0x80000013: 0x20820,
		            0x80000014: 0x20,
		            0x80000015: 0x8020000,
		            0x80000016: 0x8000000,
		            0x80000017: 0x8000820,
		            0x80000018: 0x8020820,
		            0x80000019: 0x8000020,
		            0x8000001a: 0x8000800,
		            0x8000001b: 0x0,
		            0x8000001c: 0x20800,
		            0x8000001d: 0x820,
		            0x8000001e: 0x20020,
		            0x8000001f: 0x8020800
		        }
		    ];
	
		    // Masks that select the SBOX input
		    var SBOX_MASK = [
		        0xf8000001, 0x1f800000, 0x01f80000, 0x001f8000,
		        0x0001f800, 0x00001f80, 0x000001f8, 0x8000001f
		    ];
	
		    /**
		     * DES block cipher algorithm.
		     */
		    var DES = C_algo.DES = BlockCipher.extend({
		        _doReset: function () {
		            // Shortcuts
		            var key = this._key;
		            var keyWords = key.words;
	
		            // Select 56 bits according to PC1
		            var keyBits = [];
		            for (var i = 0; i < 56; i++) {
		                var keyBitPos = PC1[i] - 1;
		                keyBits[i] = (keyWords[keyBitPos >>> 5] >>> (31 - keyBitPos % 32)) & 1;
		            }
	
		            // Assemble 16 subkeys
		            var subKeys = this._subKeys = [];
		            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
		                // Create subkey
		                var subKey = subKeys[nSubKey] = [];
	
		                // Shortcut
		                var bitShift = BIT_SHIFTS[nSubKey];
	
		                // Select 48 bits according to PC2
		                for (var i = 0; i < 24; i++) {
		                    // Select from the left 28 key bits
		                    subKey[(i / 6) | 0] |= keyBits[((PC2[i] - 1) + bitShift) % 28] << (31 - i % 6);
	
		                    // Select from the right 28 key bits
		                    subKey[4 + ((i / 6) | 0)] |= keyBits[28 + (((PC2[i + 24] - 1) + bitShift) % 28)] << (31 - i % 6);
		                }
	
		                // Since each subkey is applied to an expanded 32-bit input,
		                // the subkey can be broken into 8 values scaled to 32-bits,
		                // which allows the key to be used without expansion
		                subKey[0] = (subKey[0] << 1) | (subKey[0] >>> 31);
		                for (var i = 1; i < 7; i++) {
		                    subKey[i] = subKey[i] >>> ((i - 1) * 4 + 3);
		                }
		                subKey[7] = (subKey[7] << 5) | (subKey[7] >>> 27);
		            }
	
		            // Compute inverse subkeys
		            var invSubKeys = this._invSubKeys = [];
		            for (var i = 0; i < 16; i++) {
		                invSubKeys[i] = subKeys[15 - i];
		            }
		        },
	
		        encryptBlock: function (M, offset) {
		            this._doCryptBlock(M, offset, this._subKeys);
		        },
	
		        decryptBlock: function (M, offset) {
		            this._doCryptBlock(M, offset, this._invSubKeys);
		        },
	
		        _doCryptBlock: function (M, offset, subKeys) {
		            // Get input
		            this._lBlock = M[offset];
		            this._rBlock = M[offset + 1];
	
		            // Initial permutation
		            exchangeLR.call(this, 4,  0x0f0f0f0f);
		            exchangeLR.call(this, 16, 0x0000ffff);
		            exchangeRL.call(this, 2,  0x33333333);
		            exchangeRL.call(this, 8,  0x00ff00ff);
		            exchangeLR.call(this, 1,  0x55555555);
	
		            // Rounds
		            for (var round = 0; round < 16; round++) {
		                // Shortcuts
		                var subKey = subKeys[round];
		                var lBlock = this._lBlock;
		                var rBlock = this._rBlock;
	
		                // Feistel function
		                var f = 0;
		                for (var i = 0; i < 8; i++) {
		                    f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
		                }
		                this._lBlock = rBlock;
		                this._rBlock = lBlock ^ f;
		            }
	
		            // Undo swap from last round
		            var t = this._lBlock;
		            this._lBlock = this._rBlock;
		            this._rBlock = t;
	
		            // Final permutation
		            exchangeLR.call(this, 1,  0x55555555);
		            exchangeRL.call(this, 8,  0x00ff00ff);
		            exchangeRL.call(this, 2,  0x33333333);
		            exchangeLR.call(this, 16, 0x0000ffff);
		            exchangeLR.call(this, 4,  0x0f0f0f0f);
	
		            // Set output
		            M[offset] = this._lBlock;
		            M[offset + 1] = this._rBlock;
		        },
	
		        keySize: 64/32,
	
		        ivSize: 64/32,
	
		        blockSize: 64/32
		    });
	
		    // Swap bits across the left and right words
		    function exchangeLR(offset, mask) {
		        var t = ((this._lBlock >>> offset) ^ this._rBlock) & mask;
		        this._rBlock ^= t;
		        this._lBlock ^= t << offset;
		    }
	
		    function exchangeRL(offset, mask) {
		        var t = ((this._rBlock >>> offset) ^ this._lBlock) & mask;
		        this._lBlock ^= t;
		        this._rBlock ^= t << offset;
		    }
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.DES.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.DES.decrypt(ciphertext, key, cfg);
		     */
		    C.DES = BlockCipher._createHelper(DES);
	
		    /**
		     * Triple-DES block cipher algorithm.
		     */
		    var TripleDES = C_algo.TripleDES = BlockCipher.extend({
		        _doReset: function () {
		            // Shortcuts
		            var key = this._key;
		            var keyWords = key.words;
	
		            // Create DES instances
		            this._des1 = DES.createEncryptor(WordArray.create(keyWords.slice(0, 2)));
		            this._des2 = DES.createEncryptor(WordArray.create(keyWords.slice(2, 4)));
		            this._des3 = DES.createEncryptor(WordArray.create(keyWords.slice(4, 6)));
		        },
	
		        encryptBlock: function (M, offset) {
		            this._des1.encryptBlock(M, offset);
		            this._des2.decryptBlock(M, offset);
		            this._des3.encryptBlock(M, offset);
		        },
	
		        decryptBlock: function (M, offset) {
		            this._des3.decryptBlock(M, offset);
		            this._des2.encryptBlock(M, offset);
		            this._des1.decryptBlock(M, offset);
		        },
	
		        keySize: 192/32,
	
		        ivSize: 64/32,
	
		        blockSize: 64/32
		    });
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.TripleDES.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.TripleDES.decrypt(ciphertext, key, cfg);
		     */
		    C.TripleDES = BlockCipher._createHelper(TripleDES);
		}());
	
	
		return CryptoJS.TripleDES;
	
	}));

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(12), __webpack_require__(13), __webpack_require__(14), __webpack_require__(15));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var StreamCipher = C_lib.StreamCipher;
		    var C_algo = C.algo;
	
		    // Reusable objects
		    var S  = [];
		    var C_ = [];
		    var G  = [];
	
		    /**
		     * Rabbit stream cipher algorithm
		     */
		    var Rabbit = C_algo.Rabbit = StreamCipher.extend({
		        _doReset: function () {
		            // Shortcuts
		            var K = this._key.words;
		            var iv = this.cfg.iv;
	
		            // Swap endian
		            for (var i = 0; i < 4; i++) {
		                K[i] = (((K[i] << 8)  | (K[i] >>> 24)) & 0x00ff00ff) |
		                       (((K[i] << 24) | (K[i] >>> 8))  & 0xff00ff00);
		            }
	
		            // Generate initial state values
		            var X = this._X = [
		                K[0], (K[3] << 16) | (K[2] >>> 16),
		                K[1], (K[0] << 16) | (K[3] >>> 16),
		                K[2], (K[1] << 16) | (K[0] >>> 16),
		                K[3], (K[2] << 16) | (K[1] >>> 16)
		            ];
	
		            // Generate initial counter values
		            var C = this._C = [
		                (K[2] << 16) | (K[2] >>> 16), (K[0] & 0xffff0000) | (K[1] & 0x0000ffff),
		                (K[3] << 16) | (K[3] >>> 16), (K[1] & 0xffff0000) | (K[2] & 0x0000ffff),
		                (K[0] << 16) | (K[0] >>> 16), (K[2] & 0xffff0000) | (K[3] & 0x0000ffff),
		                (K[1] << 16) | (K[1] >>> 16), (K[3] & 0xffff0000) | (K[0] & 0x0000ffff)
		            ];
	
		            // Carry bit
		            this._b = 0;
	
		            // Iterate the system four times
		            for (var i = 0; i < 4; i++) {
		                nextState.call(this);
		            }
	
		            // Modify the counters
		            for (var i = 0; i < 8; i++) {
		                C[i] ^= X[(i + 4) & 7];
		            }
	
		            // IV setup
		            if (iv) {
		                // Shortcuts
		                var IV = iv.words;
		                var IV_0 = IV[0];
		                var IV_1 = IV[1];
	
		                // Generate four subvectors
		                var i0 = (((IV_0 << 8) | (IV_0 >>> 24)) & 0x00ff00ff) | (((IV_0 << 24) | (IV_0 >>> 8)) & 0xff00ff00);
		                var i2 = (((IV_1 << 8) | (IV_1 >>> 24)) & 0x00ff00ff) | (((IV_1 << 24) | (IV_1 >>> 8)) & 0xff00ff00);
		                var i1 = (i0 >>> 16) | (i2 & 0xffff0000);
		                var i3 = (i2 << 16)  | (i0 & 0x0000ffff);
	
		                // Modify counter values
		                C[0] ^= i0;
		                C[1] ^= i1;
		                C[2] ^= i2;
		                C[3] ^= i3;
		                C[4] ^= i0;
		                C[5] ^= i1;
		                C[6] ^= i2;
		                C[7] ^= i3;
	
		                // Iterate the system four times
		                for (var i = 0; i < 4; i++) {
		                    nextState.call(this);
		                }
		            }
		        },
	
		        _doProcessBlock: function (M, offset) {
		            // Shortcut
		            var X = this._X;
	
		            // Iterate the system
		            nextState.call(this);
	
		            // Generate four keystream words
		            S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
		            S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
		            S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
		            S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);
	
		            for (var i = 0; i < 4; i++) {
		                // Swap endian
		                S[i] = (((S[i] << 8)  | (S[i] >>> 24)) & 0x00ff00ff) |
		                       (((S[i] << 24) | (S[i] >>> 8))  & 0xff00ff00);
	
		                // Encrypt
		                M[offset + i] ^= S[i];
		            }
		        },
	
		        blockSize: 128/32,
	
		        ivSize: 64/32
		    });
	
		    function nextState() {
		        // Shortcuts
		        var X = this._X;
		        var C = this._C;
	
		        // Save old counter values
		        for (var i = 0; i < 8; i++) {
		            C_[i] = C[i];
		        }
	
		        // Calculate new counter values
		        C[0] = (C[0] + 0x4d34d34d + this._b) | 0;
		        C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_[0] >>> 0) ? 1 : 0)) | 0;
		        C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_[1] >>> 0) ? 1 : 0)) | 0;
		        C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_[2] >>> 0) ? 1 : 0)) | 0;
		        C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_[3] >>> 0) ? 1 : 0)) | 0;
		        C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_[4] >>> 0) ? 1 : 0)) | 0;
		        C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_[5] >>> 0) ? 1 : 0)) | 0;
		        C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_[6] >>> 0) ? 1 : 0)) | 0;
		        this._b = (C[7] >>> 0) < (C_[7] >>> 0) ? 1 : 0;
	
		        // Calculate the g-values
		        for (var i = 0; i < 8; i++) {
		            var gx = X[i] + C[i];
	
		            // Construct high and low argument for squaring
		            var ga = gx & 0xffff;
		            var gb = gx >>> 16;
	
		            // Calculate high and low result of squaring
		            var gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb;
		            var gl = (((gx & 0xffff0000) * gx) | 0) + (((gx & 0x0000ffff) * gx) | 0);
	
		            // High XOR low
		            G[i] = gh ^ gl;
		        }
	
		        // Calculate new state values
		        X[0] = (G[0] + ((G[7] << 16) | (G[7] >>> 16)) + ((G[6] << 16) | (G[6] >>> 16))) | 0;
		        X[1] = (G[1] + ((G[0] << 8)  | (G[0] >>> 24)) + G[7]) | 0;
		        X[2] = (G[2] + ((G[1] << 16) | (G[1] >>> 16)) + ((G[0] << 16) | (G[0] >>> 16))) | 0;
		        X[3] = (G[3] + ((G[2] << 8)  | (G[2] >>> 24)) + G[1]) | 0;
		        X[4] = (G[4] + ((G[3] << 16) | (G[3] >>> 16)) + ((G[2] << 16) | (G[2] >>> 16))) | 0;
		        X[5] = (G[5] + ((G[4] << 8)  | (G[4] >>> 24)) + G[3]) | 0;
		        X[6] = (G[6] + ((G[5] << 16) | (G[5] >>> 16)) + ((G[4] << 16) | (G[4] >>> 16))) | 0;
		        X[7] = (G[7] + ((G[6] << 8)  | (G[6] >>> 24)) + G[5]) | 0;
		    }
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.Rabbit.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.Rabbit.decrypt(ciphertext, key, cfg);
		     */
		    C.Rabbit = StreamCipher._createHelper(Rabbit);
		}());
	
	
		return CryptoJS.Rabbit;
	
	}));

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	;(function (root, factory, undef) {
		if (true) {
			// CommonJS
			module.exports = exports = factory(__webpack_require__(5), __webpack_require__(12), __webpack_require__(13), __webpack_require__(14), __webpack_require__(15));
		}
		else if (typeof define === "function" && define.amd) {
			// AMD
			define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
		}
		else {
			// Global (browser)
			factory(root.CryptoJS);
		}
	}(this, function (CryptoJS) {
	
		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var StreamCipher = C_lib.StreamCipher;
		    var C_algo = C.algo;
	
		    /**
		     * RC4 stream cipher algorithm.
		     */
		    var RC4 = C_algo.RC4 = StreamCipher.extend({
		        _doReset: function () {
		            // Shortcuts
		            var key = this._key;
		            var keyWords = key.words;
		            var keySigBytes = key.sigBytes;
	
		            // Init sbox
		            var S = this._S = [];
		            for (var i = 0; i < 256; i++) {
		                S[i] = i;
		            }
	
		            // Key setup
		            for (var i = 0, j = 0; i < 256; i++) {
		                var keyByteIndex = i % keySigBytes;
		                var keyByte = (keyWords[keyByteIndex >>> 2] >>> (24 - (keyByteIndex % 4) * 8)) & 0xff;
	
		                j = (j + S[i] + keyByte) % 256;
	
		                // Swap
		                var t = S[i];
		                S[i] = S[j];
		                S[j] = t;
		            }
	
		            // Counters
		            this._i = this._j = 0;
		        },
	
		        _doProcessBlock: function (M, offset) {
		            M[offset] ^= generateKeystreamWord.call(this);
		        },
	
		        keySize: 256/32,
	
		        ivSize: 0
		    });
	
		    function generateKeystreamWord() {
		        // Shortcuts
		        var S = this._S;
		        var i = this._i;
		        var j = this._j;
	
		        // Generate keystream word
		        var keystreamWord = 0;
		        for (var n = 0; n < 4; n++) {
		            i = (i + 1) % 256;
		            j = (j + S[i]) % 256;
	
		            // Swap
		            var t = S[i];
		            S[i] = S[j];
		            S[j] = t;
	
		            keystreamWord |= S[(S[i] + S[j]) % 256] << (24 - n * 8);
		        }
	
		        // Update counters
		        this._i = i;
		        this._j = j;
	
		        return keystreamWord;
		    }
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.RC4.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.RC4.decrypt(ciphertext, key, cfg);
		     */
		    C.RC4 = StreamCipher._createHelper(RC4);
	
		    /**
		     * Modified RC4 stream cipher algorithm.
		     */
		    var RC4Drop = C_algo.RC4Drop = RC4.extend({
		        /**
		         * Configuration options.
		         *
		         * @property {number} drop The number of keystream words to drop. Default 192
		         */
		        cfg: RC4.cfg.extend({
		            drop: 192
		        }),
	
		        _doReset: function () {
		            RC4._doReset.call(this);
	
		            // Drop
		            for (var i = this.cfg.drop; i > 0; i--) {
		                generateKeystreamWord.call(this);
		            }
		        }
		    });
	
		    /**
		     * Shortcut functions to the cipher's object interface.
		     *
		     * @example
		     *
		     *     var ciphertext = CryptoJS.RC4Drop.encrypt(message, key, cfg);
		     *     var plaintext  = CryptoJS.RC4Drop.decrypt(ciphertext, key, cfg);
		     */
		    C.RC4Drop = StreamCipher._createHelper(RC4Drop);
		}());
	
	
		return CryptoJS.RC4;
	
	}));

/***/ }
/******/ ])
});
;

},{}],57:[function(require,module,exports){
const { ExplorerApi } = require("atomicassets");
const fetch = require("node-fetch");
const SecureLS = require("secure-ls");
const waxjs = require("@waxio/waxjs/dist");
const DOMPurify = require("dompurify");
const api = new ExplorerApi("https://wax.api.atomicassets.io", "atomicassets", {
  fetch,
});
var wax = new waxjs.WaxJS("https://wax.greymass.com", null, null, false);
const detectEthereumProvider = require("@metamask/detect-provider");
const waxWalletCollectorAddress = "0xB3528065F526Acf871B35ae322Ed28b24C096548";
const dp = new DOMPurify();
const ls = new SecureLS();

var bitcoins = 0;
var bitcoinRate = 0;
var currentUser = null;
// Every item in the game
// TODO: items should be part of the Game variable

var items = [
  {
    name: "item_oldCalculator",
    template_id: "180336",
  },
  {
    name: "item_oldCpu",
    template_id: "180473",
  },
  {
    name: "item_oldComputerFromGrandpa",
    template_id: "180512",
  },
  {
    name: "item_raspberrypi",
    template_id: "180513",
  },
  {
    name: "item_smartphone",
    template_id: "180515",
  },
  {
    name: "item_middleClassPC",
    template_id: "180516",
  },
  {
    name: "item_cheapServer",
    template_id: "180517",
  },
  {
    name: "item_gamingPC",
    template_id: "180519",
  },
  {
    name: "item_cheapMiner",
    template_id: "180521",
  },
  {
    name: "item_highEndUltraPC",
    template_id: "180522",
  },
  {
    name: "item_bigMiner",
    template_id: "180524",
  },
  {
    name: "item_miningFarm",
    template_id: "180525",
  },
  {
    name: "item_nasaPC",
    template_id: "180526",
  },
  {
    name: "item_quantumRig",
    template_id: "180528",
  },
  {
    name: "item_miningFarmSpace",
    template_id: "180529",
  },
  {
    name: "item_miningFarmMoon",
    template_id: "180530",
  },
  {
    name: "item_bitcoinTimeMachine",
    template_id: "180531",
  },
  {
    name: "item_blackHolePoweredMiner",
    template_id: "180532",
  },
];

var templates = [];

async function getTemplates() {
  for (let i = 0; i < items.length; i++) {
    const id = items[i].template_id;
    const name = items[i].name;
    const data = (await api.getTemplate("waxbtcclickr", id)).immutable_data;

    const result = { name, id, data };
    templates.push(result);
  }
}

// Rate is null (at the beginning)
var bSec = null;

// If there is no bitcoins Item in the localStorage, create one.
// If there is one, do the other thing.
async function init() {

  const keys = ls.getAllKeys()
  if (keys.length == 0 || !keys.includes("bitcoins"))
    ls.set("bitcoins", 0);

  const wallet = localStorage.getItem("waxWallet");
  const btcs = ls.get("bitcoins");
  console.log(btcs)
  await getTemplates();
  if (
    btcs === null ||
    btcs === "NaN" ||
    wallet === null ||
    wallet !== wax.userAccount
  ) {
    // Bitcoins are 0
    bitcoins = 0;
    waxWallet = wax.userAccount;

    // Set the localStorage Item for the first time
    ls.clear();
    localStorage.clear();

    ls.set("bitcoins", 0);

    localStorage.setItem("waxWallet", waxWallet);

    // Write the current amount of Bitcoins on the page
    $(".bitcoinAmount").text(bitcoins.toFixed(8));
  } else {
    // Get the amount of Bitcoins and parse them to a float number
    bitcoins = parseFloat(ls.get("bitcoins"));
    console.log("Init", bitcoins);
    $(".bitcoinAmount").text("loading...");
    $(".satoshiAmount").text("loading...");
  }
  await createLeaderboard();
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
 * Calculating the Bitcoins per Second - rate when the page was opened.
 *
 */
Game.setBitcoinPerSecondRateAtBeginning = async function () {
  bitcoinRate = 0;
  for (let i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    const template = templates.find((val) => val.name === items[i].name).data;
    let itemAmount = 0;
    let bits_per_sec = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
      bits_per_sec = template.rate;
    }
    // HTML element on the game page
    var $element = $("#" + items[i].name);

    // Writing the amount on the page at the item´s element
    $element.children()[3].textContent = "Level: " + itemAmount;

    // Only calculate the new price if there is more than 0 items.
    // If there are not enough items, it will just continue, and if there are,
    // it will execute the function and continue after it as well.
    if (itemAmount > 0) {
      Game.setPriceAtGameBeginning(
        $element,
        parseFloat(template.price),
        parseInt(itemAmount)
      );
    }
    itemAmount = parseInt(itemAmount);

    // Calculating the rate
    bitcoinRate = bitcoinRate + itemAmount * bits_per_sec;
  }
};

/**
 * Function which sets a new "Bitcoin per Second" rate
 *
 * @param rate - The number which must be added to the current Bitcoin per Second - rate
 * @returns {Number} - Returning the new Bitcoin per Second - rate
 */
Game.setNewBitcoinRate = function () {
  // Showing the new rate on the page
  // Rounding at specific values
  if (bitcoinRate >= 1000000) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0).optimizeNumber());
  } else if (bitcoinRate >= 1000) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(0));
  } else if (bitcoinRate >= 1) {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(2));
  } else {
    $(".bSecRateNumber").text(bitcoinRate.toFixed(8));
  }
};

/**
 * This function will check if there is any change in the localStorage,
 * especially looking at the item amount. So it will actually calculate every price again and
 * again. (This function should be recoded)
 *
 * TODO: Find a better way for setting the price after an item was bought.
 */
Game.setNewPrice = async function () {
  // for-loop for getting the price multiplier and to calculate the new price
  for (var i = 0; i < items.length; i++) {
    const asset = await Game.getItem(items[i].name);
    const template = templates.find((val) => val.name === items[i].name).data;
    var itemAmount = 0;
    if (asset !== undefined) {
      itemAmount = asset.assets;
    }
    var $element = $("#" + items[i].name);
    $element.children()[3].textContent = "Level: " + itemAmount;

    // Only calculate if there is more than 0 items
    if (itemAmount > 0) {
      // Calculation of the price
      var multiplier = Game.GameConst.priceMultiplier;
      var calculation = (
        parseFloat(template.price) * Math.pow(multiplier, parseInt(itemAmount))
      ).toFixed(8);

      // Showing the actual price
      $element.children()[2].textContent = calculation + " Bitcoins";

      // Set the data-price attribute with the new price
      $element.attr("data-price", calculation.toString());
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
  ls.set("bitcoins", bitcoins.toString());
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

// --------------------------------------------------- //

/**
 * <-- Now doing everything -->
 */

// Doing everything here when the game is ready to be used.
function setup() {
  $(document).ready(async function () {
    // Stating the interval with the calculated Bitcoin/second rate.
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);

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
      ls.set("bitcoins", bitcoins.toString());
    });

    // If any item from the list was clicked...
    $(".purchaseItem").click(async function () {
      // Get following attributes and children elements

      // id of the item
      const id = $(this).attr("id");
      // The price attribute as a float number
      const template = templates.find((val) => val.name === id);
      const { price } = template ? template.data : Number.MAX_VALUE;

      // The element which shows how many of the item is existing
      // If you have enough Bitcoins, it´ll buy one item
      if (parseFloat(bitcoins.toFixed(8)) >= price) {
        showItems("none");

        // mint throws undefined if RAM is unsufficient
        const err = await mint(id);
        if (err === undefined) {
          showItems("block");
          alert("Unsufficient RAM:\nThe item is not available...");
          return;
        }
        // Substract the price from the current Bitcoin number and set it to the bitcoins variable.
        bitcoins = parseFloat(bitcoins.toFixed(8)) - price;

        // Save the new amount of Bitcoins in the localStorage storage
        ls.set("bitcoins", bitcoins.toString());

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

        // Stops the interval
        Game.stopBsec();
        const oldBitcoinRate = bitcoinRate;
        // Setting a new price and show it
        await Game.setNewPrice();
        // Restarting the interval with the new rate
        await waitForTransaction(oldBitcoinRate);
      }
    });
  });

}

Game.getItem = async function (id) {
  assets = (await api.getAccount(wax.userAccount)).templates;
  const item = items.find((val) => {
    return val.name === id;
  });
  const asset = assets.find((val) => {
    return val.template_id === item.template_id;
  });
  return asset;
};

async function mint(id) {
  const item = items.find((val) => {
    return val.name === id;
  });
  const template_id = parseInt(item.template_id);
  const actions = await (await api.action)
    .mintasset(
      [{ actor: wax.userAccount, permission: "active" }],
      wax.userAccount,
      "waxbtcclickr",
      "equipments",
      template_id,
      wax.userAccount,
      {},
      {},
      0
    )
    .catch(console.log);
  const result = await wax.api
    .transact(
      {
        actions: actions,
      },
      {
        blocksBehind: 30,
        expireSeconds: 1200,
      }
    )
    .catch(console.log);
  console.log(result);
  return result;
}

function showItems(state) {
  document.getElementById("purchaseList").style.display = state;
  const loadingState = state === "none" ? "block" : "none";
  document.getElementById("Loading").style.display = loadingState;
}
/**
 * Waits for the NFT to finish loading
 * @param {number} oldBitcoinRate
 */
async function waitForTransaction(oldBitcoinRate) {
  await Game.setBitcoinPerSecondRateAtBeginning();
  Game.setNewBitcoinRate();
  setTimeout(() => {
    if (oldBitcoinRate === bitcoinRate) {
      waitForTransaction(oldBitcoinRate);
      return;
    }
    showItems("block");
    bSec = setInterval(function () {
      Game.bSecFunction(bitcoinRate);
    }, 1000);
  }, 1000);
}

// normal login. Triggers a popup for non-whitelisted dapps
async function login() {
  try {
    if (wax.userAccount === undefined) {
      await wax.login();
      await init();
      await Game.setBitcoinPerSecondRateAtBeginning();
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
    return false;
  }
}

document.getElementById("loginWaxWallet").onclick = async () => {
  document.getElementById("loginWaxWallet").style.display = "none";
  showItems("none");
  const success = await login();
  if (success) {
    for (let i = 0; i < items.length; i++) {
      document.getElementById(items[i].name).style.display = "block";
    }
    setup();
    showItems("block");
    document.getElementById("verifyWaxWallet").style.display = "block";
    document.getElementById("verifyCollection").style.display = "block";
    return;
  }
  showItems("block");
  document.getElementById("loginWaxWallet").style.display = "block";
};

/**
 * Send transaction to verify for whitelisting
 */

document.getElementById("verifyWaxWallet").onclick = verifyWaxWallet;

async function verifyWaxWallet() {
  const provider = await detectEthereumProvider();
  console.log(provider);
  if (provider === window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.request({method: "eth_requestAccounts"});
      const accounts = await ethereum.request({method: "eth_accounts"});
      currentUser = accounts[0];
      const contract = new web3.eth.Contract(
          waxWalletCollector,
          waxWalletCollectorAddress
      );
      await contract.methods
          .collect(wax.userAccount)
          .send({from: currentUser});
    } catch (err) {
      console.log(err);
    }
  }

}


/**
 * Show user dialog for donation.
 */

document.getElementById("donateButton").onclick = showDialog;

async function showDialog() {
  var modal = document.getElementById("myModal");
  var span = document.getElementById("closeSpan");
  var content = document.getElementById("content");
  var input = document.getElementById("quantity");

  content.innerText = "With how much WAX do you wanna donate RAM?";

  modal.style.display = "block"

  span.onclick = function() {
    modal.style.display = "none";

    //Get user input
    var userinput = dp.sanitize(input.value);

    if (userinput != "")
    userinput = parseFloat(userinput);

    console.log(typeof userinput)
    //Do transaction with the userinput
    if (typeof userinput != "number")
      alert("Please input a number");
    else {
      sign(userinput);
    }
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }


}

/**
 * Transact wax from the user to our contract. Need to adjust receiver after smart contract is finished.
 * @param amount: the amount of WAX the user put in to donate
 * @returns {Promise<void>}
 */
async function sign(amount) {
  if(wax.userAccount === undefined) {
    await wax.login();
  }

  //convert amount into the right format
  var quantity = amount.toString();

  quantity = quantity + " WAX"
  console.log(quantity);


  //execute transaction
  try {
    const result = await wax.api.transact({
      actions: [{
        account: 'eosio',
        name: 'buyram',
        authorization: [{
          actor: wax.userAccount,
          permission: 'active',
        }],
        data: {
          payer: wax.userAccount,
          receiver: "1mbtu.wam",    //Später smart contract Name
          quant: quantity,
        },
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    });
    console.log(JSON.stringify(result, null, 2))
  } catch(e) {
    console.log(e.message);
  }
}

/**
 * Checks the assets of the currently logged in wallet for assets from the 1cryptobeard collection
 * @returns {Promise<boolean>} true if assets from the 1cryptobeard collection are found
 */
async function checkForAirdrop() {
  var assets = (await api.getAccount(wax.userAccount)).templates;

  for (var i = 0; i < assets.length; i++) {
    const collection = assets[i].collection_name;

    if (collection == "1cryptobeard")
      return true
  }
  return false
}

/**
 * Fetches json with the private key.
 */
function fetchJson() {

  fetch('./test.json').then(response => response.json())
      .then(data => showVerificationDialog(data["Private Key"], "Authentification was succesfull!" + "\n" + "Link for the airdrop: "))
      .catch(err => console.log(err));
}

/**
 *
 * @param privateKey
 * @param msg if the authentification was succesfull or not
 * @returns {Promise<void>}
 */

async function showVerificationDialog(privateKey, msg) {
  var modal = document.getElementById("pkModal");
  var mcontent = document.getElementById("pkContent");
  var span = document.getElementById("pkSpan");

  modal.style.display = "block";

  span.onclick = function() {
    modal.style.display = "none"; }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  mcontent.innerText = msg + privateKey;
}

document.getElementById("verifyCollection").onclick = verifyCollection;

async function verifyCollection() {
  if (checkForAirdrop() == true) {
    fetchJson()
  }
  else {
    showVerificationDialog("", "Verification not succesfull")
  }
}

/**
 * function for creating the leaderboard
 */
async function createLeaderboard() {
  var accounts = await api.getAccounts({ collection_name: "waxbtcclickr", schema_name: "equipments", template_id: "180532", });
  console.log(accounts);
  var scores = new Map();
  for (var i = 0; i < accounts.length; i++) {
    scores.set(accounts[i].account, accounts[i].assets);
  }
  scores = new Map([...scores.entries()].sort((a, b) => b[1] - a[1]));
  var counter = 1;

  for (let [key, value] of scores) {
    var currentText = document.getElementById("lb" + counter);
    currentText.innerText = counter + ". " + key + " - " + value;
    counter++;
  }
}

document.getElementById("lbButton").onclick = showLeaderBoard;

function showLeaderBoard() {
  var modal = document.getElementById("leaderboardModal");
  modal.style.display = "block";

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  var childs = modal.children; //returns a HTMLCollection

  for (var i = 0; i < childs.length; i++) { // iterate over it
    childs[i].onclick = function () {   // attach event listener individually
      modal.style.display = "none";
    }
  }
}







},{"@metamask/detect-provider":1,"@waxio/waxjs/dist":3,"atomicassets":39,"dompurify":42,"node-fetch":54,"secure-ls":56}]},{},[57]);
