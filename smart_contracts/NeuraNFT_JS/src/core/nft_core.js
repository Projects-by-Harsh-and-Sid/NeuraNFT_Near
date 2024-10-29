import { near } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";

// core/nft_core.js
export class NFTCore {
    constructor(state) {
        this.state = state;
    }

    internal_create_nft(collectionId, name, levelOfOwnership) {
        const creator = near.predecessorAccountId();

        // Get next token ID
        const tokenId = this.state.getNextTokenId(collectionId);
        this.state.incrementTokenId(collectionId);

        // Create NFT Info
        const nftInfo = new NFTInfo({
            levelOfOwnership,
            name,
            creator,
            creationDate: Date.now(),
            owner: creator
        });

        // Store NFT
        this.state.setNFT(collectionId, tokenId, nftInfo);

        // Update collection count
        const currentCount = this.state.getCollectionBalance(collectionId) || 0;
        this.state.collectionCounts.set(collectionId, currentCount + 1);

        // Update owner balances
        this._updateBalances(null, creator, collectionId);

        // Grant absolute ownership access
        this._grantInitialAccess(collectionId, tokenId, creator);

        return tokenId;
    }

    internal_burn_nft(collectionId, tokenId) {
        const nft = this.state.getNFT(collectionId, tokenId);
        if (!nft) {
            near.panicUtf8("NFT does not exist");
        }

        const owner = nft.owner;

        // Update balances before deletion
        this._updateBalances(owner, null, collectionId);

        // Delete NFT data
        const nftKey = this.state.getTokenKey(collectionId, tokenId);
        this.state.nftTokens.remove(nftKey);

        // Delete metadata if exists
        if (this.state.getMetadata(collectionId, tokenId)) {
            this.state.nftMetadata.remove(nftKey);
        }

        // Revoke all access
        this._revokeAllAccess(collectionId, tokenId);

        // Update collection count
        const currentCount = this.state.getCollectionBalance(collectionId) || 1;
        this.state.collectionCounts.set(collectionId, currentCount - 1);

        return true;
    }

    internal_transfer(from, to, collectionId, tokenId) {
        const nft = this.state.getNFT(collectionId, tokenId);
        if (!nft) {
            near.panicUtf8("NFT does not exist");
        }

        if (nft.owner !== from) {
            near.panicUtf8("Not the NFT owner");
        }

        // Update NFT ownership
        nft.owner = to;
        this.state.setNFT(collectionId, tokenId, nft);

        // Update balances
        this._updateBalances(from, to, collectionId);

        // Transfer access rights
        this._transferAccess(collectionId, tokenId, from, to);

        // Clear approvals
        this._clearApprovals(collectionId, tokenId);

        return true;
    }

    _updateBalances(from, to, collectionId) {
        if (from) {
            // Decrease previous owner's balances
            const prevBalance = this.state.getBalance(from);
            const prevCollectionBalance = this.state.getCollectionBalance(from, collectionId);
            
            this.state.tokenBalances.set(from, prevBalance - 1);
            this.state.collectionBalances.set(
                this.state.getBalanceKey(from, collectionId),
                prevCollectionBalance - 1
            );
        }

        if (to) {
            // Increase new owner's balances
            const newBalance = this.state.getBalance(to);
            const newCollectionBalance = this.state.getCollectionBalance(to, collectionId);
            
            this.state.tokenBalances.set(to, newBalance + 1);
            this.state.collectionBalances.set(
                this.state.getBalanceKey(to, collectionId),
                newCollectionBalance + 1
            );
        }
    }

    _grantInitialAccess(collectionId, tokenId, owner) {
        this.state.setAccessLevel(collectionId, tokenId, owner, AccessLevel.AbsoluteOwnership);
    }

    _transferAccess(collectionId, tokenId, from, to) {
        // Get current access level of the sender
        const accessLevel = this.state.getAccessLevel(collectionId, tokenId, from);
        
        // Revoke sender's access
        this.state.setAccessLevel(collectionId, tokenId, from, AccessLevel.None);
        
        // Grant same access level to receiver
        this.state.setAccessLevel(collectionId, tokenId, to, accessLevel);
    }

    _clearApprovals(collectionId, tokenId) {
        const key = this.state.getTokenKey(collectionId, tokenId);
        this.state.tokenApprovals.remove(key);
    }

    _revokeAllAccess(collectionId, tokenId) {
        const nftKey = this.state.getTokenKey(collectionId, tokenId);
        const accessList = this.state.nftAccessList.get(nftKey) || [];
        
        for (const access of accessList) {
            this.state.setAccessLevel(collectionId, tokenId, access.user, AccessLevel.None);
        }
    }
}

