import { NearBindgen, near, call, view, initialize, UnorderedMap } from "near-sdk-js";

enum AccessLevel {
    None = 0,
    UseModel = 1,
    Resale = 2,
    CreateReplica = 3,
    ViewAndDownload = 4,
    EditData = 5,
    AbsoluteOwnership = 6
  }


  interface NFTInfo {
    levelOfOwnership: number;
    name: string;
    creator: string;
    creationDate: number;
    owner: string;
  }

  interface Metadata {
    image: string;
    baseModel: string;
    data: string;
    description: string;
  }

  interface CollectionMetadata {
    name: string;
    contextWindow: number;
    baseModel: string;
    image: string;
    description: string;
    creator: string;
    dateCreated: number;
    owner: string;
  }

@NearBindgen({})
export class NeuraNFT {
  // Enums and Constants


  // Interfaces

  // Storage for NFTs and metadata
  nftTokens: UnorderedMap<NFTInfo> = new UnorderedMap<NFTInfo>('t'); // collectionId_tokenId -> NFTInfo
  nftMetadata: UnorderedMap<Metadata> = new UnorderedMap<Metadata>('m'); // collectionId_tokenId -> Metadata
  tokenBalances: UnorderedMap<number> = new UnorderedMap<number>('b'); // owner -> total NFTs
  collectionBalances: UnorderedMap<number> = new UnorderedMap<number>('cb'); // owner_collectionId -> collection NFTs

  // Collections storage
  collections: UnorderedMap<CollectionMetadata> = new UnorderedMap<CollectionMetadata>('c'); // collectionId -> CollectionMetadata
  nextTokenId: UnorderedMap<number> = new UnorderedMap<number>('n'); // collectionId -> next token id
  nextCollectionId: number = 1;

  // Access control storage
  nftAccess: UnorderedMap<number> = new UnorderedMap<number>('a'); // collectionId_tokenId_user -> AccessLevel
  defaultAccess: UnorderedMap<number> = new UnorderedMap<number>('da'); // collectionId_tokenId -> AccessLevel
  maxAccess: UnorderedMap<number> = new UnorderedMap<number>('ma'); // collectionId_tokenId -> AccessLevel

  // Contract owner
  owner: string = '';

  @initialize({})
  init(): void {
    this.owner = near.predecessorAccountId();
  }

  // Helper functions
  private _getTokenKey(collectionId: number, tokenId: number): string {
    return `${collectionId}_${tokenId}`;
  }

  private _getAccessKey(collectionId: number, tokenId: number, user: string): string {
    return `${collectionId}_${tokenId}_${user}`;
  }

  private _getBalanceKey(owner: string, collectionId: number): string {
    return `${owner}_${collectionId}`;
  }

  private _assertOwner(): void {
    if (near.predecessorAccountId() !== this.owner) {
      near.panicUtf8(new TextEncoder().encode("Only contract owner can call this method"));
    }
  }

  private _assertNFTOwner(collectionId: number, tokenId: number): void {
    const nft = this.nftTokens.get(this._getTokenKey(collectionId, tokenId));
    if (!nft || nft.owner !== near.predecessorAccountId()) {
      near.panicUtf8(new TextEncoder().encode("Not the NFT owner"));
    }
  }

  private _assertValidInputs(input: any): void {
    if (!input || typeof input !== 'object') {
      near.panicUtf8(new TextEncoder().encode("Invalid input format"));
    }
  }



  
  // Collection Management
  @call({})
  createCollection({ name, contextWindow, baseModel, image, description }: { name: string; contextWindow: number; baseModel: string; image?: string; description?: string }): number {
    this._assertValidInputs({ name, contextWindow, baseModel });

    const collectionId = this.nextCollectionId++;
    const creator = near.predecessorAccountId();

    this.collections.set(collectionId.toString(), {
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
  updateCollection({ collectionId, name, contextWindow, baseModel, image, description }: { collectionId: number; name?: string; contextWindow?: number; baseModel?: string; image?: string; description?: string }): void {
    const collection = this.collections.get(collectionId.toString());
    if (!collection || collection.owner !== near.predecessorAccountId()) {
      near.panicUtf8(new TextEncoder().encode("Not authorized to update collection"));
    }

    this.collections.set(collectionId.toString(), {
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
  createNFT({ collectionId, name, levelOfOwnership }: { collectionId: number; name: string; levelOfOwnership: number }): number {
    if (levelOfOwnership < 1 || levelOfOwnership > 6) {
      near.panicUtf8(new TextEncoder().encode("Invalid level of ownership"));
    }

    const collection = this.collections.get(collectionId.toString());
    if (!collection) {
      near.panicUtf8(new TextEncoder().encode("Collection does not exist"));
    }

    const creator = near.predecessorAccountId();
    const tokenId = this.nextTokenId.get(collectionId.toString()) || 1;
    this.nextTokenId.set(collectionId.toString(), tokenId + 1);

    const nft: NFTInfo = {
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

    const collectionBalanceKey = this._getBalanceKey(creator, collectionId);
    const collectionBalance = this.collectionBalances.get(collectionBalanceKey) || 0;
    this.collectionBalances.set(collectionBalanceKey, collectionBalance + 1);

    // Set initial access
    this._setAccess(collectionId, tokenId, creator, AccessLevel.AbsoluteOwnership);

    near.log(`NFT created: ${tokenId} in collection ${collectionId}`);
    return tokenId;
  }

  @call({})
  transferNFT({ collectionId, tokenId, receiverId }: { collectionId: number; tokenId: number; receiverId: string }): void {
    this._assertNFTOwner(collectionId, tokenId);

    const tokenKey = this._getTokenKey(collectionId, tokenId);
    const nft = this.nftTokens.get(tokenKey)!;
    const sender = near.predecessorAccountId();

    // Update balances
    const senderBalance = this.tokenBalances.get(sender) || 1;
    const receiverBalance = this.tokenBalances.get(receiverId) || 0;
    this.tokenBalances.set(sender, senderBalance - 1);
    this.tokenBalances.set(receiverId, receiverBalance + 1);

    // Update collection balances
    const senderCollBalanceKey = this._getBalanceKey(sender, collectionId);
    const receiverCollBalanceKey = this._getBalanceKey(receiverId, collectionId);
    const senderCollBalance = this.collectionBalances.get(senderCollBalanceKey) || 1;
    const receiverCollBalance = this.collectionBalances.get(receiverCollBalanceKey) || 0;
    this.collectionBalances.set(senderCollBalanceKey, senderCollBalance - 1);
    this.collectionBalances.set(receiverCollBalanceKey, receiverCollBalance + 1);

    // Transfer NFT
    nft.owner = receiverId;
    this.nftTokens.set(tokenKey, nft);

    // Transfer access rights
    const accessLevel = this.getAccessLevel({ collectionId, tokenId, user: sender });
    this._setAccess(collectionId, tokenId, sender, AccessLevel.None);
    this._setAccess(collectionId, tokenId, receiverId, accessLevel);

    near.log(`NFT transferred: ${tokenId} from ${sender} to ${receiverId}`);
  }

  // Access Control
  @call({})
  setAccess({ collectionId, tokenId, user, level }: { collectionId: number; tokenId: number; user: string; level: number }): void {
    this._assertNFTOwner(collectionId, tokenId);
    if (level < 0 || level > 6) {
      near.panicUtf8(new TextEncoder().encode("Invalid access level"));
    }

    this._setAccess(collectionId, tokenId, user, level);
  }

  private _setAccess(collectionId: number, tokenId: number, user: string, level: number): void {
    const accessKey = this._getAccessKey(collectionId, tokenId, user);
    this.nftAccess.set(accessKey, level);
  }

  @view({})
  getAccessLevel({ collectionId, tokenId, user }: { collectionId: number; tokenId: number; user: string }): number {
    const accessKey = this._getAccessKey(collectionId, tokenId, user);
    const level = this.nftAccess.get(accessKey);
    if (level === null || level === undefined) {
      return this.defaultAccess.get(this._getTokenKey(collectionId, tokenId)) || AccessLevel.None;
    }
    return level;
  }

  // Metadata Management
  @call({})
  setMetadata({ collectionId, tokenId, metadata }: { collectionId: number; tokenId: number; metadata: Metadata }): void {
    this._assertNFTOwner(collectionId, tokenId);
    this._assertValidInputs(metadata);

    const requiredFields = ['image', 'baseModel', 'data', 'description'];
    for (const field of requiredFields) {
      if (!(metadata as any)[field]) {
        near.panicUtf8(new TextEncoder().encode(`Missing required field: ${field}`));
      }
    }

    this.nftMetadata.set(this._getTokenKey(collectionId, tokenId), metadata);
  }

  
  @call({})
  createNFTWithMetadata({ collectionId, name, levelOfOwnership , metadata } : { collectionId: number;  name: string; levelOfOwnership: number; metadata: Metadata }) : number
  {
      const tokenId = this.createNFT({ collectionId, name, levelOfOwnership });
      this.setMetadata({ collectionId, tokenId, metadata });
      return tokenId;
  }


  // View Methods
  @view({})
  getNFTInfo({ collectionId, tokenId }: { collectionId: number; tokenId: number }): NFTInfo | null {
    return this.nftTokens.get(this._getTokenKey(collectionId, tokenId));
  }

  @view({})
  getMetadata({ collectionId, tokenId }: { collectionId: number; tokenId: number }): Metadata | null {
    return this.nftMetadata.get(this._getTokenKey(collectionId, tokenId));
  }

  @view({})
  getCollection({ collectionId }: { collectionId: number }): CollectionMetadata | null {
    return this.collections.get(collectionId.toString());
  }

  @view({})
  getBalance({ owner }: { owner: string }): number {
    return this.tokenBalances.get(owner) || 0;
  }

  @view({})
  getCollectionBalance({ owner, collectionId }: { owner: string; collectionId: number }): number {
    return this.collectionBalances.get(this._getBalanceKey(owner, collectionId)) || 0;
  }

  @view({})
  getAllCollections(): Array<CollectionMetadata & { id: string }> {
    return this.collections.toArray().map(([id, collection]) => ({
      id,
      ...collection
    }));
  }

  @call({})
  burnNFT({ collectionId, tokenId }: { collectionId: number; tokenId: number }): void {
    this._assertNFTOwner(collectionId, tokenId);

    const tokenKey = this._getTokenKey(collectionId, tokenId);
    const nft = this.nftTokens.get(tokenKey)!;
    const owner = nft.owner;

    // Update balances
    const balance = this.tokenBalances.get(owner);
    this.tokenBalances.set(owner, (balance || 1) - 1);

    const collectionBalanceKey = this._getBalanceKey(owner, collectionId);
    const collectionBalance = this.collectionBalances.get(collectionBalanceKey);
    this.collectionBalances.set(collectionBalanceKey, (collectionBalance || 1) - 1);

    // Remove NFT data
    this.nftTokens.remove(tokenKey);
    this.nftMetadata.remove(tokenKey);

    near.log(`NFT burned: ${tokenId} from collection ${collectionId}`);
  }

  @view({})
  getAllUserAccessLevels({ user }: { user: string }): Array<{ collectionId: number; tokenId: number; accessLevel: number }> {
    const allAccess: Array<{ collectionId: number; tokenId: number; accessLevel: number }> = [];

    // Iterate through collections
    const collections = this.collections.toArray();
    for (const [collectionIdStr, _] of collections) {
      const collectionId = parseInt(collectionIdStr);
      const nextTokenId = this.nextTokenId.get(collectionIdStr) || 1;

      // Check each token in the collection
      for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
        const accessLevel = this.getAccessLevel({ collectionId, tokenId, user });
        if (accessLevel > AccessLevel.None) {
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
  getNFTAccessUsers({ collectionId, tokenId }: { collectionId: number; tokenId: number }): { nftInfo: NFTInfo; users: Array<{ user: string; accessLevel: number }>; defaultAccess: number } {
    const users: Array<{ user: string; accessLevel: number }> = [];
    const tokenKey = this._getTokenKey(collectionId, tokenId);

    // Get NFT info to verify it exists
    const nft = this.nftTokens.get(tokenKey);
    if (!nft) {
      near.panicUtf8(new TextEncoder().encode("NFT does not exist"));
    }

    // Iterate through all accounts that have interacted with the contract
    // This is a simplified approach - in production, you'd want to maintain a separate index
    const accessKeys = (this.nftAccess as any)._keys as Array<string>;

    for (const key of accessKeys) {
      if (key.startsWith(`${collectionId}_${tokenId}_`)) {
        const user = key.split('_')[2];
        const accessLevel = this.nftAccess.get(key);

        if (accessLevel === null || accessLevel === undefined) {
          continue;
        }

        if ( accessLevel > AccessLevel.None) {
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
      defaultAccess: this.defaultAccess.get(tokenKey) || AccessLevel.None
    };
  }

  @view({})
  getCollectionsFullInfo(): Array<any> {
    return this.collections.toArray().map(([collectionIdStr, collection]) => {
      const collectionId = parseInt(collectionIdStr);
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
  getAllNFTsWithMetadata(): Array<any> {
    const allNFTs: Array<any> = [];

    // Iterate through collections
    const collections = this.collections.toArray();
    for (const [collectionIdStr, collection] of collections) {
      const collectionId = parseInt(collectionIdStr);
      const nextTokenId = this.nextTokenId.get(collectionIdStr) || 1;

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
  getCollectionNFTs({ collectionId }: { collectionId: number }): { collection: CollectionMetadata; nfts: Array<any> } {
    const collection = this.collections.get(collectionId.toString());
    if (!collection) {
      near.panicUtf8(new TextEncoder().encode("Collection does not exist"));
    }

    const nfts: Array<any> = [];
    const nextTokenId = this.nextTokenId.get(collectionId.toString()) || 1;

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
  getUserNFTs({ user }: { user: string }): Array<any> {
    const userNFTs: Array<any> = [];

    // Iterate through collections
    const collections = this.collections.toArray();
    for (const [collectionIdStr, _] of collections) {
      const collectionId = parseInt(collectionIdStr);
      const nextTokenId = this.nextTokenId.get(collectionIdStr) || 1;

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
  getUserAccessibleNFTs({ user }: { user: string }): Array<any> {
    const userNFTs: Array<any> = [];

    // Iterate through collections
    const collections = this.collections.toArray();
    for (const [collectionIdStr, _] of collections) {
      const collectionId = parseInt(collectionIdStr);
      const nextTokenId = this.nextTokenId.get(collectionIdStr) || 1;

      // Check each token in the collection
      for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
        const tokenKey = this._getTokenKey(collectionId, tokenId);
        const nft = this.nftTokens.get(tokenKey);

        const access = this.getAccessLevel({ collectionId, tokenId, user })

        if (nft && access && access > AccessLevel.None) {
          userNFTs.push({
            collectionId,
            tokenId,
            nftData: nft,
            metadata: this.nftMetadata.get(tokenKey),
            accessData: {
              defaultAccess: this.defaultAccess.get(tokenKey),
              maxAccess: this.maxAccess.get(tokenKey),
              userAccess: access
            }
          });
        }
      }
    }

    return userNFTs;
  }


  @view({})
  getNFTFullData({ collectionId, tokenId }: { collectionId: number; tokenId: number }): any {
    const tokenKey = this._getTokenKey(collectionId, tokenId);
    const nft = this.nftTokens.get(tokenKey);

    if (!nft) {
      near.panicUtf8(new TextEncoder().encode("NFT does not exist"));
    }

    const collection = this.collections.get(collectionId.toString());
    if (!collection) {
      near.panicUtf8(new TextEncoder().encode("Collection does not exist"));
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
  getCollectionNFTCount({ collectionId }: { collectionId: number }): number {
    let count = 0;
    const nextTokenId = this.nextTokenId.get(collectionId.toString()) || 1;

    for (let tokenId = 1; tokenId < nextTokenId; tokenId++) {
      const tokenKey = this._getTokenKey(collectionId, tokenId);
      if (this.nftTokens.get(tokenKey)) {
        count++;
      }
    }

    return count;
  }

  @view({})
  getCollectionUniqueHolders({ collectionId }: { collectionId: number }): number {
    const holders = new Set<string>();
    const nextTokenId = this.nextTokenId.get(collectionId.toString()) || 1;

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
