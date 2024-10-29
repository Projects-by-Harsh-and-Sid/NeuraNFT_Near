export class NFTInfo {

    constructor({
        levelOfOwnership,
        name,
        creator,
        creationDate,
        owner
    }) {
        this.levelOfOwnership = levelOfOwnership;
        this.name = name;
        this.creator = creator;
        this.creationDate = creationDate || Date.now();
        this.owner = owner;
    }

    static fromPayload(payload) {
        return new NFTInfo({
            levelOfOwnership: payload.levelOfOwnership,
            name: payload.name,
            creator: payload.creator,
            creationDate: payload.creationDate,
            owner: payload.owner
        });
    }

    toJSON() {
        return {
            levelOfOwnership: this.levelOfOwnership,
            name: this.name,
            creator: this.creator,
            creationDate: this.creationDate,
            owner: this.owner
        };
    }
} // single NFT information