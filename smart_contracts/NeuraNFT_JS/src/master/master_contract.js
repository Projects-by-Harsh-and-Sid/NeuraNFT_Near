import { NearBindgen, call, view, near, initialize, UnorderedMap } from "near-sdk-js";

@NearBindgen({})
export class MasterAccessControl {
    // Using UnorderedMap for efficient storage
    // Key format: "contractAddress:caller"
    accessRights = new UnorderedMap('access');

    @initialize({})
    init() {
        // Called once on deployment
        // Grant deployer access
        const deployer          = near.predecessorAccountId();
        const contractName      = near.currentAccountId();
        this.accessRights.set(
            this._getAccessKey(contractName, deployer),
            true
        );
        near.log(`Contract initialized. Deployer ${deployer} granted access`);
    }

    _getAccessKey(contractAddress, caller) {
        return `${contractAddress}:${caller}`;
    }

    _assertAuthorized() {
        const caller            = near.predecessorAccountId();
        const contractName      = near.currentAccountId();
        const key               = this._getAccessKey(contractName, caller);
        
        if (!this.accessRights.get(key)) {
            throw new Error('MasterAccessControl: Not authorized');
        }
    }

    @call({})
    grantAccess({ contractAddress, caller }) {
        this._assertAuthorized();
        
        const key               = this._getAccessKey(contractAddress, caller);
        this.accessRights.set(key, true);
        
        near.log(`Access granted to ${caller} for contract ${contractAddress}`);
        return true;
    }

    @call({})
    revokeAccess({ contractAddress, caller }) {
        this._assertAuthorized();
        
        const key = this._getAccessKey(contractAddress, caller);
        this.accessRights.remove(key);
        
        near.log(`Access revoked from ${caller} for contract ${contractAddress}`);
        return true;
    }

    @call({})
    grantSelfAccess({ addressToGrant }) {
        const contractCaller = near.predecessorAccountId();
        const key = this._getAccessKey(contractCaller, addressToGrant);
        this.accessRights.set(key, true);
        
        near.log(`Self access granted to ${addressToGrant} for contract ${contractCaller}`);
        return true;
    }

    @call({})
    revokeSelfAccess({ addressToRevoke }) {
        const contractCaller = near.predecessorAccountId();
        const key = this._getAccessKey(contractCaller, addressToRevoke);
        this.accessRights.remove(key);
        
        near.log(`Self access revoked from ${addressToRevoke} for contract ${contractCaller}`);
        return true;
    }

    @view({})
    hasAccess({ contractAddress, caller }) {
        const key = this._getAccessKey(contractAddress, caller);
        return this.accessRights.get(key) || false;
    }

    @view({})
    selfCheckAccess({ addressToCheck }) {
        const contractCaller = near.predecessorAccountId();
        const key = this._getAccessKey(contractCaller, addressToCheck);
        return this.accessRights.get(key) || false;
    }
}