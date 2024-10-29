import { call, view } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";
import { near } from "near-sdk-js";

// interfaces/nft_interface.js
export class NFTInterface {
    @call({})
    createNFT({ collectionId, name, levelOfOwnership }) {
        // Validation
        if (levelOfOwnership <= 0 || levelOfOwnership > 6) {
            near.panicUtf8("NFTContract: Invalid level of ownership");
        }

        const caller = near.predecessorAccountId();
        const tokenId = this.core.internal_create_nft(collectionId, name, levelOfOwnership);

        // Log the creation
        near.log(`NFT Created - Collection: ${collectionId}, Token: ${tokenId}, Creator: ${caller}`);
        
        return tokenId;
    }

    @call({})
    burnNFT({ collectionId, tokenId }) {
        const caller = near.predecessorAccountId();
        const nftKey = this.state.getTokenKey(collectionId, tokenId);
        const nft = this.state.getNFT(collectionId, tokenId);

        if (!nft) {
            near.panicUtf8("NFTContract: NFT does not exist");
        }
        if (nft.owner !== caller) {
            near.panicUtf8("NFTContract: Not the NFT owner");
        }

        this.core.internal_burn_nft(collectionId, tokenId);
        near.log(`NFT Burned - Collection: ${collectionId}, Token: ${tokenId}`);

        return true;
    }

    @call({})
    transferNFT({ collectionId, tokenId, receiverId }) {
        const caller = near.predecessorAccountId();
        this.core.internal_transfer(caller, receiverId, collectionId, tokenId);
        near.log(`NFT Transferred - Collection: ${collectionId}, Token: ${tokenId}, From: ${caller}, To: ${receiverId}`);
        return true;
    }

    @view({})
    getNFTInfo({ collectionId, tokenId }) {
        return this.state.getNFT(collectionId, tokenId);
    }

    @view({})
    getCollectionNFTCount({ collectionId }) {
        return this.state.getCollectionBalance(collectionId);
    }

    @view({})
    balanceOf({ accountId }) {
        return this.state.getBalance(accountId);
    }

    @view({})
    balanceOfCollection({ accountId, collectionId }) {
        return this.state.getCollectionBalance(accountId, collectionId);
    }

    @view({})
    numberOfHolders({ collectionId }) {
        const holders = new Set();
        const tokens = this.state.nftTokens.toArray()
            .filter(([key]) => key.startsWith(`${collectionId}_`));
        
        for (const [_, nft] of tokens) {
            holders.add(nft.owner);
        }
        
        return holders.size;
    }
}


