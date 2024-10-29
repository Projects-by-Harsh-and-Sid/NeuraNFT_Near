export const AccessLevel = {
    None: 0,
    UseModel: 1,
    Resale: 2,
    CreateReplica: 3,
    ViewAndDownload: 4,
    EditData: 5,
    AbsoluteOwnership: 6
};

export class AccessEntry {
    constructor(collectionId, nftId, accessLevel) {
        this.collectionId = collectionId;
        this.nftId = nftId;
        this.accessLevel = accessLevel;
    }
} // used to return all NFT access list for a user

export class UserAccess {
    constructor(user, accessLevel) {
        this.user = user;
        this.accessLevel = accessLevel;
    }
} // user to return all access list for a NFT
