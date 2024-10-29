import { call, view } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";
import { near } from "near-sdk-js";


// interfaces/access_interface.js
export class AccessInterface {
    @call({})
    grantAccess({ collectionId, tokenId, accountId, accessLevel }) {
        this._assertAuthorizedOrOwner(collectionId, tokenId);
        this._assertMaxAccessLevel(collectionId, tokenId, accessLevel);
        
        if (accessLevel === AccessLevel.None) {
            near.panicUtf8("NFTAccessControl: Invalid access level");
        }

        this.core.internal_grant_access(collectionId, tokenId, accountId, accessLevel);
        near.log(`Access Granted - Collection: ${collectionId}, Token: ${tokenId}, Account: ${accountId}, Level: ${accessLevel}`);
        return true;
    }

    @call({})
    revokeAccess({ collectionId, tokenId, accountId }) {
        this._assertAuthorized();
        this.core.internal_revoke_access(collectionId, tokenId, accountId);
        near.log(`Access Revoked - Collection: ${collectionId}, Token: ${tokenId}, Account: ${accountId}`);
        return true;
    }

    @call({})
    setMaxAccessLevel({ collectionId, tokenId, accessLevel }) {
        this._assertAuthorizedOrOwner(collectionId, tokenId);
        this._assertMaxAccessLevel(collectionId, tokenId, accessLevel);
        
        this.state.maxAccess.set(
            this.state.getTokenKey(collectionId, tokenId),
            accessLevel
        );
        near.log(`Max Access Level Set - Collection: ${collectionId}, Token: ${tokenId}, Level: ${accessLevel}`);
        return true;
    }

    @call({})
    setDefaultAccessLevel({ collectionId, tokenId, accessLevel }) {
        this._assertAuthorizedOrOwner(collectionId, tokenId);
        this._assertMaxAccessLevel(collectionId, tokenId, accessLevel);
        
        this.state.defaultAccess.set(
            this.state.getTokenKey(collectionId, tokenId),
            accessLevel
        );
        near.log(`Default Access Level Set - Collection: ${collectionId}, Token: ${tokenId}, Level: ${accessLevel}`);
        return true;
    }

    @view({})
    getAccessLevel({ collectionId, tokenId, accountId }) {
        return this.core.internal_get_access_level(collectionId, tokenId, accountId);
    }

    @view({})
    getAllAccessForUser({ accountId }) {
        return this.state.userAccessList.get(accountId) || [];
    }

    @view({})
    getAllUsersAccessForNFT({ collectionId, tokenId }) {
        const key = this.state.getTokenKey(collectionId, tokenId);
        return this.state.nftAccessList.get(key) || [];
    }

    @view({})
    checkMinimumAccess({ collectionId, tokenId, accountId, requiredLevel }) {
        return this.core.internal_check_minimum_access(collectionId, tokenId, accountId, requiredLevel);
    }
}

