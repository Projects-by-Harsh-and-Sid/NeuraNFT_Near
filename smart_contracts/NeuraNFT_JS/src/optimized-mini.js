import { NearBindgen, near, call, view, initialize, UnorderedMap, LookupMap } from "near-sdk-js";

@NearBindgen({})
export class NeuraNFT {

    // constructor() {
    //     // Storage for NFTs and metadata
    //     this.nftTokens = new UnorderedMap('t');           // collectionId_tokenId -> NFTInfo
    //     this.nftMetadata = new LookupMap('m');           // collectionId_tokenId -> Metadata
    //     this.tokenBalances = new LookupMap('b');         // owner -> total NFTs
    //     this.collectionBalances = new LookupMap('cb');   // owner_collectionId -> collection NFTs
        
    //     // Collections storage
    //     this.collections = new UnorderedMap('c');        // collectionId -> CollectionMetadata
    //     this.nextTokenId = new LookupMap('n');          // collectionId -> next token id
    //     this.nextCollectionId = 1;
        
    //     // Access control storage
    //     this.nftAccess = new LookupMap('a');            // collectionId_tokenId_user -> AccessLevel
    //     this.defaultAccess = new LookupMap('da');       // collectionId_tokenId -> AccessLevel
    //     this.maxAccess = new LookupMap('ma');          // collectionId_tokenId -> AccessLevel
        
    //     // Contract owner
    //     this.owner = null;
    // }



    // // Initialization
    // @initialize({})
    // init() {
    //     if (this.owner) {
    //         near.panicUtf8("Contract already initialized");
    //     }
    //     this.owner = near.predecessorAccountId();
    // }

        // Storage for NFTs and metadata
    nftTokens          = new UnorderedMap('t');           // collectionId_tokenId -> NFTInfo
    nftMetadata        = new LookupMap('m');           // collectionId_tokenId -> Metadata
    tokenBalances      = new LookupMap('b');         // owner -> total NFTs
    collectionBalances = new LookupMap('cb');   // owner_collectionId -> collection NFTs
    
    // Collections storage
    collections        = new UnorderedMap('c');        // collectionId -> CollectionMetadata
    nextTokenId        = new LookupMap('n');          // collectionId -> next token id
    nextCollectionId   = 1;
    
    // Access control storage
    nftAccess          = new LookupMap('a');            // collectionId_tokenId_user -> AccessLevel
    defaultAccess      = new LookupMap('da');       // collectionId_tokenId -> AccessLevel
    maxAccess          = new LookupMap('ma');          // collectionId_tokenId -> AccessLevel

    // nftUserAccess = new UnorderedMap('nua');  // collectionId_tokenId -> array of {user, accessLevel}

    
    @initialize({})
    init() {
        // // Storage for NFTs and metadata
        // this.nftTokens          = new UnorderedMap('t');           // collectionId_tokenId -> NFTInfo
        // this.nftMetadata        = new LookupMap('m');           // collectionId_tokenId -> Metadata
        // this.tokenBalances      = new LookupMap('b');         // owner -> total NFTs
        // this.collectionBalances = new LookupMap('cb');   // owner_collectionId -> collection NFTs
        
        // // Collections storage
        // this.collections        = new UnorderedMap('c');        // collectionId -> CollectionMetadata
        // this.nextTokenId        = new LookupMap('n');          // collectionId -> next token id
        // this.nextCollectionId   = 1;
        
        // // Access control storage
        // this.nftAccess          = new LookupMap('a');            // collectionId_tokenId_user -> AccessLevel
        // this.defaultAccess = new LookupMap('da');       // collectionId_tokenId -> AccessLevel
        // this.maxAccess = new LookupMap('ma');          // collectionId_tokenId -> AccessLevel
        
        // // Contract owner
        // this.owner = null;

        // if (this.owner) {
        //     near.panicUtf8("Contract already initialized");
        // }

        this.owner = near.predecessorAccountId();
    }



    // Enums and Constants
    AccessLevel = {
        None: 0,
        UseModel: 1,
        Resale: 2,
        CreateReplica: 3,
        ViewAndDownload: 4,
        EditData: 5,
        AbsoluteOwnership: 6
    };

    // Helper functions
    _getTokenKey(collectionId, tokenId) {
        return `${collectionId}_${tokenId}`;
    }

    _getAccessKey(collectionId, tokenId, user) {
        return `${collectionId}_${tokenId}_${user}`;
    }

    _getBalanceKey(owner, collectionId) {
        return `${owner}_${collectionId}`;
    }

    _assertOwner() {
        if (near.predecessorAccountId() !== this.owner) {
            near.panicUtf8("Only contract owner can call this method");
        }
    }

    _assertNFTOwner(collectionId, tokenId) {
        const nft = this.nftTokens.get(this._getTokenKey(collectionId, tokenId));
        if (!nft || nft.owner !== near.predecessorAccountId()) {
            near.panicUtf8("Not the NFT owner");
        }
    }

    _assertValidInputs(input) {
        if (!input || typeof input !== 'object') {
            near.panicUtf8("Invalid input format");
        }
    }


    // Collection Management
    @call({})
    createCollection({ name, contextWindow, baseModel, image, description }) {

        this._assertValidInputs({ name, contextWindow, baseModel });
        
        const collectionId  = this.nextCollectionId++;
        const creator       = near.predecessorAccountId();
        
        this.collections.set(collectionId, {
            name,
            contextWindow,
            baseModel,
            image: image || "",
            description: description || "",
            creator,
            dateCreated: Date.now(),
            owner: creator
        });

        near.log(`Collection created: ${collectionId}`);
        return collectionId;
    }

    @call({})
    updateCollection({ collectionId, name, contextWindow, baseModel, image, description }) {
        const collection = this.collections.get(collectionId);
        if (!collection || collection.owner !== near.predecessorAccountId()) {
            near.panicUtf8("Not authorized to update collection");
        }

        this.collections.set(collectionId, {
            ...collection,
            name: name || collection.name,
            contextWindow: contextWindow || collection.contextWindow,
            baseModel: baseModel || collection.baseModel,
            image: image || collection.image,
            description: description || collection.description
        });
    }

    // NFT Management
    @call({})
    createNFT({ collectionId, name, levelOfOwnership }) {
        if (levelOfOwnership < 1 || levelOfOwnership > 6) {
            near.panicUtf8("Invalid level of ownership");
        }

        const collection = this.collections.get(collectionId);
        if (!collection) {
            near.panicUtf8("Collection does not exist");
        }

        const creator = near.predecessorAccountId();
        const tokenId = this.nextTokenId.get(collectionId) || 1;
        this.nextTokenId.set(collectionId, tokenId + 1);

        const nft = {
            levelOfOwnership,
            name,
            creator,
            creationDate: Date.now(),
            owner: creator
        };

        const tokenKey = this._getTokenKey(collectionId, tokenId);
        this.nftTokens.set(tokenKey, nft);

        // Update balances
        const balance = this.tokenBalances.get(creator) || 0;
        this.tokenBalances.set(creator, balance + 1);

        const collectionBalance = this.collectionBalances.get(this._getBalanceKey(creator, collectionId)) || 0;
        this.collectionBalances.set(this._getBalanceKey(creator, collectionId), collectionBalance + 1);

        // Set initial access
        this._setAccess(collectionId, tokenId, creator, this.AccessLevel.AbsoluteOwnership);

        near.log(`NFT created: ${tokenId} in collection ${collectionId}`);
        return tokenId;
    }

    @call({})
    transferNFT({ collectionId, tokenId, receiverId }) {
        this._assertNFTOwner(collectionId, tokenId);
        
        const tokenKey = this._getTokenKey(collectionId, tokenId);
        const nft = this.nftTokens.get(tokenKey);
        const sender = near.predecessorAccountId();

        // Update balances
        const senderBalance = this.tokenBalances.get(sender) || 1;
        const receiverBalance = this.tokenBalances.get(receiverId) || 0;
        this.tokenBalances.set(sender, senderBalance - 1);
        this.tokenBalances.set(receiverId, receiverBalance + 1);

        // Update collection balances
        const senderCollBalance = this.collectionBalances.get(this._getBalanceKey(sender, collectionId)) || 1;
        const receiverCollBalance = this.collectionBalances.get(this._getBalanceKey(receiverId, collectionId)) || 0;
        this.collectionBalances.set(this._getBalanceKey(sender, collectionId), senderCollBalance - 1);
        this.collectionBalances.set(this._getBalanceKey(receiverId, collectionId), receiverCollBalance + 1);

        // Transfer NFT
        nft.owner = receiverId;
        this.nftTokens.set(tokenKey, nft);

        // Transfer access rights
        const accessLevel = this.getAccessLevel({ collectionId, tokenId, user: sender });
        this._setAccess(collectionId, tokenId, sender, this.AccessLevel.None);
        this._setAccess(collectionId, tokenId, receiverId, accessLevel);

        near.log(`NFT transferred: ${tokenId} from ${sender} to ${receiverId}`);
    }

    // Access Control
    @call({})
    setAccess({ collectionId, tokenId, user, level }) {
        this._assertNFTOwner(collectionId, tokenId);
        if (level < 0 || level > 6) {
            near.panicUtf8("Invalid access level");
        }

        this._setAccess(collectionId, tokenId, user, level);
    }

    _setAccess(collectionId, tokenId, user, level) {
        const accessKey = this._getAccessKey(collectionId, tokenId, user);
        this.nftAccess.set(accessKey, level);
    }

    @view({})
    getAccessLevel({ collectionId, tokenId, user }) {
        const accessKey = this._getAccessKey(collectionId, tokenId, user);
        const level = this.nftAccess.get(accessKey);
        if (level === null || level === undefined) {
            return this.defaultAccess.get(this._getTokenKey(collectionId, tokenId)) || this.AccessLevel.None;
        }
        return level;
    }

    // Metadata Management
    @call({})
    setMetadata({ collectionId, tokenId, metadata }) {
        this._assertNFTOwner(collectionId, tokenId);
        this._assertValidInputs(metadata);

        const requiredFields = ['image', 'baseModel', 'data', 'description'];
        for (const field of requiredFields) {
            if (!metadata[field]) {
                near.panicUtf8(`Missing required field: ${field}`);
            }
        }

        this.nftMetadata.set(this._getTokenKey(collectionId, tokenId), metadata);
    }

    // View Methods
    @view({})
    getNFTInfo({ collectionId, tokenId }) {
        return this.nftTokens.get(this._getTokenKey(collectionId, tokenId));
    }

    @view({})
    getMetadata({ collectionId, tokenId }) {
        return this.nftMetadata.get(this._getTokenKey(collectionId, tokenId));
    }

    @view({})
    getCollection({ collectionId }) {
        return this.collections.get(collectionId);
    }

    @view({})
    getBalance({ owner }) {
        return this.tokenBalances.get(owner) || 0;
    }

    @view({})
    getCollectionBalance({ owner, collectionId }) {
        return this.collectionBalances.get(this._getBalanceKey(owner, collectionId)) || 0;
    }

    @view({})
    getAllCollections() {
        return this.collections.toArray().map(([id, collection]) => ({
            id,
            ...collection
        }));
    }

    @call({})
    burnNFT({ collectionId, tokenId }) {
        this._assertNFTOwner(collectionId, tokenId);
        
        const tokenKey = this._getTokenKey(collectionId, tokenId);
        const nft = this.nftTokens.get(tokenKey);
        const owner = nft.owner;

        // Update balances
        const balance = this.tokenBalances.get(owner);
        this.tokenBalances.set(owner, balance - 1);

        const collectionBalance = this.collectionBalances.get(this._getBalanceKey(owner, collectionId));
        this.collectionBalances.set(this._getBalanceKey(owner, collectionId), collectionBalance - 1);

        // Remove NFT data
        this.nftTokens.remove(tokenKey);
        this.nftMetadata.remove(tokenKey);
        
        near.log(`NFT burned: ${tokenId} from collection ${collectionId}`);
    }


    @view({})
    getAllUserAccessLevels({ user }) {
        const allAccess = [];
        
        // Iterate through collections
        const collections = this.collections.toArray();
        for (const [collectionId, _] of collections) {
            const nextTokenId = this.nextTokenId.get(collectionId) || 1;
            
            // Check each token in the collection
            for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
                const accessLevel = this.getAccessLevel({ collectionId, tokenId, user });
                if (accessLevel > this.AccessLevel.None) {
                    allAccess.push({
                        collectionId,
                        tokenId,
                        accessLevel
                    });
                }
            }
        }
        
        return allAccess;
    }




    @view({})
    getNFTAccessUsers({ collectionId, tokenId }) {
        const users = [];
        const tokenKey = this._getTokenKey(collectionId, tokenId);
        
        // Get NFT info to verify it exists
        const nft = this.nftTokens.get(tokenKey);
        if (!nft) {
            near.panicUtf8("NFT does not exist");
        }

        // Iterate through all accounts that have interacted with the contract
        // This is a simplified approach - in production, you'd want to maintain a separate index
        const accessKeys = this.nftAccess.keys();
        for (const key of accessKeys) {
            if (key.startsWith(`${collectionId}_${tokenId}_`)) {
                const user = key.split('_')[2];
                const accessLevel = this.nftAccess.get(key);
                if (accessLevel > this.AccessLevel.None) {
                    users.push({
                        user,
                        accessLevel
                    });
                }
            }
        }

        return {
            nftInfo: nft,
            users: users,
            defaultAccess: this.defaultAccess.get(tokenKey) || this.AccessLevel.None
        };
    }

    @view({})
    getCollectionsFullInfo() {
        return this.collections.toArray().map(([collectionId, collection]) => {
            const nftCount = this.getCollectionNFTCount({ collectionId });
            const uniqueHolders = this.getCollectionUniqueHolders({ collectionId });
            
            return {
                collectionId,
                ...collection,
                statistics: {
                    totalNFTs: nftCount,
                    uniqueHolders
                }
            };
        });
    }

    @view({})
    getAllNFTsWithMetadata() {
        const allNFTs = [];
        
        // Iterate through collections
        const collections = this.collections.toArray();
        for (const [collectionId, collection] of collections) {
            const nextTokenId = this.nextTokenId.get(collectionId) || 1;
            
            // Get each NFT in the collection
            for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
                const tokenKey = this._getTokenKey(collectionId, tokenId);
                const nft = this.nftTokens.get(tokenKey);
                
                if (nft) {
                    allNFTs.push({
                        collectionId,
                        tokenId,
                        nftData: nft,
                        metadata: this.nftMetadata.get(tokenKey),
                        accessData: {
                            defaultAccess: this.defaultAccess.get(tokenKey),
                            maxAccess: this.maxAccess.get(tokenKey)
                        }
                    });
                }
            }
        }
        
        return allNFTs;
    }

    @view({})
    getCollectionNFTs({ collectionId }) {
        const collection = this.collections.get(collectionId);
        if (!collection) {
            near.panicUtf8("Collection does not exist");
        }

        const nfts = [];
        const nextTokenId = this.nextTokenId.get(collectionId) || 1;

        for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
            const tokenKey = this._getTokenKey(collectionId, tokenId);
            const nft = this.nftTokens.get(tokenKey);
            
            if (nft) {
                nfts.push({
                    tokenId,
                    nftData: nft,
                    metadata: this.nftMetadata.get(tokenKey),
                    accessData: {
                        defaultAccess: this.defaultAccess.get(tokenKey),
                        maxAccess: this.maxAccess.get(tokenKey)
                    }
                });
            }
        }

        return {
            collection,
            nfts
        };
    }

    @view({})
    getUserNFTs({ user }) {
        const userNFTs = [];
        
        // Iterate through collections
        const collections = this.collections.toArray();
        for (const [collectionId, _] of collections) {
            const nextTokenId = this.nextTokenId.get(collectionId) || 1;
            
            // Check each token in the collection
            for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
                const tokenKey = this._getTokenKey(collectionId, tokenId);
                const nft = this.nftTokens.get(tokenKey);
                
                if (nft && nft.owner === user) {
                    userNFTs.push({
                        collectionId,
                        tokenId,
                        nftData: nft,
                        metadata: this.nftMetadata.get(tokenKey),
                        accessData: {
                            defaultAccess: this.defaultAccess.get(tokenKey),
                            maxAccess: this.maxAccess.get(tokenKey),
                            userAccess: this.getAccessLevel({ collectionId, tokenId, user })
                        }
                    });
                }
            }
        }
        
        return userNFTs;
    }

    @view({})
    getNFTFullData({ collectionId, tokenId }) {
        const tokenKey = this._getTokenKey(collectionId, tokenId);
        const nft = this.nftTokens.get(tokenKey);
        
        if (!nft) {
            near.panicUtf8("NFT does not exist");
        }

        const collection = this.collections.get(collectionId);
        if (!collection) {
            near.panicUtf8("Collection does not exist");
        }

        // Get all users with access to this NFT
        const users = this.getNFTAccessUsers({ collectionId, tokenId });

        return {
            collection,
            nft: {
                tokenId,
                nftData: nft,
                metadata: this.nftMetadata.get(tokenKey),
                accessData: {
                    defaultAccess: this.defaultAccess.get(tokenKey),
                    maxAccess: this.maxAccess.get(tokenKey),
                    users: users
                }
            }
        };
    }

    // Helper method to count collection NFTs
    @view({})
    getCollectionNFTCount({ collectionId }) {
        let count = 0;
        const nextTokenId = this.nextTokenId.get(collectionId) || 1;
        
        for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
            const tokenKey = this._getTokenKey(collectionId, tokenId);
            if (this.nftTokens.get(tokenKey)) {
                count++;
            }
        }
        
        return count;
    }

    @view({})
    getCollectionUniqueHolders({ collectionId }) {
        const holders = new Set();
        const nextTokenId = this.nextTokenId.get(collectionId) || 1;
        
        for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
            const tokenKey = this._getTokenKey(collectionId, tokenId);
            const nft = this.nftTokens.get(tokenKey);
            if (nft && nft.owner) {
                holders.add(nft.owner);
            }
        }
        
        return holders.size;
    }

}