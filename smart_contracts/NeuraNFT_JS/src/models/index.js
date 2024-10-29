export {
    AccessLevel,
    AccessEntry,
    UserAccess
} from './access';

export {
    NFTInfo
} from './nft';

export {
    Metadata,
    Replica
} from './metadata';

export {
    CollectionMetadata
} from './collection';

// Helper object for constants
export const Constants = {
    // Storage Keys
    STORAGE_KEYS: {
        NFT_INFO: 'nft_info',
        METADATA: 'metadata',
        COLLECTIONS: 'collections',
        ACCESS_RIGHTS: 'access_rights',
        TOKEN_APPROVALS: 'token_approvals',
        OWNER_TOKENS: 'owner_tokens',
        COLLECTION_TOKENS: 'collection_tokens',
        BALANCE_COLLECTION: 'balance_collection'
    },
    
    // Access Control
    MIN_OWNERSHIP_LEVEL: 1,
    MAX_OWNERSHIP_LEVEL: 6,
    
    // System Limits
    MAX_TOKENS_PER_COLLECTION: 1000000,
    MAX_METADATA_SIZE: 10000
};