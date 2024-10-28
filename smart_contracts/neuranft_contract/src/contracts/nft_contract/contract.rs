use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{
    env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, Promise, PromiseOrValue,
};

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    NFTInfo,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct NFTContract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    master_access: AccountId,
    nft_access_control: AccountId,
    nft_info: UnorderedMap<TokenId, NFTInfo>,
    collection_nft_count: UnorderedMap<String, u64>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct NFTInfo {
    pub level_of_ownership: u8,
    pub name: String,
    pub creator: AccountId,
    pub creation_date: u64,
    pub owner: AccountId,
}

#[near_bindgen]
impl NFTContract {
    #[init]
    pub fn new(
        master_access: AccountId,
        nft_access_control: AccountId,
        metadata: NFTContractMetadata,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                master_access.clone(),
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            master_access,
            nft_access_control,
            nft_info: UnorderedMap::new(StorageKey::NFTInfo),
            collection_nft_count: UnorderedMap::new(b"cc"),
        }
    }

    #[payable]
    pub fn nft_mint(
        &mut self,
        collection_id: String,
        token_id: TokenId,
        receiver_id: AccountId,
        token_metadata: TokenMetadata,
        level_of_ownership: u8,
        name: String,
    ) -> Token {
        assert!(
            level_of_ownership > 0 && level_of_ownership <= 6,
            "Invalid level of ownership"
        );

        // Increment collection NFT count
        let current_count = self.collection_nft_count.get(&collection_id).unwrap_or(0);
        self.collection_nft_count.insert(&collection_id, &(current_count + 1));

        // Create NFT info
        let nft_info = NFTInfo {
            level_of_ownership,
            name,
            creator: env::predecessor_account_id(),
            creation_date: env::block_timestamp(),
            owner: receiver_id.clone(),
        };
        self.nft_info.insert(&token_id, &nft_info);

        // Mint the NFT
        self.tokens.internal_mint(token_id, receiver_id, Some(token_metadata))
    }

    pub fn nft_burn(&mut self, collection_id: String, token_id: TokenId) {
        let owner_id = self.tokens.owner_by_id.get(&token_id).expect("No token owner");
        assert_eq!(
            env::predecessor_account_id(),
            owner_id,
            "Only token owner can burn"
        );

        // Decrease collection NFT count
        if let Some(current_count) = self.collection_nft_count.get(&collection_id) {
            if current_count > 0 {
                self.collection_nft_count.insert(&collection_id, &(current_count - 1));
            }
        }

        // Remove NFT info
        self.nft_info.remove(&token_id);

        // Burn the token
        self.tokens.internal_burn(&token_id, &Some(owner_id));
    }

    pub fn get_nft_info(&self, token_id: TokenId) -> Option<NFTInfo> {
        self.nft_info.get(&token_id)
    }

    pub fn get_collection_nft_count(&self, collection_id: String) -> u64 {
        self.collection_nft_count.get(&collection_id).unwrap_or(0)
    }
}

near_contract_standards::impl_non_fungible_token_core!(NFTContract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(NFTContract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(NFTContract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for NFTContract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}