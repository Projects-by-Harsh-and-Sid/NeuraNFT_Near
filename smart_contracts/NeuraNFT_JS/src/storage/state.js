

// storage/state.js
import { LookupMap, UnorderedMap } from "near-sdk-js";
import { StorageKeys } from './storage_keys';
import { 
    NFTInfo, 
    Metadata, 
    CollectionMetadata, 
    AccessLevel, 
    AccessEntry, 
    UserAccess 
} from '../models';

export class NFTContractState {
    constructor() {
        // NFT Core Storage
        this.nftTokens = new UnorderedMap(StorageKeys.NFT_TOKENS);
        this.nftMetadata = new LookupMap(StorageKeys.NFT_METADATA);
        this.nftOwners = new LookupMap(StorageKeys.NFT_OWNERS);
        this.tokenApprovals = new LookupMap(StorageKeys.TOKEN_APPROVALS);
        this.operatorApprovals = new LookupMap(StorageKeys.OPERATOR_APPROVALS);

        // Collection Storage
        this.collections = new UnorderedMap(StorageKeys.COLLECTIONS);
        this.collectionTokens = new LookupMap(StorageKeys.COLLECTION_TOKENS);
        this.collectionCounts = new LookupMap(StorageKeys.COLLECTION_COUNTS);
        this.nextTokenId = new LookupMap(StorageKeys.NEXT_TOKEN_ID);

        // Balance Storage
        this.tokenBalances = new LookupMap(StorageKeys.TOKEN_BALANCES);
        this.collectionBalances = new LookupMap(StorageKeys.COLLECTION_BALANCES);

        // Access Control Storage
        this.nftAccess = new LookupMap(StorageKeys.NFT_ACCESS);
        this.defaultAccess = new LookupMap(StorageKeys.DEFAULT_ACCESS);
        this.maxAccess = new LookupMap(StorageKeys.MAX_ACCESS);
        this.userAccessList = new UnorderedMap(StorageKeys.USER_ACCESS_LIST);
        this.nftAccessList = new UnorderedMap(StorageKeys.NFT_ACCESS_LIST);
    }

    // Key Generation Methods
    getTokenKey(collectionId, tokenId) {
        return `${collectionId}_${tokenId}`;
    }

    getAccessKey(collectionId, tokenId, accountId) {
        return `${collectionId}_${tokenId}_${accountId}`;
    }

    getBalanceKey(accountId, collectionId) {
        return `${accountId}_${collectionId}`;
    }

    getApprovalKey(accountId, operatorId) {
        return `${accountId}_${operatorId}`;
    }

    // NFT Methods
    getNFT(collectionId, tokenId) {
        const key = this.getTokenKey(collectionId, tokenId);
        const nft = this.nftTokens.get(key);
        return nft ? NFTInfo.fromPayload(nft) : null;
    }

    setNFT(collectionId, tokenId, nftInfo) {
        const key = this.getTokenKey(collectionId, tokenId);
        this.nftTokens.set(key, nftInfo.toJSON());
    }

    // Metadata Methods
    getMetadata(collectionId, tokenId) {
        const key = this.getTokenKey(collectionId, tokenId);
        const metadata = this.nftMetadata.get(key);
        return metadata ? Metadata.fromPayload(metadata) : null;
    }

    setMetadata(collectionId, tokenId, metadata) {
        const key = this.getTokenKey(collectionId, tokenId);
        this.nftMetadata.set(key, metadata.toJSON());
    }

    // Collection Methods
    getCollection(collectionId) {
        const collection = this.collections.get(collectionId);
        return collection ? CollectionMetadata.fromPayload(collection) : null;
    }

    setCollection(collectionId, collection) {
        this.collections.set(collectionId, collection.toJSON());
    }

    // Access Control Methods
    getAccessLevel(collectionId, tokenId, accountId) {
        const key = this.getAccessKey(collectionId, tokenId, accountId);
        return this.nftAccess.get(key) || AccessLevel.None;
    }

    setAccessLevel(collectionId, tokenId, accountId, level) {
        const key = this.getAccessKey(collectionId, tokenId, accountId);
        this.nftAccess.set(key, level);

        this._updateAccessLists(collectionId, tokenId, accountId, level);
    }

    _updateAccessLists(collectionId, tokenId, accountId, level) {
        // Update user access list
        let userAccesses = this.userAccessList.get(accountId) || [];
        const accessEntry = new AccessEntry(collectionId, tokenId, level);
        userAccesses = userAccesses.filter(entry => 
            entry.collectionId !== collectionId || entry.nftId !== tokenId
        );
        if (level !== AccessLevel.None) {
            userAccesses.push(accessEntry);
        }
        this.userAccessList.set(accountId, userAccesses);

        // Update NFT access list
        const nftKey = this.getTokenKey(collectionId, tokenId);
        let nftAccesses = this.nftAccessList.get(nftKey) || [];
        const userAccess = new UserAccess(accountId, level);
        nftAccesses = nftAccesses.filter(access => access.user !== accountId);
        if (level !== AccessLevel.None) {
            nftAccesses.push(userAccess);
        }
        this.nftAccessList.set(nftKey, nftAccesses);
    }

    // Balance Methods
    getBalance(accountId) {
        return this.tokenBalances.get(accountId) || 0;
    }

    getCollectionBalance(accountId, collectionId) {
        const key = this.getBalanceKey(accountId, collectionId);
        return this.collectionBalances.get(key) || 0;
    }

    // Approval Methods
    isApprovedForAll(accountId, operatorId) {
        const key = this.getApprovalKey(accountId, operatorId);
        return this.operatorApprovals.get(key) || false;
    }

    setApprovalForAll(accountId, operatorId, approved) {
        const key = this.getApprovalKey(accountId, operatorId);
        this.operatorApprovals.set(key, approved);
    }

    // Token Counter Methods
    getNextTokenId(collectionId) {
        return this.nextTokenId.get(collectionId) || 1;
    }

    incrementTokenId(collectionId) {
        const current = this.getNextTokenId(collectionId);
        this.nextTokenId.set(collectionId, current + 1);
        return current;
    }
}