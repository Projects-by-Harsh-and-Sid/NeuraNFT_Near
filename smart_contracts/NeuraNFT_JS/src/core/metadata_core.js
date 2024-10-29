import { near } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";

// core/metadata_core.js
export class MetadataCore {
    constructor(state) {
        this.state = state;
    }

    internal_create_metadata(collectionId, tokenId, metadata) {
        this.state.setMetadata(collectionId, tokenId, metadata);
        return true;
    }

    internal_replicate_nft(collectionId, tokenId, replicaCollectionId, replicaNFTId) {
        const metadata = this.state.getMetadata(replicaCollectionId, replicaNFTId);
        if (!metadata) {
            near.panicUtf8("Original NFT metadata does not exist");
        }

        this.state.setMetadata(collectionId, tokenId, metadata);
        return true;
    }

    internal_update_metadata(collectionId, tokenId, metadata) {
        this.state.setMetadata(collectionId, tokenId, metadata);
        return true;
    }

    internal_delete_metadata(collectionId, tokenId) {
        const key = this.state.getTokenKey(collectionId, tokenId);
        this.state.nftMetadata.remove(key);
        return true;
    }
}
