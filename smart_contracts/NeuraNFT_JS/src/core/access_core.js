import { near } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";


// core/access_core.js
export class AccessCore {
    constructor(state) {
        this.state = state;
    }

    internal_grant_access(collectionId, tokenId, accountId, accessLevel) {
        this.state.setAccessLevel(collectionId, tokenId, accountId, accessLevel);
        return true;
    }

    internal_revoke_access(collectionId, tokenId, accountId) {
        this.state.setAccessLevel(collectionId, tokenId, accountId, AccessLevel.None);
        return true;
    }

    internal_get_access_level(collectionId, tokenId, accountId) {
        const level = this.state.getAccessLevel(collectionId, tokenId, accountId);
        if (level === AccessLevel.None) {
            return this.state.defaultAccess.get(
                this.state.getTokenKey(collectionId, tokenId)
            ) || AccessLevel.None;
        }
        return level;
    }

    internal_check_minimum_access(collectionId, tokenId, accountId, requiredLevel) {
        const defaultLevel = this.state.defaultAccess.get(
            this.state.getTokenKey(collectionId, tokenId)
        ) || AccessLevel.None;

        if (defaultLevel >= requiredLevel) {
            return true;
        }

        const actualLevel = this.state.getAccessLevel(collectionId, tokenId, accountId);
        return actualLevel >= requiredLevel;
    }
}

