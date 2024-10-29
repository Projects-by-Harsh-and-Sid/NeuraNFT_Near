export class Metadata {
    constructor({
        image,
        baseModel,
        data,
        rag,
        fineTuneData,
        description
    }) {
        this.image = image;               // BTFS URL of the image
        this.baseModel = baseModel;       // Base model identifier
        this.data = data;                 // BTFS URL of data
        this.rag = rag;                   // BTFS URL of RAG
        this.fineTuneData = fineTuneData; // BTFS URL of fine-tune data
        this.description = description;    // Text description
    }

    static fromPayload(payload) {
        return new Metadata({
            image: payload.image,
            baseModel: payload.baseModel,
            data: payload.data,
            rag: payload.rag,
            fineTuneData: payload.fineTuneData,
            description: payload.description
        });
    }

    toJSON() {
        return {
            image: this.image,
            baseModel: this.baseModel,
            data: this.data,
            rag: this.rag,
            fineTuneData: this.fineTuneData,
            description: this.description
        };
    }
}

export class Replica {
    constructor(replicaCollectionId, replicaNFTId) {
        this.replicaCollectionId = replicaCollectionId;
        this.replicaNFTId = replicaNFTId;
    }

    static fromPayload(payload) {
        return new Replica(
            payload.replicaCollectionId,
            payload.replicaNFTId
        );
    }

    toJSON() {
        return {
            replicaCollectionId: this.replicaCollectionId,
            replicaNFTId: this.replicaNFTId
        };
    }
}