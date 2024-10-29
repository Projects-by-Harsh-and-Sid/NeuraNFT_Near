import { call, view } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";
import { near } from "near-sdk-js";

// interfaces/collection_interface.js
export class CollectionInterface {
    @call({})
    createCollection({ name, contextWindow, baseModel, image, description }) {
        const caller = near.predecessorAccountId();
        const collectionId = this.core.internal_create_collection(
            name,
            contextWindow,
            baseModel,
            image,
            description,
            caller
        );
        near.log(`Collection Created - ID: ${collectionId}, Creator: ${caller}`);
        return collectionId;
    }

    @call({})
    updateCollection({ collectionId, name, contextWindow, baseModel, image, description }) {
        this._assertCollectionOwner(collectionId);
        this.core.internal_update_collection(
            collectionId,
            name,
            contextWindow,
            baseModel,
            image,
            description
        );
        near.log(`Collection Updated - ID: ${collectionId}`);
        return true;
    }

    @call({})
    transferCollection({ collectionId, newOwnerId }) {
        this._assertCollectionOwner(collectionId);
        if (!newOwnerId) {
            near.panicUtf8("CollectionContract: Invalid new owner address");
        }
        this.core.internal_transfer_collection(collectionId, newOwnerId);
        near.log(`Collection Transferred - ID: ${collectionId}, New Owner: ${newOwnerId}`);
        return true;
    }

    @view({})
    getCollectionMetadata({ collectionId }) {
        return this.state.getCollection(collectionId);
    }

    @view({})
    getCollectionOwner({ collectionId }) {
        const collection = this.state.getCollection(collectionId);
        return collection ? collection.owner : null;
    }

    @view({})
    getTotalCollections() {
        return this.state.collections.length;
    }

    @view({})
    getAllCollections() {
        return this.state.collections.toArray().map(([_, collection]) => collection);
    }

    @view({})
    getCollectionUniqueHolders({ collectionId }) {
        return this.numberOfHolders({ collectionId });
    }
}