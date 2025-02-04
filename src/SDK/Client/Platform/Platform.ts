// @ts-ignore
import DashPlatformProtocol from "@dashevo/dpp";

import Client from "../Client";

import broadcastDocument from "./methods/documents/broadcast";
import createDocument from "./methods/documents/create";
import getDocument from "./methods/documents/get";

import broadcastContract from "./methods/contracts/broadcast";
import createContract from "./methods/contracts/create";
import getContract from "./methods/contracts/get";

import getIdentity from "./methods/identities/get";
import registerIdentity from "./methods/identities/register";
import topUpIdentity from "./methods/identities/topUp";

import registerName from "./methods/names/register";
import resolveName from "./methods/names/resolve";
import resolveNameByRecord from "./methods/names/resolveByRecord";
import searchName from "./methods/names/search";
import broadcastStateTransition from "./broadcastStateTransition";
import { IPlatformStateProof } from "./IPlatformStateProof";

/**
 * Interface for PlatformOpts
 *
 * @remarks
 * required parameters include { client, apps }
 */
export interface PlatformOpts {
    client: Client,
}

/**
 * @param {Function} broadcast - broadcast records onto the platform
 * @param {Function} create - create records which can be broadcasted
 * @param {Function} get - get records from the platform
 */
interface Records {
    broadcast: Function,
    create: Function,
    get: Function,
}

/**
 * @param {Function} register - register a domain
 * @param {Function} resolve - resolve domain by a name
 * @param {Function} resolveByRecord - resolve domain by it's record
 * @param {Function} search - search domain
 */
interface DomainNames {
    register: Function,
    resolve: Function,
    resolveByRecord: Function,
    search: Function,
}

interface Identities {
    get: Function,
    register: Function,
    topUp: Function,
}

/**
 * Class for Dash Platform
 *
 * @param documents - documents
 * @param identities - identites
 * @param names - names
 * @param contracts - contracts
 */
export class Platform {
    dpp: DashPlatformProtocol;

    public documents: Records;
    /**
     * @param {Function} get - get identities from the platform
     * @param {Function} register - register identities on the platform
     */
    public identities: Identities;
    /**
     * @param {Function} get - get names from the platform
     * @param {Function} register - register names on the platform
     */
    public names: DomainNames;
    /**
     * @param {Function} get - get contracts from the platform
     * @param {Function} create - create contracts which can be broadcasted
     * @param {Function} register - register contracts on the platform
     */
    public contracts: Records;

    /**
     * Broadcasts state transition
     * @param {Object} stateTransition
     */
    public broadcastStateTransition(stateTransition: any): Promise<IPlatformStateProof|void> {
        return broadcastStateTransition(this, stateTransition);
    };

    client: Client;

    /**
     * Construct some instance of Platform
     *
     * @param {PlatformOpts} options - options for Platform
     */
    constructor(options: PlatformOpts) {
        this.documents = {
            broadcast: broadcastDocument.bind(this),
            create: createDocument.bind(this),
            get: getDocument.bind(this),
        };
        this.contracts = {
            broadcast: broadcastContract.bind(this),
            create: createContract.bind(this),
            get: getContract.bind(this),
        };
        this.names = {
            register: registerName.bind(this),
            resolve: resolveName.bind(this),
            resolveByRecord: resolveNameByRecord.bind(this),
            search: searchName.bind(this),
        };
        this.identities = {
            register: registerIdentity.bind(this),
            get: getIdentity.bind(this),
            topUp: topUpIdentity.bind(this),
        };

        const stateRepository = {
            fetchIdentity: getIdentity.bind(this),
            fetchDataContract: getContract.bind(this),
            // This check still exists on the client side, however there's no need to
            // perform the check as in this client we always use a new transaction
            // register/top up identity
            checkAssetLockTransactionOutPointExists() { return false; },
            verifyInstantLock() { return true; },
        };

        this.dpp = new DashPlatformProtocol({
            stateRepository,
            ...options,
        });

        this.client = options.client;
    }
}
