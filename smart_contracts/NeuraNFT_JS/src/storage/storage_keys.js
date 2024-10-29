// storage/storage_keys.js
export const StorageKeys = {
    // NFT Core Storage
    NFT_TOKENS: 'nft_tokens',              // collectionId_tokenId -> NFTInfo
    NFT_METADATA: 'nft_metadata',          // collectionId_tokenId -> Metadata
    NFT_OWNERS: 'nft_owners',              // accountId -> Set<collectionId_tokenId>
    TOKEN_APPROVALS: 'token_approvals',    // collectionId_tokenId -> Set<accountId>
    OPERATOR_APPROVALS: 'operator_approvals', // accountId_operatorId -> bool

    // Collection Storage
    COLLECTIONS: 'collections',             // collectionId -> CollectionMetadata
    COLLECTION_TOKENS: 'collection_tokens', // collectionId -> Set<tokenId>
    COLLECTION_COUNTS: 'collection_counts', // collectionId -> number
    NEXT_TOKEN_ID: 'next_token_id',        // collectionId -> number

    // Balance Storage
    TOKEN_BALANCES: 'token_balances',      // accountId -> number
    COLLECTION_BALANCES: 'collection_balances', // accountId_collectionId -> number

    // Access Control Storage
    NFT_ACCESS: 'nft_access',              // collectionId_tokenId_accountId -> AccessLevel
    DEFAULT_ACCESS: 'default_access',       // collectionId_tokenId -> AccessLevel
    MAX_ACCESS: 'max_access',              // collectionId_tokenId -> AccessLevel
    USER_ACCESS_LIST: 'user_access_list',  // accountId -> AccessEntry[]
    NFT_ACCESS_LIST: 'nft_access_list',    // collectionId_tokenId -> UserAccess[]
};