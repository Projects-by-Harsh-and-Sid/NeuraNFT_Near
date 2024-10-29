import { near } from "near-sdk-js";
import { NFTInfo, AccessLevel } from "../models";

// core/collection_core.js
export class CollectionCore {

    
    constructor(state) {
        this.state = state;
        this.state.collections.length = 0;
    }

    internal_create_collection(name, contextWindow, baseModel, image, description, creator) {
        const collectionId = this.state.collections.length + 1;
        
        const collection = new CollectionMetadata({
            name,
            contextWindow,
            baseModel,
            image,
            description,
            creator,
            dateCreated: Date.now(),
            owner: creator
        });

        this.state.setCollection(collectionId, collection);
        return collectionId;
    }

    internal_update_collection(collectionId, name, contextWindow, baseModel, image, description) {
        const collection = this.state.getCollection(collectionId);
        if (!collection) {
            near.panicUtf8("Collection does not exist");
        }

        collection.name = name;
        collection.contextWindow = contextWindow;
        collection.baseModel = baseModel;
        collection.image = image;
        collection.description = description;

        this.state.setCollection(collectionId, collection);
        return true;
    }

    internal_transfer_collection(collectionId, newOwner) {
        const collection = this.state.getCollection(collectionId);
        if (!collection) {
            near.panicUtf8("Collection does not exist");
        }

        collection.owner = newOwner;
        this.state.setCollection(collectionId, collection);
        return true;
    }
}