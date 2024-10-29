export class CollectionMetadata {
    constructor({
        name,
        contextWindow,
        baseModel,
        image,
        description,
        creator,
        dateCreated,
        owner
    }) {
        this.name = name;
        this.contextWindow = contextWindow;
        this.baseModel = baseModel;
        this.image = image;
        this.description = description;
        this.creator = creator;
        this.dateCreated = dateCreated || Date.now();
        this.owner = owner || creator;
    }

    static fromPayload(payload) {
        return new CollectionMetadata({
            name: payload.name,
            contextWindow: payload.contextWindow,
            baseModel: payload.baseModel,
            image: payload.image,
            description: payload.description,
            creator: payload.creator,
            dateCreated: payload.dateCreated,
            owner: payload.owner
        });
    }

    toJSON() {
        return {
            name: this.name,
            contextWindow: this.contextWindow,
            baseModel: this.baseModel,
            image: this.image,
            description: this.description,
            creator: this.creator,
            dateCreated: this.dateCreated,
            owner: this.owner
        };
    }
}