import { call, view } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";
import { near } from "near-sdk-js";

// interfaces/metadata_interface.js
export class MetadataInterface {
    @call({})
    createMetadata({ collectionId, tokenId, metadata }) {
        this._assertAuthorizedEditData(collectionId, tokenId);
        this.core.internal_create_metadata(collectionId, tokenId, metadata);
        near.log(`Metadata Created - Collection: ${collectionId}, Token: ${tokenId}`);
        return true;
    }

    @call({})
    replicateNFT({ collectionId, tokenId, replicaCollectionId, replicaNFTId }) {
        this._assertAuthorized();
        this._assertMetadataExists(collectionId, tokenId);
        
        this.core.internal_replicate_nft(collectionId, tokenId, replicaCollectionId, replicaNFTId);
        near.log(`NFT Replicated - From: ${collectionId}_${tokenId}, To: ${replicaCollectionId}_${replicaNFTId}`);
        return true;
    }

    @call({})
    updateMetadata({ collectionId, tokenId, metadata }) {
        this._assertAuthorizedEditData(collectionId, tokenId);
        this._assertMetadataExists(collectionId, tokenId);
        
        this.core.internal_update_metadata(collectionId, tokenId, metadata);
        near.log(`Metadata Updated - Collection: ${collectionId}, Token: ${tokenId}`);
        return true;
    }

    @call({})
    deleteMetadata({ collectionId, tokenId }) {
        this._assertAuthorized();
        this._assertMetadataExists(collectionId, tokenId);
        
        this.core.internal_delete_metadata(collectionId, tokenId);
        near.log(`Metadata Deleted - Collection: ${collectionId}, Token: ${tokenId}`);
        return true;
    }

    @view({})
    getMetadata({ collectionId, tokenId }) {
        this._assertMetadataExists(collectionId, tokenId);
        return this.state.getMetadata(collectionId, tokenId);
    }

    @view({})
    metadataExists({ collectionId, tokenId }) {
        return this.state.getMetadata(collectionId, tokenId) !== null;
    }
}
